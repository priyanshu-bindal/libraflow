'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { canRenew } from '@/lib/utils';

export async function issueBook(memberId: string, bookId: string) {
  try {
    // 1. Check if book exists and is available
    const book = await db.book.findUnique({
      where: { id: bookId },
      select: { availableCopies: true },
    });

    if (!book) {
      return { success: false, message: 'Book not found in the catalogue.' };
    }

    if (book.availableCopies <= 0) {
      return { success: false, message: 'This book is currently out of stock.' };
    }

    // 2. Check Member Limits (Max 3 active loans)
    const activeLoansCount = await db.transaction.count({
      where: {
        userId: memberId,
        status: 'ISSUED',
      },
    });

    if (activeLoansCount >= 3) {
      return { 
        success: false, 
        message: 'Member has reached the maximum borrowing limit of 3 active loans.' 
      };
    }

    // 3. Check for unpaid fines
    const hasUnpaidFines = await db.fine.findFirst({
      where: {
        transaction: {
          userId: memberId,
        },
        paid: false,
      },
    });

    if (hasUnpaidFines) {
      return { 
        success: false, 
        message: 'Member has an unpaid fine. Blocked from borrowing.' 
      };
    }

    // 4. Perform the transactional update
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days from now

    await db.$transaction([
      // Create the transaction
      db.transaction.create({
        data: {
          userId: memberId,
          bookId: bookId,
          status: 'ISSUED',
          issueDate: new Date(),
          dueDate: dueDate,
        },
      }),
      // Decrement the book copies
      db.book.update({
        where: { id: bookId },
        data: {
          availableCopies: {
            decrement: 1,
          },
        },
      }),
    ]);

    // Clear caches to refresh dashboard and table views
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/books');
    revalidatePath('/dashboard/transactions');

    return { success: true, message: 'Book successfully issued!' };

  } catch (error) {
    console.error('Failed to issue book:', error);
    return { success: false, message: 'Internal server error while issuing book.' };
  }
}

export async function issueBookDirectly(bookId: string, userId: string) {
  try {
    const book = await db.book.findUnique({
      where: { id: bookId },
      select: { availableCopies: true },
    });

    if (!book || book.availableCopies <= 0) {
      return { success: false, error: 'No copies available' };
    }

    const activeLoans = await db.transaction.count({
      where: { userId, status: 'ISSUED' }
    });

    if (activeLoans >= 3) {
      return { success: false, error: 'Member has reached borrowing limit' };
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    await db.$transaction([
      db.transaction.create({
        data: {
          userId,
          bookId,
          status: 'ISSUED',
          issueDate: new Date(),
          dueDate
        }
      }),
      db.book.update({
        where: { id: bookId },
        data: { availableCopies: { decrement: 1 } }
      })
    ]);

    revalidatePath(`/dashboard/books/${bookId}`, 'page');
    revalidatePath('/dashboard/transactions');

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to issue book' };
  }
}

export async function renewBookAction(transactionId: string) {
  try {
    const transaction = await db.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return { success: false, message: 'Transaction not found.' };
    }

    if (transaction.status !== 'ISSUED' && transaction.status !== 'OVERDUE') {
       return { success: false, message: 'Only active loans can be renewed.' };
    }

    if (!canRenew(transaction.dueDate)) {
      throw new Error('This loan is not yet eligible for renewal. Please try again closer to the due date.');
    }

    const hasUnpaidFines = await db.fine.findFirst({
      where: {
        userId: transaction.userId,
        paid: false
      }
    });

    if (hasUnpaidFines) {
      return { success: false, message: 'Outstanding fine must be paid before renewal.', hasFine: true, fineAmount: hasUnpaidFines.amount };
    }

    const settings = await db.globalSettings.findUnique({ where: { id: 'default' }});
    const renewalLimit = settings?.renewalLimit ?? 2;
    const loanPeriodDays = settings?.loanPeriodDays ?? 14;

    if (transaction.renewalsUsed >= renewalLimit) {
      return { success: false, message: 'Renewal limit reached.' };
    }

    const newDueDate = new Date(transaction.dueDate);
    newDueDate.setDate(newDueDate.getDate() + loanPeriodDays);

    await db.transaction.update({
      where: { id: transactionId },
      data: {
        dueDate: newDueDate,
        renewalsUsed: {
          increment: 1
        },
        status: 'ISSUED'
      }
    });

    revalidatePath('/dashboard');
    revalidatePath(`/dashboard/members/${transaction.userId}`);
    revalidatePath('/dashboard/transactions');

    return { success: true, message: 'Loan successfully renewed.' };
  } catch (error) {
    console.error('Failed to renew book:', error);
    return { success: false, message: 'Internal server error while renewing book.' };
  }
}

export async function returnBookAction(transactionId: string) {
  try {
    const transaction = await db.transaction.findUnique({
      where: { id: transactionId },
      include: { book: true, user: true },
    });

    if (!transaction) {
      return { success: false, message: 'Transaction not found.' };
    }

    if (transaction.status !== 'ISSUED') {
      return { success: false, message: 'Transaction is already closed or not active.' };
    }

    const now = new Date();
    let fineAmount = 0;
    
    // Calculate Fine: ₹10 per day overdue
    if (now > transaction.dueDate) {
      const dueStart = new Date(transaction.dueDate).setHours(0,0,0,0);
      const nowStart = new Date(now).setHours(0,0,0,0);
      const diffTime = Math.abs(nowStart - dueStart);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      fineAmount = diffDays * 10;
    }

    await db.$transaction(async (tx) => {
      // 1. Update Transaction
      await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'RETURNED',
          returnDate: now,
        },
      });

      // 2. Increment Book Copies
      await tx.book.update({
        where: { id: transaction.bookId },
        data: { availableCopies: { increment: 1 } },
      });

      // 3. Create Fine if needed
      if (fineAmount > 0) {
        await tx.fine.create({
          data: {
            transactionId: transactionId,
            userId: transaction.userId,
            amount: fineAmount,
            reason: `Overdue fine for "${transaction.book.title}" (${fineAmount / 10} days at ₹10/day)`,
            paid: false,
          },
        });
      }
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/transactions');
    revalidatePath(`/dashboard/members/${transaction.userId}`);
    revalidatePath('/dashboard/activity');

    return { 
      success: true, 
      message: fineAmount > 0 
        ? `Book returned with ₹${fineAmount} overdue fine.` 
        : 'Book successfully returned.' 
    };

  } catch (error) {
    console.error('Failed to return book:', error);
    return { success: false, message: 'Internal server error while returning book.' };
  }
}

export async function searchActiveTransactions(query: string) {
  try {
    if (!query || query.trim().length === 0) return { success: true, data: [] };

    const transactions = await db.transaction.findMany({
      where: {
        status: 'ISSUED',
        OR: [
          { book: { title: { contains: query, mode: 'insensitive' } } },
          { user: { name: { contains: query, mode: 'insensitive' } } },
          { id: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        book: { select: { title: true, coverUrl: true } },
        user: { select: { name: true, membershipId: true } }
      },
      take: 5,
      orderBy: { issueDate: 'desc' }
    });

    return { success: true, data: transactions };
  } catch (error) {
    console.error('Failed to search transactions:', error);
    return { success: false, message: 'Failed to search active transactions.' };
  }
}

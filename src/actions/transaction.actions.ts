'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

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

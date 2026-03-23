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
    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/books');

    return { success: true, message: 'Book successfully issued!' };

  } catch (error) {
    console.error('Failed to issue book:', error);
    return { success: false, message: 'Internal server error while issuing book.' };
  }
}

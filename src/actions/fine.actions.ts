'use server'

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function calculateOverdueFines() {
  try {
    const overdueTransactions = await db.transaction.findMany({
      where: {
        status: 'ISSUED',
        dueDate: {
          lt: new Date()
        }
      },
      include: {
        fine: true
      }
    });

    for (const tx of overdueTransactions) {
      if (tx.fine?.paid) continue;

      const diffTime = Math.abs(new Date().getTime() - tx.dueDate.getTime());
      const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const amount = daysOverdue * 5; // ₹5 per day

      if (amount > 0) {
        await db.fine.upsert({
          where: { transactionId: tx.id },
          update: { amount },
          create: {
            transactionId: tx.id,
            userId: tx.userId,
            amount,
            reason: 'Overdue Book Penalty'
          }
        });
      }
    }

    revalidatePath('/dashboard/fines');
    return { success: true, count: overdueTransactions.length };
  } catch (error) {
    console.error('Failed to calculate fines:', error);
    return { success: false, error: 'Failed to compute fines natively' };
  }
}

export async function processFinePayment(fineId: string) {
  try {
    await db.fine.update({
      where: { id: fineId },
      data: {
        paid: true,
        paidAt: new Date()
      }
    });

    revalidatePath('/dashboard/fines', 'page');
    revalidatePath('/dashboard/members/[id]', 'page');

    return { success: true };
  } catch (error) {
    console.error('Payment Error:', error);
    return { success: false, error: 'Failed to process payment natively' };
  }
}

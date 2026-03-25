import { db } from "@/lib/db";
import ActivityClient from "./ActivityClient";

export const dynamic = 'force-dynamic';

export type ActivityEvent = {
  id: string;
  type: 'BORROW' | 'RETURN' | 'NEW_MEMBER' | 'OVERDUE' | 'FINE_PAID';
  date: string;
  memberId: string;
  memberName: string;
  bookTitle?: string;
  bookId?: string;
  dueDate?: string;
  fineAmount?: number;
};

export default async function ActivityPage() {
  const [recentTransactions, recentUsers, recentFines] = await Promise.all([
    db.transaction.findMany({
      take: 50,
      orderBy: { updatedAt: 'desc' },
      include: { user: true, book: true }
    }),
    db.user.findMany({
      where: { role: 'USER' },
      take: 50,
      orderBy: { createdAt: 'desc' }
    }),
    db.fine.findMany({
      where: { paid: true },
      take: 50,
      orderBy: { updatedAt: 'desc' },
      include: { user: true }
    })
  ]);

  const events: ActivityEvent[] = [];
  const now = new Date();

  recentTransactions.forEach(t => {
    if (t.status === 'RETURNED' && t.returnDate) {
      events.push({
        id: `ret-${t.id}`,
        type: 'RETURN',
        date: t.returnDate.toISOString(),
        memberId: t.userId,
        memberName: t.user.name,
        bookTitle: t.book.title,
        bookId: t.bookId
      });
    }

    // Both ISSUED and OVERDUE can be overdue computationally
    const isOverdue = new Date(t.dueDate) < now && (t.status === 'ISSUED' || t.status === 'OVERDUE');

    if (isOverdue) {
      events.push({
        id: `ovd-${t.id}`,
        type: 'OVERDUE',
        date: t.dueDate.toISOString(),
        memberId: t.userId,
        memberName: t.user.name,
        bookTitle: t.book.title,
        bookId: t.bookId,
        dueDate: t.dueDate.toISOString()
      });
    } else if (t.status === 'ISSUED') {
      events.push({
        id: `iss-${t.id}`,
        type: 'BORROW',
        date: t.issueDate.toISOString(),
        memberId: t.userId,
        memberName: t.user.name,
        bookTitle: t.book.title,
        bookId: t.bookId,
        dueDate: t.dueDate.toISOString()
      });
    }
  });

  recentUsers.forEach(u => {
    events.push({
      id: `usr-${u.id}`,
      type: 'NEW_MEMBER',
      date: u.createdAt.toISOString(),
      memberId: u.id,
      memberName: u.name
    });
  });

  recentFines.forEach(f => {
    events.push({
      id: `fin-${f.id}`,
      type: 'FINE_PAID',
      date: (f.paidAt || f.updatedAt).toISOString(),
      memberId: f.userId || '',
      memberName: f.user?.name || 'Unknown',
      fineAmount: Number(f.amount)
    });
  });

  // Sort and take top 50
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const top50Events = events.slice(0, 50);

  return <ActivityClient initialEvents={top50Events} totalEvents={events.length > 50 ? 50 : events.length} />;
}

import React from 'react';
import { db } from '@/lib/db';
import IssueBookClient from './IssueClient';

export default async function IssueBookPage() {
  const [members, books] = await Promise.all([
    db.user.findMany({
      where: { role: 'USER' },
      include: {
        _count: {
          select: {
            transactions: {
              where: { status: 'ISSUED' }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    }),
    db.book.findMany({
      where: { availableCopies: { gt: 0 } },
      orderBy: { title: 'asc' }
    })
  ]);

  return <IssueBookClient members={members} books={books} />;
}

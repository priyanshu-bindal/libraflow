import React from 'react';
import { db } from '@/lib/db';
import TransactionsClient from './TransactionsClient';

export const dynamic = 'force-dynamic';

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; tab?: string }>;
}) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams?.page) || 1;
  const search = resolvedParams?.search || '';
  const tab = resolvedParams?.tab?.toUpperCase() || 'ALL'; // ALL, ISSUED, RETURNED, OVERDUE
  const limit = 20;
  const skip = (page - 1) * limit;

  // Build the dynamic where clause for filtering
  const whereClause: any = {};

  if (tab === 'ISSUED') {
    whereClause.status = 'ISSUED';
  } else if (tab === 'RETURNED') {
    whereClause.status = 'RETURNED';
  } else if (tab === 'OVERDUE') {
    whereClause.status = 'ISSUED';
    whereClause.dueDate = { lt: new Date() };
  }

  if (search) {
    whereClause.OR = [
      { book: { title: { contains: search, mode: 'insensitive' } } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [transactions, totalMatched, overallCounts, overdueCount] = await Promise.all([
    db.transaction.findMany({
      where: whereClause,
      include: {
        user: true,
        book: true,
        fine: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    db.transaction.count({ where: whereClause }),
    db.transaction.groupBy({
      by: ['status'],
      _count: true,
    }),
    db.transaction.count({
      where: {
        status: 'ISSUED',
        dueDate: { lt: new Date() },
      },
    }),
  ]);

  const allCount = overallCounts.reduce((sum, item) => sum + item._count, 0);
  const issuedCount = overallCounts.find((c) => c.status === 'ISSUED')?._count || 0;
  const returnedCount = overallCounts.find((c) => c.status === 'RETURNED')?._count || 0;

  const serializedTransactions = transactions.map((t) => ({
    ...t,
    fine: t.fine ? {
      ...t.fine,
      amount: Number(t.fine.amount),
    } : null,
  }));

  return (
    <TransactionsClient
      transactions={serializedTransactions as any}
      totalMatched={totalMatched}
      currentPage={page}
      stats={{
        all: allCount,
        issued: issuedCount,
        returned: returnedCount,
        overdue: overdueCount,
      }}
      currentSearch={search}
      currentTab={tab}
    />
  );
}

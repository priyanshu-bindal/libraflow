import React from 'react';
import { db } from '@/lib/db';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import IssueChart from '@/components/charts/IssueChart';
import Link from 'next/link';

export default async function DashboardPage() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [
    totalBooks,
    activeMembers,
    issuedToday,
    overdue,
    recentTransactions,
    chartData
  ] = await Promise.all([
    db.book.count(),
    db.user.count({ where: { role: 'USER' } }),
    db.transaction.count({
      where: {
        issueDate: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    }),
    db.transaction.count({
      where: {
        status: 'ISSUED',
        dueDate: {
          lt: new Date()
        }
      }
    }),
    db.transaction.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: {
        user: true,
        book: true
      }
    }),
    Promise.all(
      Array.from({ length: 7 }).map(async (_, i) => {
        const date = subDays(new Date(), 6 - i);
        const count = await db.transaction.count({
          where: {
            status: 'ISSUED',
            issueDate: {
              gte: startOfDay(date),
              lte: endOfDay(date),
            },
          },
        });
        return { date: format(date, 'MMM dd'), count };
      })
    )
  ]);

  return (
    <main className="flex-1 overflow-y-auto p-8 space-y-8 relative">
      {/* BEGIN: KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#111111] border border-[#1F1F1F] p-6 rounded-xl">
          <p className="text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2">Total Books</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-white">{totalBooks.toLocaleString()}</h3>
            <span className="text-xs font-semibold text-green-500 mb-1">+2.5%</span>
          </div>
        </div>
        <div className="bg-[#111111] border border-[#1F1F1F] p-6 rounded-xl">
          <p className="text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2">Active Members</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-white">{activeMembers.toLocaleString()}</h3>
            <span className="text-xs font-semibold text-green-500 mb-1">+18</span>
          </div>
        </div>
        <div className="bg-[#111111] border border-[#1F1F1F] p-6 rounded-xl">
          <p className="text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2">Issued Today</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-white">{issuedToday}</h3>
            <span className="text-xs font-semibold text-slate-500 mb-1">Avg 38</span>
          </div>
        </div>
        <div className="bg-[#111111] border border-[#1F1F1F] p-6 rounded-xl relative overflow-hidden">
          <p className="text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2">Overdue</p>
          <div className="flex items-end justify-between relative z-10">
            <h3 className="text-3xl font-bold text-white">{overdue}</h3>
            {overdue > 0 && (
              <div className="flex items-center text-[#DC2626] gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" clipRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"></path>
                </svg>
                <span className="text-[10px] font-bold uppercase">Action Required</span>
              </div>
            )}
          </div>
          <svg className="absolute -bottom-2 -right-2 w-16 h-16 text-[#DC2626] opacity-10" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" clipRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"></path>
          </svg>
        </div>
      </div>
      {/* END: KPI Row */}

      {/* BEGIN: Charts & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">

        {/* Left Column: Charts */}
        <div className="lg:col-span-2 bg-[#111111] border border-[#1F1F1F] p-4 rounded-xl flex flex-col">
          <div className="flex items-center justify-between mb-0">
            <h4 className="text-lg font-bold text-white">Issue Trends</h4>
            <select className="bg-[#0A0A0A] border-[#1F1F1F] text-gray-400 text-xs rounded-md py-1 px-3 focus:ring-0 focus:border-[#DC2626]">
              <option>Last 7 Days</option>
            </select>
          </div>
          {/* Recharts Area Component */}
          <IssueChart data={chartData} />
        </div>

        {/* Right Column: Recent Activity Sticky */}
        <div className="bg-[#111111] border border-[#1F1F1F] p-4 rounded-xl flex flex-col self-start sticky top-8">
          <h4 className="text-lg font-bold text-white mb-3">Recent Activity</h4>
          <div className="flex-1 space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-gray-500">No recent activity.</p>
            ) : recentTransactions.slice(0, 3).map((tx) => (
              <div key={tx.id} className="flex gap-4">
                <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${tx.status === 'RETURNED' ? 'bg-[#DC2626]' : // Overdue logic mockup
                    tx.status === 'ISSUED' ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {tx.status === 'ISSUED' ? 'Book Issued' :
                      tx.status === 'RETURNED' ? 'Book Returned' : 'Book Overdue'}
                  </p>
                  <p className="text-xs text-gray-500">
                    &apos;{tx.book.title}&apos; by {tx.user.name}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-1">
                    {new Date(tx.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/dashboard/activity" className="mt-6 w-full py-2 bg-[#1F1F1F] hover:bg-[#2D2D2D] text-xs font-bold text-white rounded transition-colors uppercase tracking-widest text-center block">
            VIEW ALL
          </Link>
        </div>

      </div>
      {/* END: Charts & Activity Row */}

      {/* BEGIN: Transactions Table */}
      <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl overflow-hidden mt-6 shadow-sm">
        <div className="p-5 border-b border-[#1F1F1F] flex items-center justify-between">
          <h4 className="text-lg font-bold text-white">Recent Transactions</h4>
          <Link href="/dashboard/transactions" className="text-xs font-bold text-[#DC2626] hover:text-red-500 transition-colors uppercase tracking-wider">
            View More
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider bg-[#0C0C0C]">
                <th className="px-6 py-4">Book Title</th>
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4">Issue Date</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[#1F1F1F]">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#1A1A1A]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {tx.book.coverUrl ? (
                        <img src={tx.book.coverUrl} alt="Cover" className="w-10 h-14 rounded object-cover border border-[#1F1F1F]" />
                      ) : (
                        <div className="w-10 h-14 rounded bg-[#0A0A0A] border border-[#1F1F1F] flex items-center justify-center text-[10px] text-gray-600 font-medium">No Cover</div>
                      )}
                      <div>
                        <p className="font-bold text-white truncate max-w-[200px]">{tx.book.title}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{tx.book.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white font-medium truncate max-w-[150px]">{tx.user.name}</p>
                    <p className="text-xs text-gray-500">ID: #{tx.user.id.slice(0, 8)}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(tx.issueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className={`px-6 py-4 ${new Date(tx.dueDate) < new Date() && tx.status === 'ISSUED' ? 'text-[#DC2626] font-medium' : 'text-gray-400'}`}>
                    {new Date(tx.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    {tx.status === 'RETURNED' ? (
                      <span className="px-3 py-1 text-[10px] font-bold bg-blue-900/30 text-blue-400 border border-blue-800/50 rounded-full uppercase">Returned</span>
                    ) : new Date(tx.dueDate) < new Date() ? (
                      <span className="px-3 py-1 text-[10px] font-bold bg-red-900/30 text-[#DC2626] border border-red-800/50 rounded-full uppercase">Overdue</span>
                    ) : (
                      <span className="px-3 py-1 text-[10px] font-bold bg-green-900/30 text-green-500 border border-green-800/50 rounded-full uppercase">Issued</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-500 hover:text-white transition-colors">
                      <svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
                    </button>
                  </td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* END: Transactions Table */}
    </main>
  );
}

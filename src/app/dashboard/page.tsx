import React from 'react';
import { db } from '@/lib/db';
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
    recentTransactions
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
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        book: true
      }
    })
  ]);

  return (
    <main className="flex-1 overflow-y-auto p-8 space-y-8">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Issue Trends Bar Chart Card */}
        <div className="lg:col-span-2 bg-[#111111] border border-[#1F1F1F] p-6 rounded-xl">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-lg font-bold text-white">Issue Trends</h4>
            <select className="bg-[#0A0A0A] border-[#1F1F1F] text-gray-400 text-xs rounded-md py-1 px-3 focus:ring-0 focus:border-[#DC2626]">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="flex items-end justify-between h-[200px] gap-2 px-4">
            {/* Mockup Bars - Keeping these for now as charting is complex */}
            <div className="flex flex-col items-center flex-1 group">
              <div className="w-full bg-[#DC2626] opacity-40 group-hover:opacity-100 transition-all rounded-t-sm" style={{ height: '60%' }}></div>
              <span className="text-[10px] text-gray-500 mt-2">Mon</span>
            </div>
            <div className="flex flex-col items-center flex-1 group">
              <div className="w-full bg-[#DC2626] opacity-60 group-hover:opacity-100 transition-all rounded-t-sm" style={{ height: '85%' }}></div>
              <span className="text-[10px] text-gray-500 mt-2">Tue</span>
            </div>
            <div className="flex flex-col items-center flex-1 group">
              <div className="w-full bg-[#DC2626] opacity-40 group-hover:opacity-100 transition-all rounded-t-sm" style={{ height: '45%' }}></div>
              <span className="text-[10px] text-gray-500 mt-2">Wed</span>
            </div>
            <div className="flex flex-col items-center flex-1 group">
              <div className="w-full bg-[#DC2626] opacity-100 transition-all rounded-t-sm" style={{ height: '95%' }}></div>
              <span className="text-[10px] text-gray-500 mt-2">Thu</span>
            </div>
            <div className="flex flex-col items-center flex-1 group">
              <div className="w-full bg-[#DC2626] opacity-70 group-hover:opacity-100 transition-all rounded-t-sm" style={{ height: '75%' }}></div>
              <span className="text-[10px] text-gray-500 mt-2">Fri</span>
            </div>
            <div className="flex flex-col items-center flex-1 group">
              <div className="w-full bg-[#DC2626] opacity-30 group-hover:opacity-100 transition-all rounded-t-sm" style={{ height: '30%' }}></div>
              <span className="text-[10px] text-gray-500 mt-2">Sat</span>
            </div>
            <div className="flex flex-col items-center flex-1 group">
              <div className="w-full bg-[#DC2626] opacity-20 group-hover:opacity-100 transition-all rounded-t-sm" style={{ height: '20%' }}></div>
              <span className="text-[10px] text-gray-500 mt-2">Sun</span>
            </div>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="bg-[#111111] border border-[#1F1F1F] p-6 rounded-xl flex flex-col">
          <h4 className="text-lg font-bold text-white mb-6">Recent Activity</h4>
          <div className="flex-1 space-y-6">
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-gray-500">No recent activity.</p>
            ) : recentTransactions.map((tx) => (
              <div key={tx.id} className="flex gap-4">
                <div className={`w-2 h-2 mt-2 rounded-full ${
                  tx.status === 'ISSUED' ? 'bg-blue-500' :
                  tx.status === 'RETURNED' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {tx.status === 'ISSUED' ? 'Book Issued' :
                     tx.status === 'RETURNED' ? 'Book Returned' : 'Book Overdue'}
                  </p>
                  <p className="text-xs text-gray-500">
                    &apos;{tx.book.title}&apos; - {tx.user.name}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-1">
                    {new Date(tx.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* END: Charts & Activity Row */}
    </main>
  );
}

import React from 'react';
import { db } from '@/lib/db';
import PayFineButton from '@/components/fines/PayFineButton';
import Link from 'next/link';
import { Search, Filter } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function FinesManagementPage({
  searchParams
}: {
  searchParams?: { query?: string; status?: string; triggerAction?: string }
}) {
  const query = searchParams?.query || '';
  const statusFilter = searchParams?.status || 'ALL'; // 'UNPAID' or 'ALL'

  // Server Action Hook Trigger via searchParam (hack for native server form execution without client boundaries)
  if (searchParams?.triggerAction === 'calculate') {
     const { calculateOverdueFines } = await import('@/actions/fine.actions');
     await calculateOverdueFines();
     redirect('/dashboard/fines');
  }

  // AGGREGATIONS
  // 1. Total Outstanding (Unpaid)
  const outstandingAgg = await db.fine.aggregate({
    where: { paid: false },
    _sum: { amount: true }
  });
  const totalOutstanding = outstandingAgg._sum.amount ? Number(outstandingAgg._sum.amount) : 0;

  // 2. Collected This Month
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const collectedAgg = await db.fine.aggregate({
    where: { paid: true, paidAt: { gte: thirtyDaysAgo } },
    _sum: { amount: true }
  });
  const collectedMonth = collectedAgg._sum.amount ? Number(collectedAgg._sum.amount) : 0;

  // 3. Active Debtors
  const debtors = await db.fine.findMany({
    where: { paid: false, userId: { not: null } },
    distinct: ['userId'],
    select: { userId: true }
  });
  const activeDebtorsCount = debtors.length;

  // Fetch Fines
  const fines = await db.fine.findMany({
    where: {
      paid: statusFilter === 'UNPAID' ? false : undefined,
      user: query ? {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { membershipId: { contains: query, mode: 'insensitive' } }
        ]
      } : undefined
    },
    include: {
      user: true,
      transaction: { include: { book: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#050505]">
      {/* HEADER SECTION */}
      <div className="flex md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Fines Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track and collect overdue balances from members.</p>
        </div>
        
        {/* Ad-hoc Calculate Action Button */}
        <form action="/dashboard/fines" method="GET">
          <input type="hidden" name="triggerAction" value="calculate" />
          <button type="submit" className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#2D2D2D] rounded-lg text-sm font-bold text-white transition-colors">
            Calculate Overdue
          </button>
        </form>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#111111] to-[#0A0A0A] border border-[#1F1F1F] p-6 rounded-xl">
          <p className="text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2">Total Outstanding</p>
          <div className="flex items-end justify-between">
            <h3 className="text-4xl font-bold text-[#DC2626]">₹{totalOutstanding.toLocaleString('en-IN')}</h3>
            <span className="text-[10px] font-bold uppercase text-[#DC2626] bg-red-900/20 px-2 py-1 rounded">Unpaid</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#111111] to-[#0A0A0A] border border-[#1F1F1F] p-6 rounded-xl">
          <p className="text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2">Collected (30 Days)</p>
          <div className="flex items-end justify-between">
            <h3 className="text-4xl font-bold text-white">₹{collectedMonth.toLocaleString('en-IN')}</h3>
            <span className="text-[10px] font-bold uppercase text-green-500 bg-green-900/20 px-2 py-1 rounded">Secured</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#111111] to-[#0A0A0A] border border-[#1F1F1F] p-6 rounded-xl">
          <p className="text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2">Active Debtors</p>
          <div className="flex items-end justify-between">
            <h3 className="text-4xl font-bold text-white">{activeDebtorsCount}</h3>
            <span className="text-[10px] font-bold uppercase text-gray-400 bg-[#1A1A1A] px-2 py-1 rounded">Users</span>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl overflow-hidden shadow-sm">
        
        {/* Table Toolbar / Search */}
        <div className="p-5 border-b border-[#1F1F1F] flex sm:flex-row sm:items-center justify-between gap-4">
          <form className="flex-1 max-w-sm relative">
             <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
             <input 
                type="text" 
                name="query"
                defaultValue={query}
                placeholder="Search member name or ID..."
                className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg py-2 pl-9 pr-4 text-sm text-gray-300 focus:outline-none focus:border-[#DC2626]"
             />
             <input type="hidden" name="status" value={statusFilter} />
          </form>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Link 
               href={`/dashboard/fines?status=ALL${query ? `&query=${query}` : ''}`}
               className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${statusFilter === 'ALL' ? 'bg-[#DC2626] text-white' : 'bg-[#1A1A1A] text-gray-400 hover:text-white'}`}
            >
              ALL
            </Link>
            <Link 
               href={`/dashboard/fines?status=UNPAID${query ? `&query=${query}` : ''}`}
               className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${statusFilter === 'UNPAID' ? 'bg-[#DC2626] text-white' : 'bg-[#1A1A1A] text-gray-400 hover:text-white'}`}
            >
              UNPAID FILTER
            </Link>
          </div>
        </div>

        {/* The Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-[#4B5563] uppercase tracking-widest bg-[#0C0C0C]">
                <th className="px-6 py-4">Member Info</th>
                <th className="px-6 py-4">Book Context</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[#1F1F1F]">
              {fines.map((fine) => (
                <tr key={fine.id} className="hover:bg-[#1A1A1A]/50 transition-colors">
                  <td className="px-6 py-4">
                     <Link href={`/dashboard/members/${fine.userId}`} className="block hover:opacity-80 transition-opacity">
                        <p className="text-white font-medium">{fine.user?.name || 'Unknown User'}</p>
                        <p className="text-[11px] text-gray-500 font-mono mt-0.5">#{fine.user?.membershipId || fine.userId?.slice(0, 8)}</p>
                     </Link>
                  </td>
                  <td className="px-6 py-4">
                     <p className="text-gray-300 font-medium truncate max-w-[200px]">{fine.transaction.book.title}</p>
                     <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
                       {fine.reason || 'Overdue Book Penalty'}
                     </p>
                  </td>
                  <td className="px-6 py-4 text-lg font-bold">
                    <span className={fine.paid ? 'text-green-500/80' : 'text-[#DC2626]'}>
                      ₹{Number(fine.amount).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     {fine.paid ? (
                        <div className="flex flex-col items-start gap-1">
                          <span className="px-3 py-1 text-[10px] font-bold bg-green-900/20 text-green-500 border border-green-800/30 rounded-full uppercase">Collected</span>
                          <span className="text-[9px] text-gray-600 font-mono tracking-tighter">
                            {fine.paidAt ? new Date(fine.paidAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                     ) : (
                        <span className="px-3 py-1 text-[10px] font-bold bg-red-900/20 text-[#DC2626] border border-red-800/30 rounded-full uppercase shrink-0">Debt Active</span>
                     )}
                  </td>
                  <td className="px-6 py-4 text-right">
                     {!fine.paid ? (
                       <PayFineButton fineId={fine.id} />
                     ) : (
                       <span className="text-xs font-bold text-[#4B5563] tracking-widest uppercase">Cleared</span>
                     )}
                  </td>
                </tr>
              ))}

              {fines.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="w-16 h-16 bg-[#1A1A1A] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#2A2A2A]">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <p className="text-white font-medium text-lg">No Fines Found</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {query ? 'No matching records for your search.' : statusFilter === 'UNPAID' ? 'All members are currently clear of debt.' : 'There are no assessed fines yet.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

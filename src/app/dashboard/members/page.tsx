import Link from 'next/link';
import { db } from '@/lib/db';
import { Plus, Search, Eye, Edit, ChevronLeft, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MembersPage() {
  const members = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { transactions: { where: { status: 'ISSUED' } } },
      },
      transactions: {
        where: { status: 'ISSUED' },
        include: { fine: true }
      }
    },
  });

  // KPI Calculations
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m._count.transactions > 0).length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const suspendedMembers = members.filter(m => (m as any).accountStatus === 'SUSPENDED').length;

  return (
    <div className="p-8 space-y-12 max-w-7xl mx-auto w-full">

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111111] p-8 rounded-xl border border-white/5 group hover:border-red-600/30 transition-all">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Total Members</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{totalMembers}</span>
            <span className="text-green-500 text-xs font-bold">Accounts</span>
          </div>
        </div>
        <div className="bg-[#111111] p-8 rounded-xl border border-white/5 group hover:border-red-600/30 transition-all">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Active Members</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{activeMembers}</span>
            <span className="text-blue-400 text-xs font-bold">Borrowing</span>
          </div>
        </div>
        <div className="bg-[#111111] p-8 rounded-xl border border-white/5 group hover:border-red-600/30 transition-all">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Suspended</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-red-600">{suspendedMembers}</span>
            <span className="text-red-900 text-xs font-bold">Requires Action</span>
          </div>
        </div>
      </div>

      {/* Table Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-[#111111] p-4 rounded-xl">
        <div className="flex flex-wrap gap-2">
          <button className="px-6 py-2 rounded-lg bg-red-600 text-white text-sm font-bold transition-all">All</button>
          <button className="px-6 py-2 rounded-lg bg-[#0D0D0D] text-gray-400 hover:text-white text-sm font-medium transition-all">Active</button>
          <button className="px-6 py-2 rounded-lg bg-[#0D0D0D] text-gray-400 hover:text-white text-sm font-medium transition-all">Suspended</button>
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
          <select className="bg-[#0D0D0D] border-[#1F1F1F]/40 text-gray-400 rounded-lg text-sm px-4 py-2 focus:ring-red-600/50 focus:border-red-600 transition-all cursor-pointer">
            <option>Role: All</option>
            <option>User</option>
            <option>Librarian</option>
            <option>Admin</option>
          </select>
          <div className="relative flex-1 lg:w-80">
            <input className="w-full bg-[#0D0D0D] border border-[#1F1F1F]/40 text-white text-sm rounded-lg px-4 py-2 pl-10 focus:ring-red-600/50 focus:border-red-600 transition-all" placeholder="Search by name, email, or member ID..." type="text" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-[#111111] rounded-xl overflow-x-auto shadow-2xl">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-[#111111] border-b border-[#1F1F1F]/40">
              <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-gray-500">Member</th>
              <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-gray-500">Member ID</th>
              <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-gray-500">Role</th>
              <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-gray-500">Active Loans</th>
              <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-gray-500">Fine Balance</th>
              <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-gray-500">Status</th>
              <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F1F1F]/40">
            {members.map((member) => {

              // Calculate real fine balance
              let fineBalance = 0;
              member.transactions.forEach((t) => {
                if (t.fine && !t.fine.paid) {
                  fineBalance += Number(t.fine.amount);
                }
              });

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const isSuspended = (member as any).accountStatus === "SUSPENDED";
              const avatarUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(member.name || "")}`;

              let roleStyles = "bg-gray-800 text-gray-300";
              if (member.role === "LIBRARIAN") roleStyles = "bg-[#0078b2] text-white";

              return (
                <tr key={member.id} className={`hover:bg-[#161616] transition-colors group ${isSuspended ? 'bg-red-900/5' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-[#2a2a2a] border border-white/5 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400 font-mono">{member.membershipId?.substring(0, 8) || member.id.substring(0, 8)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${roleStyles}`}>
                      {member.role.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-medium">
                    <span className={member._count.transactions > 0 ? "text-red-400 font-black" : ""}>
                      {member._count.transactions}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold">
                    <span className={fineBalance > 0 ? "text-red-500" : "text-gray-500"}>
                      ₹{fineBalance.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {isSuspended ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                        Suspended
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-green-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/dashboard/members/${member.id}`} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <Eye className="w-5 h-5" />
                      </Link>
                      <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {members.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No members found in the database.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Skeleton */}
        <div className="px-6 py-6 border-t border-[#1F1F1F]/40 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <p className="text-sm text-gray-500 font-medium">Showing {members.length} members</p>
          <div className="flex gap-1">
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white/5 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="w-9 h-9 rounded-lg flex items-center justify-center bg-red-600 text-white font-bold text-sm">1</button>
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white/5 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

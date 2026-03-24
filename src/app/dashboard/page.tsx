import React from 'react';

// You can define a type matching your external REST API response here
type DashboardData = {
  totalBooks: number;
  booksGrowth: string;
  activeMembers: number;
  membersGrowth: string;
  issuedToday: number;
  issuedAvg: string;
  overdue: number;
  transactions: {
    id: string;
    bookTitle: string;
    author: string;
    member: string;
    memberId: string;
    issueDate: string;
    dueDate: string;
    status: 'Issued' | 'Overdue';
    thumbnail: string;
  }[];
};

export default async function DashboardPage() {
  // Example fetch() call that hits the external REST API.
  // Replace the URL with your actual backend endpoint.
  // We're providing placeholder data for the MVP so it renders safely.
  const dashboardData: DashboardData | null = null;
  
  /* 
  // Uncomment and replace the URL with your actual backend endpoint:
  try {
    const res = await fetch('https://api.example.com/dashboard/summary', {
      // next: { revalidate: 60 } // Next.js ISR (optional)
      cache: 'no-store' // Always fetch fresh data on load
    });
    
    if (res.ok) {
      dashboardData = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
  }
  */

  // Fallback data if the real endpoint is unavailable
  const data = dashboardData || {
    totalBooks: 12482,
    booksGrowth: '+2.5%',
    activeMembers: 1940,
    membersGrowth: '+18',
    issuedToday: 42,
    issuedAvg: 'Avg 38',
    overdue: 15,
    transactions: [
      {
        id: '1',
        bookTitle: 'Atomic Habits',
        author: 'James Clear',
        member: 'Michael Ross',
        memberId: '#LF-9821',
        issueDate: 'Oct 24, 2023',
        dueDate: 'Nov 07, 2023',
        status: 'Issued',
        thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSXLPpdsBANn1YrCMvVrjblS5YR6vIFTUshKH93bkNmo9xaCoeOhkYIa-aRNZldfrfJf42Nw6SHmOzq4FVccunXBh8NpBYhmFaomnVlZ-Fr-H4Ba7yetMbvwA_ux9okOcsH_RUc8Jk5HHggQlo8aksu5c6dmZpELcq6-v9Y_z-Cy1QO_hp8k9qbk7vq5N5mIRCc8BWDDETKYH_7u1T16_Mokfo7tF2ZWvO9jLSxXFqeSBFMSpop25BtoSZAJvM_rY_5qVVTetBnTc'
      },
      {
        id: '2',
        bookTitle: 'Deep Work',
        author: 'Cal Newport',
        member: 'Harvey Specter',
        memberId: '#LF-1022',
        issueDate: 'Oct 10, 2023',
        dueDate: 'Oct 24, 2023',
        status: 'Overdue',
        thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhFXkeOO0v0PAinBkkmlzgwjBHXGbbj6Ux0CbGVHO4A-lK7mWO2QFBzJtpVf6nJ3Rq--m6qIBCu34XbqVaif1U7PzsFB7MotUrJ-NgCxDoHEDZE7yh_uVGnwjynX6MCKwB4LsHgw76QV3jkFPI4DzvsxJeulIVcVNsR7hbqGw9kWVvlgdYPfxbQS4XtDs4u5KAED0mi8ciJGixXnhx7VFej9rl5gehme8O49Q-TsPRPghNrOvg42l0uVCExGkN4ssryHVFovSF_Ac'
      }
    ]
  };

  return (
    <main className="flex-1 overflow-y-auto p-8 space-y-8">
      {/* BEGIN: KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#111111] border border-[#1F1F1F] p-6 rounded-xl">
          <p className="text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2">Total Books</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-white">{data.totalBooks.toLocaleString()}</h3>
            <span className="text-xs font-semibold text-green-500 mb-1">{data.booksGrowth}</span>
          </div>
        </div>
        <div className="bg-[#111111] border border-[#1F1F1F] p-6 rounded-xl">
          <p className="text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2">Active Members</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-white">{data.activeMembers.toLocaleString()}</h3>
            <span className="text-xs font-semibold text-green-500 mb-1">{data.membersGrowth}</span>
          </div>
        </div>
        <div className="bg-[#111111] border border-[#1F1F1F] p-6 rounded-xl">
          <p className="text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2">Issued Today</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-white">{data.issuedToday}</h3>
            <span className="text-xs font-semibold text-slate-500 mb-1">{data.issuedAvg}</span>
          </div>
        </div>
        <div className="bg-[#111111] border border-[#1F1F1F] p-6 rounded-xl relative overflow-hidden">
          <p className="text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2">Overdue</p>
          <div className="flex items-end justify-between relative z-10">
            <h3 className="text-3xl font-bold text-white">{data.overdue}</h3>
            <div className="flex items-center text-[#DC2626] gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" clipRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"></path>
              </svg>
              <span className="text-[10px] font-bold uppercase">Action Required</span>
            </div>
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
            {/* Mockup Bars */}
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
            <div className="flex gap-4">
              <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
              <div>
                <p className="text-sm font-semibold text-white">Book Returned</p>
                <p className="text-xs text-gray-500">'The Great Gatsby' by John Doe</p>
                <p className="text-[10px] text-gray-600 mt-1">2 mins ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
              <div>
                <p className="text-sm font-semibold text-white">New Membership</p>
                <p className="text-xs text-gray-500">Sarah Jenkins joined as Gold Member</p>
                <p className="text-[10px] text-gray-600 mt-1">15 mins ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-2 mt-2 rounded-full bg-[#DC2626]"></div>
              <div>
                <p className="text-sm font-semibold text-white">Overdue Alert</p>
                <p className="text-xs text-gray-500">Book ID #4492 is 3 days overdue</p>
                <p className="text-[10px] text-gray-600 mt-1">45 mins ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-2 mt-2 rounded-full bg-gray-600"></div>
              <div>
                <p className="text-sm font-semibold text-white">Stock Update</p>
                <p className="text-xs text-gray-500">5 copies of 'Clean Code' added</p>
                <p className="text-[10px] text-gray-600 mt-1">2 hours ago</p>
              </div>
            </div>
          </div>
          <button className="mt-6 w-full py-2 bg-[#1F1F1F] hover:bg-[#2D2D2D] text-xs font-bold text-white rounded transition-colors uppercase tracking-widest">View All</button>
        </div>
      </div>
      {/* END: Charts & Activity Row */}

      {/* BEGIN: Transactions Table */}
      <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[#1F1F1F]">
          <h4 className="text-lg font-bold text-white">Recent Transactions</h4>
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
              {data.transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={transaction.thumbnail} alt="Book Thumb" className="w-10 h-14 rounded object-cover border border-[#1F1F1F]" />
                      <div>
                        <p className="font-bold text-white">{transaction.bookTitle}</p>
                        <p className="text-xs text-gray-500">{transaction.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{transaction.member}</p>
                    <p className="text-xs text-gray-500">ID: {transaction.memberId}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{transaction.issueDate}</td>
                  <td className={`px-6 py-4 ${transaction.status === 'Overdue' ? 'text-[#DC2626] font-medium' : 'text-gray-400'}`}>
                    {transaction.dueDate}
                  </td>
                  <td className="px-6 py-4">
                    {transaction.status === 'Issued' ? (
                      <span className="px-3 py-1 text-[10px] font-bold bg-green-900/30 text-green-500 border border-green-800/50 rounded-full uppercase">Issued</span>
                    ) : (
                      <span className="px-3 py-1 text-[10px] font-bold bg-red-900/30 text-[#DC2626] border border-red-800/50 rounded-full uppercase">Overdue</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-500 hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* END: Transactions Table */}

    </main>
  );
}

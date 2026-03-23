import React from 'react';

export default function Topbar() {
  return (
    <header className="h-16 bg-[#111111] border-b border-[#1F1F1F] flex items-center justify-between px-8 z-10 shrink-0">
      <h1 className="text-xl font-bold text-white">Dashboard</h1>
      
      {/* Search Bar */}
      <div className="flex-1 max-w-xl px-12">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input type="text" className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg py-2 pl-10 pr-4 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#DC2626] focus:border-[#DC2626] transition-all" placeholder="Search library..." />
        </div>
      </div>

      {/* Right Notifications */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#DC2626] border-2 border-[#111111] rounded-full text-[10px] font-bold text-white flex items-center justify-center">3</span>
        </button>
      </div>
    </header>
  );
}

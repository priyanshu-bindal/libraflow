 
import React from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth';

export default async function Sidebar() {
  const session = await auth();
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';

  return (
    <aside className="w-[240px] h-full bg-[#111111] border-r border-[#1F1F1F] flex flex-col flex-shrink-0">
      {/* Brand Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#DC2626] rounded flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
        </div>
        <span className="text-[#DC2626] font-bold text-xl tracking-tight">LibraFlow</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-0 py-4 space-y-8 overflow-y-auto">
        {/* General Section */}
        <section>
          <div className="px-6 mb-2 text-[10px] font-bold text-[#4B5563] uppercase tracking-widest">General</div>
          <ul className="space-y-1">
            <li>
              <Link href="/dashboard" className="flex items-center px-6 py-3 text-sm font-medium transition-colors bg-[#1A0A0A] border-l-[3px] border-[#DC2626] text-[#DC2626]">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/dashboard/books" className="flex items-center px-6 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-[#1A1A1A] transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                Books
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center px-6 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-[#1A1A1A] transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
                Members
              </Link>
            </li>
          </ul>
        </section>

        {/* Operations Section */}
        <section>
          <div className="px-6 mb-2 text-[10px] font-bold text-[#4B5563] uppercase tracking-widest">Operations</div>
          <ul className="space-y-1">
            <li>
              <Link href="/dashboard/transactions/issue" className="flex items-center px-6 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-[#1A1A1A] transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                </svg>
                Issue Book
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center px-6 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-[#1A1A1A] transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h3m8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3m7 4l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                Return Book
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center px-6 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-[#1A1A1A] transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Fines
              </Link>
            </li>
          </ul>
        </section>

        {/* System Section */}
        {isSuperAdmin && (
          <section>
            <div className="px-6 mb-2 text-[10px] font-bold text-[#4B5563] uppercase tracking-widest">System</div>
            <ul className="space-y-1">
              <li>
                <Link href="#" className="flex items-center px-6 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-[#1A1A1A] transition-colors">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Reports
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center px-6 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-[#1A1A1A] transition-colors">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  Settings
                </Link>
              </li>
            </ul>
          </section>
        )}
      </nav>

      {/* Sidebar Bottom User */}
      <div className="p-4 border-t border-[#1F1F1F]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-[#1F1F1F] bg-[#1F1F1F] flex items-center justify-center text-white font-bold text-lg">
            {session?.user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{session?.user?.name || 'User'}</p>
            <p className="text-[11px] text-[#6B7280] truncate">{session?.user?.email}</p>
          </div>
        </div>
        <div className="mt-3">
          <span className="inline-block px-2 py-1 text-[10px] font-bold text-white bg-[#1F1F1F] rounded-md tracking-wider">
            {session?.user?.role?.replace('_', ' ') || 'USER'}
          </span>
        </div>
      </div>
    </aside>
  );
}

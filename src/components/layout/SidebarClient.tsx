"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, Menu, X, LayoutDashboard, Library, Users, ArrowRightLeft, Undo2, ReceiptText, BarChart3, Settings } from 'lucide-react';

interface SidebarClientProps {
  user: any;
  isSuperAdmin: boolean;
  libraryName?: string;
}

export default function SidebarClient({ user, isSuperAdmin, libraryName = 'LibraFlow' }: SidebarClientProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Hamburger Toggle (Visible only on mobile) */}
      <button 
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-3 left-4 z-[40] p-2 bg-[#111111] border border-[#1F1F1F] rounded-lg text-white shadow-md hover:bg-[#1A1A1A] transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-[45]" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Aside */}
      <aside 
        className={`fixed md:relative top-0 left-0 h-full bg-[#111111] border-r border-[#1F1F1F] flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out z-[50] ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${isCollapsed ? 'md:w-20' : 'md:w-[240px]'} w-[240px]`}
      >
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-6 w-6 h-6 bg-[#1F1F1F] border border-[#2A2A2A] rounded-full items-center justify-center text-gray-400 hover:text-white shadow-md z-10 transition-transform"
        >
          <ChevronLeft size={14} className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>

        {/* Brand Logo */}
        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3'} transition-all`}>
          <div className="w-8 h-8 bg-[#DC2626] rounded flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          </div>
          <span className={`text-[#DC2626] font-bold text-xl tracking-tight transition-opacity duration-300 truncate ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>{libraryName}</span>
          
          {/* Mobile Close Button */}
          <button 
            className="md:hidden ml-auto p-1 text-gray-400 hover:text-white"
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-0 py-4 space-y-8 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {/* General Section */}
          <section>
            <div className={`px-6 mb-2 text-[10px] font-bold text-[#4B5563] uppercase tracking-widest transition-opacity duration-300 ${isCollapsed ? 'opacity-0 text-center px-0 h-0 overflow-hidden' : 'opacity-100'}`}>General</div>
            <ul className="space-y-1">
              <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" isCollapsed={isCollapsed} active={pathname === '/dashboard'} />
              <NavItem href="/dashboard/books" icon={<Library size={20} />} label="Books" isCollapsed={isCollapsed} active={pathname === '/dashboard/books' || pathname?.startsWith('/dashboard/books/')} />
              <NavItem href="/dashboard/members" icon={<Users size={20} />} label="Members" isCollapsed={isCollapsed} active={pathname === '/dashboard/members' || pathname?.startsWith('/dashboard/members/')} />
            </ul>
          </section>

          {/* Operations Section */}
          <section>
            <div className={`px-6 mb-2 text-[10px] font-bold text-[#4B5563] uppercase tracking-widest transition-opacity duration-300 ${isCollapsed ? 'opacity-0 text-center px-0 h-0 overflow-hidden' : 'opacity-100'}`}>Operations</div>
            <ul className="space-y-1">
              <NavItem href="/dashboard/transactions/issue" icon={<ArrowRightLeft size={20} />} label="Issue Book" isCollapsed={isCollapsed} active={pathname?.startsWith('/dashboard/transactions/issue')} />
              <NavItem href="/dashboard/transactions/return" icon={<Undo2 size={20} />} label="Return Book" isCollapsed={isCollapsed} active={pathname?.startsWith('/dashboard/transactions/return')} />
              <NavItem href="/dashboard/fines" icon={<ReceiptText size={20} />} label="Fines" isCollapsed={isCollapsed} active={pathname === '/dashboard/fines' || pathname?.startsWith('/dashboard/fines/')} />
            </ul>
          </section>

          {/* System Section */}
          {isSuperAdmin && (
            <section>
              <div className={`px-6 mb-2 text-[10px] font-bold text-[#4B5563] uppercase tracking-widest transition-opacity duration-300 ${isCollapsed ? 'opacity-0 text-center px-0 h-0 overflow-hidden' : 'opacity-100'}`}>System</div>
              <ul className="space-y-1">
                <NavItem href="#" icon={<BarChart3 size={20} />} label="Reports" isCollapsed={isCollapsed} active={pathname === '#reports'} />
                <NavItem href="/dashboard/settings" icon={<Settings size={20} />} label="Settings" isCollapsed={isCollapsed} active={pathname === '#settings'} />
              </ul>
            </section>
          )}
        </nav>

        {/* Sidebar Bottom User */}
        <div className={`p-4 border-t border-[#1F1F1F] transition-all`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-10 h-10 rounded-full border border-[#1F1F1F] bg-[#1F1F1F] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden transition-opacity duration-300">
                <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
                <p className="text-[11px] text-[#6B7280] truncate">{user?.email}</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="mt-3 text-center md:text-left transition-opacity duration-300">
              <span className="inline-block px-2 py-1 text-[10px] font-bold text-white bg-[#1F1F1F] rounded-md tracking-wider">
                {user?.role?.replace('_', ' ') || 'USER'}
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

// NavItem Helper Component with Tooltip
function NavItem({ href, icon, label, isCollapsed, active }: { href: string; icon: React.ReactNode; label: string; isCollapsed: boolean; active: boolean }) {
  return (
    <li className="relative group">
      <Link 
        href={href} 
        className={`flex items-center py-3 transition-colors ${isCollapsed ? 'justify-center' : 'px-6'} ${active ? 'bg-[#1A0A0A] border-l-[3px] border-[#DC2626] text-[#DC2626]' : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A] border-l-[3px] border-transparent'}`}
      >
        <span className={`${isCollapsed ? '' : 'mr-3'}`}>{icon}</span>
        {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
      </Link>
      
      {/* Tooltip */}
      {isCollapsed && (
        <div className="absolute left-[85px] top-1/2 -translate-y-1/2 bg-[#1F1F1F] border border-[#2A2A2A] text-white text-xs px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] whitespace-nowrap shadow-xl">
          {label}
        </div>
      )}
    </li>
  );
}

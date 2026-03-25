"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Download, Search, Calendar, ChevronDown, UserPlus, ChevronRight, CheckCircle, Circle, AlertTriangle, Receipt } from 'lucide-react';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';
import type { ActivityEvent } from './page';

interface ActivityClientProps {
  initialEvents: ActivityEvent[];
  totalEvents: number;
}

export default function ActivityClient({ initialEvents, totalEvents }: ActivityClientProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [dateFilter, setDateFilter] = useState<'All Time' | 'Today' | 'Yesterday' | 'Last 7 Days' | 'Last 30 Days'>('All Time');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const tabs = ['All', 'Borrowing', 'Returns', 'Members'];

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,Type,Date,Member,Book\n"
      + initialEvents.map(e => `${e.type},${e.date},${e.memberName},${e.bookTitle || ''}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "library_activity_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEvents = useMemo(() => {
    return initialEvents.filter(event => {
      // Tab filter
      if (activeTab === 'Borrowing' && event.type !== 'BORROW' && event.type !== 'OVERDUE') return false;
      if (activeTab === 'Returns' && event.type !== 'RETURN') return false;
      if (activeTab === 'Members' && event.type !== 'NEW_MEMBER') return false;

      // Search filter
      if (search) {
        const query = search.toLowerCase();
        const matchName = event.memberName.toLowerCase().includes(query);
        const matchBook = event.bookTitle?.toLowerCase().includes(query) || false;
        const matchType = event.type.toLowerCase().includes(query);
        if (!matchName && !matchBook && !matchType) return false;
      }

      // Date filter
      const eventDate = new Date(event.date);
      const today = new Date();
      if (dateFilter === 'Today' && !isToday(eventDate)) return false;
      if (dateFilter === 'Yesterday' && !isYesterday(eventDate)) return false;
      if (dateFilter === 'Last 7 Days' && differenceInDays(today, eventDate) > 7) return false;
      if (dateFilter === 'Last 30 Days' && differenceInDays(today, eventDate) > 30) return false;

      return true;
    });
  }, [initialEvents, search, activeTab, dateFilter]);

  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEvents.slice(start, start + itemsPerPage);
  }, [filteredEvents, currentPage]);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  const groupedEvents = useMemo(() => {
    const groups: Record<string, ActivityEvent[]> = {
      'TODAY': [],
      'YESTERDAY': [],
      'OLDER': []
    };

    paginatedEvents.forEach(event => {
      const date = new Date(event.date);
      if (isToday(date)) {
        groups['TODAY'].push(event);
      } else if (isYesterday(date)) {
        groups['YESTERDAY'].push(event);
      } else {
        groups['OLDER'].push(event);
      }
    });

    return groups;
  }, [paginatedEvents]);

  const getHoverBorderColor = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'RETURN': return 'hover:border-green-500';
      case 'BORROW': return 'hover:border-blue-400';
      case 'NEW_MEMBER': return 'hover:border-purple-500';
      case 'OVERDUE': return 'hover:border-red-600';
      case 'FINE_PAID': return 'hover:border-emerald-500';
      default: return 'hover:border-gray-500';
    }
  };

  const renderEventIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'RETURN':
        return (
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
            <CheckCircle className="w-5 h-5" />
          </div>
        );
      case 'BORROW':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-400/10 flex items-center justify-center text-blue-400">
            <Circle className="w-5 h-5" />
          </div>
        );
      case 'NEW_MEMBER':
        return (
          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
            <UserPlus className="w-5 h-5" />
          </div>
        );
      case 'OVERDUE':
        return (
          <div className="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center text-red-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      case 'FINE_PAID':
        return (
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Receipt className="w-5 h-5" />
          </div>
        );
    }
  };

  const renderEventText = (event: ActivityEvent) => {
    switch (event.type) {
      case 'RETURN':
        return (
          <p className="text-sm text-gray-300">
            <span className="font-semibold text-white">{event.memberName}</span> returned '<span className="italic text-white">{event.bookTitle}</span>'
          </p>
        );
      case 'BORROW':
        return (
          <p className="text-sm text-gray-300">
            <span className="font-semibold text-white">{event.memberName}</span> borrowed '<span className="italic text-white">{event.bookTitle}</span>'. {event.dueDate && `Due ${format(new Date(event.dueDate), 'MMM dd, yyyy')}.`}
          </p>
        );
      case 'NEW_MEMBER':
        return (
          <p className="text-sm text-gray-300">
            New membership approved for <span className="font-semibold text-white">{event.memberName}</span>.
          </p>
        );
      case 'OVERDUE': {
        const diff = differenceInDays(new Date(), new Date(event.dueDate!));
        const days = diff > 0 ? diff : 0;
        return (
          <p className="text-sm text-gray-200">
            Overdue alert triggered for <span className="font-bold text-white">{event.memberName}</span>: <span className="font-bold text-white italic">"{event.bookTitle}"</span>
          </p>
        );
      }
      case 'FINE_PAID':
        return (
          <p className="text-sm text-gray-300">
            <span className="font-semibold text-white">{event.memberName}</span> paid a fine of ₹{event.fineAmount?.toFixed(2)}.
          </p>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full bg-[#050505]">
      <main className="flex-1 overflow-y-auto p-8 text-white relative">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8 z-10 relative">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Recent Activity</h1>
            <p className="text-gray-500 text-sm mt-1">Detailed log of all library operations and system events.</p>
          </div>
          <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 bg-[#111111] border border-[#1F1F1F] hover:bg-[#1A1A1A] rounded-xl text-sm font-semibold transition-colors shadow-lg">
            <Download className="w-4 h-4 text-red-500" /> Export Log
          </button>
        </div>

        {/* Controls Row */}
        <div className="flex lg:flex-row gap-4 items-center justify-between mb-10 relative z-30">
          <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search activity, books, or members..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full bg-[#111111] border border-[#1F1F1F] rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-1 focus:ring-red-600/50 transition-all text-sm outline-none" 
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto no-scrollbar">
            {tabs.map((tab) => (
              <button 
                key={tab} 
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-[#DC2626] text-white font-semibold' : 'bg-[#111111] text-gray-400 hover:text-white border border-[#1F1F1F] font-medium'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-auto">
            <button 
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              onBlur={() => setTimeout(() => setIsDatePickerOpen(false), 200)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#111111] border border-[#1F1F1F] rounded-lg text-gray-300 hover:text-white transition-all text-sm w-full lg:w-auto justify-center"
            >
              <Calendar className="w-4 h-4 text-gray-500" /> {dateFilter} <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDatePickerOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDatePickerOpen && (
              <div className="absolute right-0 top-full mt-2 w-full lg:w-48 bg-[#111111] border border-[#1F1F1F] rounded-lg shadow-xl z-50 overflow-hidden">
                {['All Time', 'Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days'].map((filter) => (
                  <button
                    key={filter}
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevents the main button from losing focus before onClick fires!
                      setDateFilter(filter as any);
                      setIsDatePickerOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${dateFilter === filter ? 'text-[#DC2626] font-semibold bg-[#1A1A1A]' : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'}`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-12 z-10 relative">
          {Object.entries(groupedEvents).map(([groupTitle, eventsInGroup]) => {
            if (eventsInGroup.length === 0) return null;
            return (
              <div key={groupTitle}>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-6 px-1">{groupTitle}</h3>
                <div className="space-y-3">
                  {eventsInGroup.map((event, index) => (
                    <div key={event.id} className={`group flex  sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl transition-all border-l-4 border-transparent ${index % 2 === 0 ? 'bg-[#111111]' : 'bg-[#0A0A0A]'} hover:bg-[#1A1A1A] ${getHoverBorderColor(event.type)}`}>
                      <div className="flex items-center gap-4">
                        {renderEventIcon(event.type)}
                        <div>
                          {renderEventText(event)}
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(event.date), 'h:mm a')} • System Log
                          </p>
                        </div>
                      </div>
                      <Link href={`/dashboard/members/${event.memberId}`} className="text-gray-500 hover:text-[#DC2626] font-medium text-xs flex items-center gap-1 transition-colors self-start sm:self-center ml-14 sm:ml-0">
                        {event.type === 'NEW_MEMBER' ? 'View Profile' : 'View Details'} <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {filteredEvents.length === 0 && (
            <div className="text-center text-gray-500 py-20 border border-dashed border-[#1F1F1F] rounded-2xl">
              <Search className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <p>No activity found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Footer/Pagination */}
        <div className="mt-16 text-center text-sm text-gray-600 border-t border-[#1F1F1F] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 relative">
          <div>
            Showing <span className="text-white font-medium">{filteredEvents.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredEvents.length)}</span> of <span className="text-white font-medium">{filteredEvents.length}</span> entries
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] hover:bg-[#111111] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-400"
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all ${
                    currentPage === idx + 1 
                      ? 'border-red-900/50 bg-red-900/20 text-red-500 font-bold shadow-[0_0_15px_rgba(220,38,38,0.2)]' 
                      : 'border-[#1F1F1F] bg-[#0A0A0A] hover:bg-[#111111] text-gray-400'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] hover:bg-[#111111] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-400"
              >
                &gt;
              </button>
            </div>
          )}
        </div>

        {/* Background Lights */}
        <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] bg-red-600/5 blur-[120px] pointer-events-none z-0"></div>
        <div className="fixed bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] pointer-events-none z-0"></div>
      </main>
    </div>
  );
}

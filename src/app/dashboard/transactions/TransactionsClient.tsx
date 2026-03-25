"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, Download, Calendar, ChevronDown, ChevronLeft, ChevronRight, AlertTriangle, FileText, ArrowLeftRight, Loader2, BookCheck } from 'lucide-react';
import { cn } from "@/lib/utils";
import { returnBookAction } from '@/actions/transaction.actions';
import { toast } from 'sonner';

type StatCounts = {
  all: number;
  issued: number;
  returned: number;
  overdue: number;
};

interface TransactionsClientProps {
  transactions: any[];
  totalMatched: number;
  currentPage: number;
  stats: StatCounts;
  currentSearch: string;
  currentTab: string;
}

function InlineReturnButton({ tx }: { tx: any }) {
  const [isReturning, setIsReturning] = useState(false);

  const handleInlineReturn = async () => {
    // Check if overdue
    const isOverdue = new Date() > new Date(tx.dueDate);
    if (isOverdue) {
      const confirm = window.confirm(`This book is overdue. A fine will be generated. Do you want to process the return?`);
      if (!confirm) return;
    }

    setIsReturning(true);
    try {
      const result = await returnBookAction(tx.id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error('Failed to process return.');
    } finally {
      setIsReturning(false);
    }
  };

  return (
    <button 
      onClick={handleInlineReturn}
      disabled={isReturning}
      className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600/10 text-green-500 hover:bg-green-600 hover:text-white rounded-md transition-all text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isReturning ? <Loader2 size={14} className="animate-spin" /> : <BookCheck size={14} />}
      Return
    </button>
  );
}

export default function TransactionsClient({
  transactions,
  totalMatched,
  currentPage,
  stats,
  currentSearch,
  currentTab
}: TransactionsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const TABS = ['ALL', 'ISSUED', 'RETURNED', 'OVERDUE'];

  // Handle URL updates when searching or clicking tabs
  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== currentSearch) {
        updateQuery({ search: searchTerm || null, page: '1' });
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentSearch]);

  const handleTabChange = (tab: string) => {
    updateQuery({ tab: tab === 'ALL' ? null : tab, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    updateQuery({ page: newPage.toString() });
  };

  const totalPages = Math.ceil(totalMatched / 20);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar bg-[#0A0A0A]">
      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        
        {/* Page Header */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Transaction History</h2>
            <p className="text-slate-500 text-sm mt-1">Complete audit trail of all library transactions across branches</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#1F1F1F] bg-white/5 hover:bg-white/10 text-[#DC2626] text-sm font-semibold transition-all shadow-sm">
            <Download size={18} />
            Export CSV
          </button>
        </div>

        {/* Summary Chips */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#111111] border border-[#1F1F1F] p-5 rounded-2xl shadow-xl">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Transactions</p>
            <p className="text-3xl font-black mt-2 text-white">{stats.all.toLocaleString()}</p>
          </div>
          
          <div className="bg-[#111111] border border-[#1F1F1F] p-5 rounded-2xl shadow-xl relative overflow-hidden">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Currently Issued</p>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-3xl font-black text-emerald-500">{stats.issued}</p>
              <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded tracking-wider uppercase">Active</span>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10 blur-[1px]">
              <ArrowLeftRight size={48} className="text-emerald-500" />
            </div>
          </div>
          
          <div className="bg-[#111111] border border-[#1F1F1F] p-5 rounded-2xl shadow-xl relative overflow-hidden">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Returned</p>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-3xl font-black text-blue-500">{stats.returned}</p>
              <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-2 py-1 rounded tracking-wider uppercase">Done</span>
            </div>
          </div>
          
          <div className="bg-[#111111] border border-[#DC2626]/30 p-5 rounded-2xl shadow-xl relative overflow-hidden group">
            <p className="text-xs font-bold text-[#DC2626]/80 uppercase tracking-widest">Overdue</p>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-3xl font-black text-[#DC2626]">{stats.overdue}</p>
              <AlertTriangle size={20} className="text-[#DC2626] animate-pulse" />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-[#DC2626]/10 size-24 rounded-full blur-xl group-hover:bg-[#DC2626]/20 transition-all duration-500"></div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 bg-[#111111] border border-[#1F1F1F] rounded-xl px-4 flex items-center gap-3 shadow-sm focus-within:ring-1 focus-within:ring-[#DC2626]">
            <Search size={18} className="text-slate-500" />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-sm w-full focus:ring-0 py-3 text-slate-200 placeholder:text-slate-600 outline-none" 
              placeholder="Search by book title or member name..." 
              type="text"
            />
          </div>
          
          <div className="flex items-center gap-1 bg-[#111111] border border-[#1F1F1F] p-1.5 rounded-xl shadow-sm relative">
            {TABS.map((tab) => (
              <button 
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={cn(
                  "relative px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-300 z-10",
                  currentTab === tab 
                    ? "text-white shadow-md bg-[#DC2626]" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <button className="bg-[#111111] border border-[#1F1F1F] px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold text-slate-300 hover:bg-white/5 transition-colors shadow-sm whitespace-nowrap">
            <Calendar size={18} className="text-slate-500" />
            Date Range
          </button>
        </div>

        {/* Main Table Card */}
        <div className={cn("bg-[#111111] border border-[#1F1F1F] rounded-2xl overflow-hidden shadow-2xl transition-opacity duration-300", isPending && "opacity-60")}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#161616] border-b border-[#1F1F1F]">
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Book Information</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Member Details</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Timeline</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fines</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F1F]/60">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No transactions found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isOverdue = tx.status === 'ISSUED' && new Date(tx.dueDate) < new Date();
                    const statusTheme = tx.status === 'RETURNED' 
                      ? { bg: 'bg-blue-500/10', text: 'text-blue-500', name: 'Returned' }
                      : isOverdue
                        ? { bg: 'bg-[#DC2626]/10', text: 'text-[#DC2626]', name: 'Overdue' }
                        : { bg: 'bg-emerald-500/10', text: 'text-emerald-500', name: 'Issued' };

                    return (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                        
                        {/* Book Col */}
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-200 line-clamp-1">{tx.book.title}</p>
                          <p className="text-xs text-slate-600 mt-1 font-mono">{tx.book.isbn}</p>
                        </td>

                        {/* Member Col */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-[#1F1F1F] flex items-center justify-center overflow-hidden border border-[#2a2a2a] shrink-0">
                               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${tx.user.name}`} alt={tx.user.name} />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-300 text-sm">{tx.user.name}</p>
                            </div>
                          </div>
                        </td>

                        {/* Dates Col */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <p className="text-xs text-slate-400">
                              <span className="text-slate-600 inline-block w-12">Out:</span> {new Date(tx.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <p className="text-xs font-semibold text-slate-300">
                              <span className="text-slate-600 font-normal inline-block w-12">Due:</span> {new Date(tx.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </td>

                        {/* Fine Col */}
                        <td className="px-6 py-4">
                          {tx.fine ? (
                            <p className={cn("text-xs font-bold", !tx.fine.paid ? "text-[#DC2626]" : "text-emerald-500")}>
                              {Number(tx.fine.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                            </p>
                          ) : (
                            <p className="text-slate-600 text-xs">—</p>
                          )}
                        </td>

                        {/* Status Col */}
                        <td className="px-6 py-4">
                          <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest uppercase", statusTheme.bg, statusTheme.text)}>
                            {statusTheme.name}
                          </span>
                        </td>

                        {/* Actions Col */}
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                          {tx.status === 'ISSUED' && (
                            <>
                              <button 
                                onClick={() => router.push(`/dashboard/transactions/return?id=${tx.id}`)}
                                title="Open Return Flow"
                                className="inline-flex items-center gap-1.5 px-3 py-1 border border-[#1F1F1F] text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 focus:opacity-100"
                              >
                                <ArrowLeftRight size={14} />
                              </button>
                              <InlineReturnButton tx={tx} />
                            </>
                          )}
                          {tx.status === 'RETURNED' && (
                            <button 
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#1F1F1F] text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 focus:opacity-100"
                            >
                              <FileText size={14} />
                              Receipt
                            </button>
                          )}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 bg-[#161616] border-t border-[#1F1F1F] flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 tracking-wide uppercase">
              Showing <span className="text-white font-bold">{(currentPage - 1) * 20 + 1}-{Math.min(currentPage * 20, totalMatched)}</span> of {totalMatched}
            </p>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button 
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                  // Logic to show pages around current page smoothly
                  let pageNum = idx + 1;
                  if (totalPages > 5) {
                    if (currentPage > 3) {
                      pageNum = currentPage - 2 + idx;
                    }
                    if (pageNum > totalPages) return null;
                  }
                  
                  return (
                    <button 
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={cn(
                        "size-8 rounded-lg text-xs font-bold transition-all",
                        currentPage === pageNum
                          ? "bg-[#DC2626] text-white shadow-md shadow-red-500/20"
                          : "hover:bg-white/5 text-slate-400 hover:text-white"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-2 text-slate-600">...</span>
                    <button 
                      onClick={() => handlePageChange(totalPages)}
                      className="size-8 rounded-lg hover:bg-white/5 text-slate-400 text-xs font-bold transition-all hover:text-white"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button 
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

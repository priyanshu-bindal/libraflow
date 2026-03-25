"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Loader2, BookCheck, User, Calendar, ArrowLeft, AlertTriangle } from 'lucide-react';
import { searchActiveTransactions, returnBookAction } from '@/actions/transaction.actions';
import { differenceInDays, format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ReturnBookClient({ fineRatePerDay = 10 }: { fineRatePerDay: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillId = searchParams?.get('id');

  const [query, setQuery] = useState('');
  const [isSearching, startSearchTransition] = useTransition();
  const [results, setResults] = useState<any[]>([]);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [isReturning, setIsReturning] = useState(false);

  // Auto-search if ID is provided via URL
  useEffect(() => {
    if (prefillId) {
      setQuery(prefillId);
    }
  }, [prefillId]);

  // Debounced Search Effect
  useEffect(() => {
    if (selectedTx && query !== selectedTx.id && query !== selectedTx.book.title && query !== selectedTx.user.name) {
      setSelectedTx(null);
    }

    const timer = setTimeout(() => {
      if (query.length > 2) {
        startSearchTransition(async () => {
          const res = await searchActiveTransactions(query);
          if (res.success && res.data) {
            setResults(res.data);
            if (res.data.length === 1 && !selectedTx) {
               setSelectedTx(res.data[0]);
            }
          } else {
            setResults([]);
          }
        });
      } else {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleReturn = async () => {
    if (!selectedTx) return;
    setIsReturning(true);
    
    try {
      const result = await returnBookAction(selectedTx.id);
      
      if (result.success) {
        toast.success(result.message);
        router.push('/dashboard/transactions');
      } else {
        toast.error(result.message);
        setIsReturning(false);
      }
    } catch (err) {
      toast.error('An unexpected error occurred.');
      setIsReturning(false);
    }
  };

  const calculateFinePreview = (dueDate: Date) => {
    const now = new Date();
    if (now > new Date(dueDate)) {
      const dueStart = new Date(dueDate).setHours(0,0,0,0);
      const nowStart = new Date(now).setHours(0,0,0,0);
      const diffTime = Math.abs(nowStart - dueStart);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays * fineRatePerDay;
    }
    return 0;
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar bg-[#0A0A0A]">
      <div className="p-8 max-w-4xl mx-auto w-full space-y-8 mt-4">
        
        {/* Header */}
        <div>
          <Link href="/dashboard/transactions" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-semibold mb-6">
            <ArrowLeft size={16} /> Back to Log
          </Link>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <BookCheck className="text-emerald-500 w-8 h-8" /> Return Book Workflow
          </h2>
          <p className="text-slate-500 text-sm mt-2">Scan or search for an active issued transaction to process a return.</p>
        </div>

        {/* Search Area */}
        <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6 shadow-xl relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-6 h-6" />
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Scan Barcode / Search Book Title or Member Name..."
              autoFocus
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl py-4 pl-14 pr-4 text-white text-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-600"
            />
            {isSearching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 animate-spin" />
            )}
          </div>

          {/* Search Dropdown / Inline Results */}
          {!selectedTx && results.length > 0 && (
            <div className="mt-4 border border-[#1F1F1F] bg-[#161616] rounded-xl overflow-hidden divide-y divide-[#1F1F1F]">
              {results.map((tx) => (
                <button
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left group"
                >
                  <div>
                    <p className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{tx.book.title}</p>
                    <p className="text-sm text-slate-500 inline-flex items-center gap-1 mt-1">
                      <User size={14} /> {tx.user.name} ({tx.user.membershipId})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-400">Due: {format(new Date(tx.dueDate), 'MMM dd, yyyy')}</p>
                    {new Date(tx.dueDate) < new Date() && (
                      <p className="text-xs font-bold text-red-500 flex items-center justify-end gap-1 mt-0.5"><AlertTriangle size={12}/> Overdue</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {!selectedTx && query.length > 2 && !isSearching && results.length === 0 && (
             <div className="mt-4 p-8 text-center text-slate-500 border border-dashed border-[#2A2A2A] rounded-xl">
               No active transactions found matching your search.
             </div>
          )}
        </div>

        {/* Selected Preview Card */}
        {selectedTx && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Return Preview</h3>
            
            <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                {/* Book Cover / Info */}
                <div className="flex-1 space-y-6">
                  <div>
                    <p className="text-sm text-slate-500 font-semibold mb-1">Book Identity</p>
                    <h4 className="text-2xl font-black text-emerald-400">{selectedTx.book.title}</h4>
                    <p className="text-slate-400 text-sm mt-1">Transaction ID: <span className="font-mono">{selectedTx.id}</span></p>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-[#1A1A1A] border border-[#2A2A2A] p-4 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center shrink-0">
                      <User className="text-slate-400 w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{selectedTx.user.name}</p>
                      <p className="text-xs text-slate-500">{selectedTx.user.membershipId}</p>
                    </div>
                  </div>
                </div>

                {/* Return Math */}
                <div className="w-full md:w-72 space-y-4 shrink-0">
                  <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-5 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Calendar size={14}/> Borrowed</span>
                      <span className="text-sm font-semibold text-white">{format(new Date(selectedTx.issueDate), 'MMM dd')}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Calendar size={14}/> Due Date</span>
                      <span className="text-sm font-semibold text-white">{format(new Date(selectedTx.dueDate), 'MMM dd')}</span>
                    </div>
                    
                    <div className="pt-4 border-t border-[#2A2A2A]">
                       {(() => {
                         const fine = calculateFinePreview(selectedTx.dueDate);
                         if (fine > 0) {
                           return (
                             <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-center animate-pulse">
                               <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                                 <AlertTriangle size={14}/> Fine Generated
                               </p>
                               <p className="text-xl font-bold text-red-400">₹{fine}.00</p>
                             </div>
                           );
                         } else {
                           return (
                             <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-center">
                               <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Status</p>
                               <p className="text-sm font-semibold text-emerald-400">On Time Return</p>
                             </div>
                           );
                         }
                       })()}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions Footer */}
              <div className="bg-[#0A0A0A] border-t border-[#1F1F1F] p-4 flex justify-between items-center">
                <button 
                  onClick={() => { setSelectedTx(null); setQuery(''); }}
                  className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleReturn}
                  disabled={isReturning}
                  className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0A0A] rounded-xl text-sm font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20"
                >
                  {isReturning ? <Loader2 size={18} className="animate-spin" /> : <BookCheck size={18} />}
                  {isReturning ? 'Processing...' : 'Confirm Return'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

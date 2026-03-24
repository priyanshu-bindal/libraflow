/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Search, AlertTriangle, Check, X, Calendar, CalendarClock, Clock, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { issueBook } from '@/actions/transaction.actions';
import { addDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList, CommandEmpty } from "@/components/ui/command";
import { cn } from "@/lib/utils";

type MemberProp = {
  id: string;
  name: string;
  membershipId: string;
  _count: {
    transactions: number;
  };
  transactions?: {
    fine?: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      amount: any;
      paid: boolean;
    } | null;
  }[];
};

type BookProp = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  availableCopies: number;
  coverUrl: string | null;
};

interface IssueBookClientProps {
  members: MemberProp[];
  books: BookProp[];
  loanPeriodDays: number;
}

export default function IssueBookClient({ members, books, loanPeriodDays }: IssueBookClientProps) {
  const router = useRouter();
  const { handleSubmit } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedMember, setSelectedMember] = useState<MemberProp | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookProp | null>(null);

  const [openMember, setOpenMember] = useState(false);
  const [openBook, setOpenBook] = useState(false);

  const searchParams = useSearchParams();
  const preSelectedBookId = searchParams.get('bookId');

  useEffect(() => {
    if (preSelectedBookId) {
      const foundBook = books.find(b => b.id === preSelectedBookId);
      if (foundBook) {
        setSelectedBook(foundBook);
        setTimeout(() => setOpenMember(true), 150);
      }
    }
  }, [preSelectedBookId, books]);

  const maxBooks = 3;

  const totalFine = selectedMember?.transactions?.reduce((sum, tx) => {
    if (tx.fine && !tx.fine.paid) {
      return sum + Number(tx.fine.amount);
    }
    return sum;
  }, 0) || 0;

  const onSubmit = async () => {
    setIsSubmitting(true);

    if (!selectedMember || !selectedBook) {
      toast.error('Please select both a member and a book.');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await issueBook(selectedMember.id, selectedBook.id);

      if (result.success) {
        toast.success(result.message);
        router.push('/dashboard/transactions');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error issuing book:", error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date();
  const dueDate = addDays(today, loanPeriodDays);

  const activeLoans = selectedMember?._count.transactions || 0;
  const loanPercentage = Math.min(Math.round((activeLoans / maxBooks) * 100), 100);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar bg-[#0A0A0A]">
      <main className="min-h-screen p-8 lg:p-12 w-full max-w-[1200px] mx-auto">
        
        {/* Top Header */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <nav className="text-[#6B7280] text-[10px] font-bold mb-2 tracking-widest uppercase">
              Dashboard / Transactions / Issue Book
            </nav>
            <div className="relative inline-block">
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Issue Book</h1>
              <div className="absolute -bottom-2 left-0 w-12 h-1 bg-[#DC2626]"></div>
            </div>
          </div>
          <div className="flex items-center gap-4 hidden sm:flex">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-[#6B7280] hover:text-white transition-colors bg-[#111111] border border-[#1F1F1F]">
              <Bell size={18} />
            </button>
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-[#DC2626]/20 bg-[#2A2A2A] flex items-center justify-center">
              <span className="text-white text-xs font-bold">ADM</span>
            </div>
          </div>
        </header>

        {/* Transaction Section */}
        <section className="max-w-[800px] mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-[#111111] rounded-2xl border border-[#1F1F1F]/40 overflow-hidden shadow-2xl shadow-black/50">
            
            {/* Card Header */}
            <div className="px-8 py-8 border-b border-[#1F1F1F]/40 bg-[#161616]">
              <h2 className="text-2xl font-bold text-white tracking-tight">New Book Issue</h2>
              <p className="text-[#6B7280] text-sm mt-1">Select a member and book to process issuance</p>
            </div>

            {/* Warning Banner */}
            {totalFine > 0 && (
              <div className="mx-8 mt-6 p-4 rounded-xl bg-[#93000a]/20 border border-[#93000a]/40 flex items-center gap-4">
                <AlertTriangle className="text-[#ffb4ab]" size={20} />
                <p className="text-[#ffb4ab] text-sm font-medium">
                  Member has ₹{totalFine.toFixed(2)} outstanding fine. Please process separately.
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/fines')}
                  className="ml-auto flex-shrink-0 text-[#ffb4ab]/80 hover:text-[#ffb4ab] text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  View Debt
                </button>
              </div>
            )}

            {/* Form Columns */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {/* Left Column: Member */}
              <div className="space-y-6">
                <label className="block">
                  <span className="text-[#6B7280] text-[10px] font-bold uppercase tracking-widest mb-3 block">Select Member</span>
                  <Popover open={openMember} onOpenChange={setOpenMember}>
                    <PopoverTrigger asChild>
                      <button type="button" className="relative w-full text-left">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={18} />
                        <div className={cn(
                          "w-full bg-[#0D0D0D] border border-[#1F1F1F]/40 rounded-lg py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#DC2626]/50 focus:ring-1 focus:ring-[#DC2626]/50 transition-all shadow-inner",
                          selectedMember ? "text-white" : "text-gray-500"
                        )}>
                          {selectedMember ? selectedMember.name : "Search by name or ID..."}
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0 bg-[#0D0D0D] border border-[#1F1F1F]">
                      <Command className="bg-transparent text-white">
                        <CommandInput placeholder="Search member by name or ID..." className="text-white" />
                        <CommandList>
                          <CommandEmpty className="py-6 text-center text-sm text-[#6B7280]">No members found.</CommandEmpty>
                          <CommandGroup>
                            {members.map((m) => (
                              <CommandItem
                                key={m.id}
                                value={m.name}
                                onSelect={() => {
                                  setSelectedMember(m);
                                  setOpenMember(false);
                                }}
                                className="text-white data-[selected='true']:bg-[#1F1F1F] cursor-pointer"
                              >
                                <Check className={cn("mr-2 h-4 w-4 text-[#DC2626]", selectedMember?.id === m.id ? "opacity-100" : "opacity-0")} />
                                {m.name} <span className="text-gray-500 ml-1 text-xs font-mono">({m.membershipId.slice(0, 8)})</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </label>

                {/* Selected Member Card */}
                {selectedMember && (
                  <div className="bg-[#0D0D0D] p-5 rounded-xl border border-[#DC2626]/20 relative group shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-[#2A2A2A] border border-[#1F1F1F] shadow-sm">
                        <img alt="Member Avatar" className="w-full h-full object-cover" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMember.name}`} />
                      </div>
                      <div>
                        <h4 className="text-white font-bold">{selectedMember.name}</h4>
                        <p className="text-[#6B7280] text-[10px] uppercase font-mono mt-0.5 tracking-wider">MEM-{selectedMember.membershipId.slice(0, 6)}</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setSelectedMember(null)}
                        className="ml-auto text-[#6B7280] hover:text-[#DC2626] transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="mt-5">
                      <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-[#6B7280] mb-2">
                        <span>Active Loans</span>
                        <span className="text-[#DC2626]">{activeLoans} of {maxBooks}</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden border border-[#2A2A2A]/50">
                        <div className="h-full bg-[#DC2626] transition-all duration-500" style={{ width: `${loanPercentage}%` }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Book */}
              <div className="space-y-6">
                <label className="block">
                  <span className="text-[#6B7280] text-[10px] font-bold uppercase tracking-widest mb-3 block">Select Book</span>
                  <Popover open={openBook} onOpenChange={setOpenBook}>
                    <PopoverTrigger asChild>
                      <button 
                        type="button" 
                        className="relative w-full text-left"
                        disabled={!!preSelectedBookId} 
                        onClick={(e) => {
                          if (preSelectedBookId) e.preventDefault();
                        }}
                      >
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={18} />
                        <div className={cn(
                          "w-full bg-[#0D0D0D] border border-[#1F1F1F]/40 rounded-lg py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#DC2626]/50 focus:ring-1 focus:ring-[#DC2626]/50 transition-all shadow-inner",
                          selectedBook ? "text-white" : "text-gray-500",
                          preSelectedBookId ? "opacity-70 cursor-not-allowed border-transparent" : ""
                        )}>
                          {selectedBook ? selectedBook.title : "Search by title or ISBN..."}
                        </div>
                      </button>
                    </PopoverTrigger>
                    {!preSelectedBookId && (
                      <PopoverContent className="w-[300px] p-0 bg-[#0D0D0D] border border-[#1F1F1F]">
                        <Command className="bg-transparent text-white">
                          <CommandInput placeholder="Search books..." className="text-white" />
                          <CommandList>
                            <CommandEmpty className="py-6 text-center text-sm text-[#6B7280]">No books found.</CommandEmpty>
                            <CommandGroup>
                              {books.map((b) => (
                                <CommandItem
                                  key={b.id}
                                  value={b.title}
                                  onSelect={() => {
                                    setSelectedBook(b);
                                    setOpenBook(false);
                                  }}
                                  className="text-white data-[selected='true']:bg-[#1F1F1F] cursor-pointer"
                                >
                                  <Check className={cn("mr-2 h-4 w-4 text-emerald-500", selectedBook?.id === b.id ? "opacity-100" : "opacity-0")} />
                                  <div className="flex flex-col">
                                    <span>{b.title}</span>
                                    <span className="text-[10px] text-gray-500">{b.author}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    )}
                  </Popover>
                </label>

                {/* Selected Book Card */}
                {selectedBook && (
                  <div className="bg-[#0D0D0D] p-5 rounded-xl border border-[#DC2626]/20 flex gap-4 relative shadow-lg">
                    {preSelectedBookId && (
                      <div className="absolute -top-3 right-4 bg-[#1F1F1F] text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-[#ef4444]/20 shadow-md">
                        Locked
                      </div>
                    )}
                    <div className="w-16 h-20 bg-[#1A1A1A] rounded-md overflow-hidden shadow-lg border border-[#2A2A2A] flex-shrink-0 flex items-center justify-center">
                      {selectedBook.coverUrl ? (
                        <img alt="Book Cover" className="w-full h-full object-cover" src={selectedBook.coverUrl} />
                      ) : (
                        <span className="text-[10px] text-[#6B7280] font-bold tracking-widest -rotate-90 block uppercase">Cover</span>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <h4 className="text-white font-bold leading-tight line-clamp-1">{selectedBook.title}</h4>
                        <p className="text-[#6B7280] text-xs mt-1">{selectedBook.author}</p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">{selectedBook.availableCopies} copies available</span>
                      </div>
                    </div>
                    {!preSelectedBookId && (
                      <button 
                        type="button" 
                        onClick={() => setSelectedBook(null)}
                        className="text-[#6B7280] hover:text-[#DC2626] transition-colors self-start pb-2 pl-2"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Summary Bar */}
            <div className="mx-8 p-6 bg-[#0D0D0D] rounded-xl flex flex-wrap justify-between items-center gap-6 border-t border-[#1F1F1F]/40 mb-2">
              <div className="flex items-center gap-3">
                <Calendar className="text-[#6B7280]" size={20} />
                <div>
                  <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest mb-0.5">Issue Date</p>
                  <p className="text-sm text-white font-medium">Today, {today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CalendarClock className="text-[#DC2626]" size={20} />
                <div>
                  <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest mb-0.5">Due Date</p>
                  <p className="text-sm text-white font-medium">{dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="text-[#6B7280]" size={20} />
                <div>
                  <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest mb-0.5">Loan Period</p>
                  <p className="text-sm text-white font-medium">{loanPeriodDays} days</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 flex items-center justify-end gap-4 border-t border-[#1F1F1F]/40 bg-[#161616]">
              <button 
                type="button" 
                onClick={() => router.back()}
                className="px-8 py-3 rounded-lg border border-[#1F1F1F] text-white hover:bg-[#1A1A1A] transition-all font-medium text-sm"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting || !selectedMember || !selectedBook || selectedBook.availableCopies === 0 || activeLoans >= maxBooks || totalFine > 0}
                className="px-10 py-3 rounded-lg bg-gradient-to-r from-red-600 to-[#93000b] text-white font-bold text-sm shadow-xl shadow-red-900/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Issue'}
              </button>
            </div>
          </form>
        </section>

        {/* Additional Contextual Grid */}
        <section className="max-w-[800px] mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#111111] p-6 rounded-2xl border border-[#1F1F1F]/40 shadow-xl">
            <h4 className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-4">Past Activity</h4>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-[#DC2626] mt-1.5 shrink-0"></div>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">System recorded 24 new transitions over the past 7 days securely.</p>
              </div>
            </div>
          </div>
          <div className="bg-[#111111] p-6 rounded-2xl border border-[#1F1F1F]/40 shadow-xl">
            <h4 className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-4">Stock Alerts</h4>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0"></div>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">Certain top-rated titles are approaching zero inventory limits natively.</p>
              </div>
            </div>
          </div>
          <div className="bg-[#111111] p-6 rounded-2xl border border-[#1F1F1F]/40 shadow-xl">
            <h4 className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-4">Issuance Rules</h4>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-[#6B7280] mt-1.5 shrink-0"></div>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">Standard members are explicitly capped at {maxBooks} simultaneous loans.</p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ChevronRight, Search, User, BookOpen, Calendar, CalendarClock, AlertTriangle, Check, ChevronsUpDown } from 'lucide-react';
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

  // Selections
  const [selectedMember, setSelectedMember] = useState<MemberProp | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookProp | null>(null);

  // Popover states
  const [openMember, setOpenMember] = useState(false);
  const [openBook, setOpenBook] = useState(false);

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
    <div className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar">
      {/* Page Header */}
      <div className="px-8 pt-8 pb-4">
        <div className="relative inline-block mb-1">
          <h2 className="text-3xl font-black text-white tracking-tight">Issue Book</h2>
          <div className="absolute -bottom-2 left-0 w-10 h-1 bg-[#DC2626] rounded-full"></div>
        </div>
      </div>

      {/* Form Card Container */}
      <div className="flex-1 p-8 flex justify-center items-start">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[800px] bg-[#111111] border border-[#1F1F1F] rounded-2xl  shadow-2xl">
          {/* Card Header */}
          <div className="mb-10">
            <h3 className="text-2xl font-bold text-white mb-2">New Book Issue</h3>
            <p className="text-slate-500">Select a member and book to process issuance</p>
          </div>

          {/* Two Column Form Body */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2px_1fr] gap-10">

            {/* Left Column: Member */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="size-8 bg-[#DC2626]/20 rounded-full flex items-center justify-center text-[#DC2626]">
                  <User size={20} />
                </div>
                <span className="text-white font-bold text-lg">Select Member</span>
              </div>

              <Popover open={openMember} onOpenChange={setOpenMember}>
                <PopoverTrigger asChild>
                  <button type="button" className="relative w-full text-left">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <div className={cn(
                      "w-full bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl py-3 pl-12 pr-4 transition-all focus:ring-1 focus:ring-[#DC2626] focus:border-[#DC2626]",
                      selectedMember ? "text-slate-200" : "text-slate-600"
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
                            <Check className={cn("mr-2 h-4 w-4", selectedMember?.id === m.id ? "opacity-100" : "opacity-0")} />
                            {m.name} ({m.membershipId})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Selected Member Card */}
              {selectedMember && (
                <div className="bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl p-4 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-full bg-[#DC2626]/10 flex items-center justify-center overflow-hidden">
                      <img alt="Member Avatar" className="size-10 rounded-full" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMember.name}`} />
                    </div>
                    <div>
                      <p className="text-white font-bold leading-tight">{selectedMember.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">ID: {selectedMember.membershipId}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Active Loans: {activeLoans} of {maxBooks}</span>
                      <span className="text-[#DC2626] font-bold">{loanPercentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#DC2626] transition-all duration-500" style={{ width: `${loanPercentage}%` }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Vertical Divider */}
            <div className="bg-[#1F1F1F] hidden md:block"></div>

            {/* Right Column: Book */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="size-8 bg-[#DC2626]/20 rounded-full flex items-center justify-center text-[#DC2626]">
                  <BookOpen size={20} />
                </div>
                <span className="text-white font-bold text-lg">Select Book</span>
              </div>

              <Popover open={openBook} onOpenChange={setOpenBook}>
                <PopoverTrigger asChild>
                  <button type="button" className="relative w-full text-left">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <div className={cn(
                      "w-full bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl py-3 pl-12 pr-4 transition-all focus:ring-1 focus:ring-[#DC2626] focus:border-[#DC2626]",
                      selectedBook ? "text-slate-200" : "text-slate-600"
                    )}>
                      {selectedBook ? selectedBook.title : "Search title or ISBN..."}
                    </div>
                  </button>
                </PopoverTrigger>
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
                            <Check className={cn("mr-2 h-4 w-4", selectedBook?.id === b.id ? "opacity-100" : "opacity-0")} />
                            {b.title}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Selected Book Card */}
              {selectedBook && (
                <div className="bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl p-4 flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-16 bg-slate-800 rounded shadow flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {selectedBook.coverUrl ? (
                        <img alt="Book Cover" className="w-full h-full object-cover" src={selectedBook.coverUrl} />
                      ) : (
                        <span className="text-[10px] text-slate-500 font-bold -rotate-90">COVER</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="inline-block px-2 py-0.5 rounded bg-[#DC2626]/10 text-[#DC2626] text-[10px] font-bold uppercase tracking-wider mb-1">Book Data</div>
                      <p className="text-white font-bold leading-tight line-clamp-1">{selectedBook.title}</p>
                      <p className="text-slate-500 text-xs mt-1">{selectedBook.author}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-semibold">
                      <span className="size-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      {selectedBook.availableCopies} copies available
                    </div>
                    <span className="text-slate-600 text-xs">ISBN: {selectedBook.isbn}</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Transaction Summary Bar */}
          <div className="mt-10 bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-slate-500" size={20} />
              <div className="text-sm">
                <span className="text-slate-500">Issue Date:</span>
                <span className="text-slate-200 ml-1">Today, {today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
            <div className="h-4 w-px bg-[#1F1F1F] hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <CalendarClock className="text-[#DC2626]" size={20} />
              <div className="text-sm">
                <span className="text-slate-500">Due Date:</span>
                <span className="text-[#DC2626] font-bold ml-1">{dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Warning Banner */}
          {totalFine > 0 && (
            <div className="mt-4 bg-[#450A0A] border border-[#DC2626]/30 rounded-xl p-4 flex items-center gap-4">
              <div className="size-8 bg-[#DC2626]/20 rounded-full flex items-center justify-center text-amber-500">
                <AlertTriangle size={18} />
              </div>
              <div className="flex-1">
                <p className="text-amber-500 text-sm font-medium">
                  Member has <span className="font-bold">₹{totalFine.toFixed(2)}</span> outstanding fine. Please collect or acknowledge before proceeding.
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push('/dashboard/fines')}
                className="text-amber-500/80 hover:text-amber-500 text-xs font-bold uppercase tracking-widest transition-colors flex-shrink-0"
              >
                Pay Now
              </button>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-10 pt-8 border-t border-[#1F1F1F] flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-3 rounded-xl border border-[#1F1F1F] text-slate-400 hover:text-white hover:bg-[#1F1F1F] transition-all text-sm font-bold order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedMember || !selectedBook || selectedBook?.availableCopies === 0 || activeLoans >= maxBooks || totalFine > 0}
              className="px-10 py-3 rounded-xl bg-[#DC2626] hover:bg-red-700 disabled:bg-red-900/50 text-white transition-all text-sm font-bold shadow-lg shadow-[#DC2626]/20 order-1 sm:order-2 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

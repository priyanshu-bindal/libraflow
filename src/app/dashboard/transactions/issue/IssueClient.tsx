"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { 
  Calendar, 
  CalendarOff, 
  X,
  Clock,
  Check,
  ChevronsUpDown,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { issueBook } from '@/actions/transaction.actions';
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { addDays } from 'date-fns';

type IssueBookForm = Record<string, unknown>;

type MemberProp = {
  id: string;
  name: string;
  membershipId: string;
  _count: {
    transactions: number; // Active Loans (ISSUED)
  };
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
}

export default function IssueBookClient({ members, books }: IssueBookClientProps) {
  const router = useRouter();
  const { handleSubmit } = useForm<IssueBookForm>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selections
  const [selectedMember, setSelectedMember] = useState<MemberProp | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookProp | null>(null);

  // Popover states
  const [openMember, setOpenMember] = useState(false);
  const [openBook, setOpenBook] = useState(false);

  const onSubmit: SubmitHandler<IssueBookForm> = async () => {
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
        router.push('/dashboard');
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
  const loanPeriod = 14;
  const dueDate = addDays(today, loanPeriod);
  const maxBooks = 3; // Rule logic

  return (
    <main className="flex-1 overflow-y-auto bg-[#0A0A0A] p-12 custom-scrollbar">
      {/* Top Bar */}
      <header className="flex justify-between items-center mb-12">
        <div>
          <nav className="text-[#6B7280] text-xs mb-2 tracking-widest uppercase">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link> /{' '}
            <span className="cursor-pointer hover:text-white transition-colors">Transactions</span> /{' '}
            <span className="text-white">Issue Book</span>
          </nav>
          <div className="relative inline-block">
            <h1 className="text-4xl font-extrabold text-white font-headline tracking-tight">Issue Book</h1>
            <div className="absolute -bottom-2 left-0 w-12 h-1 bg-[#DC2626]"></div>
          </div>
        </div>
      </header>

      {/* Transaction Section */}
      <section className="max-w-[800px] mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-[#111111] rounded-2xl border border-[#1F1F1F]/40 overflow-hidden shadow-2xl shadow-black/50">
          
          {/* Card Header */}
          <div className="px-8 py-8 border-b border-[#1F1F1F]/40 bg-[#161616]">
            <h2 className="text-2xl font-bold text-white font-headline">New Book Issue</h2>
            <p className="text-[#6B7280] text-sm mt-1">Select a member and book to process issuance</p>
          </div>

          {/* Warning Banner - Example logic, in reality active loans is the check */}
          {selectedMember && selectedMember._count.transactions >= maxBooks && (
            <div className="mx-8 mt-6 p-4 rounded-xl bg-[#690005]/20 border border-[#93000a]/40 flex items-center gap-4">
              <AlertTriangle className="text-[#ffb4ab]" size={24} />
              <p className="text-[#ffb4ab] text-sm font-medium">Member has reached the maximum active loans limit.</p>
            </div>
          )}

          {/* Form Columns */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
            
            {/* Left Column: Member */}
            <div className="space-y-6">
              <label className="block">
                <span className="text-[#6B7280] text-xs font-bold uppercase tracking-widest mb-3 block">Select Member</span>
                
                <Popover open={openMember} onOpenChange={setOpenMember}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openMember}
                      className="w-full justify-between bg-[#0D0D0D] border-[#1F1F1F]/40 text-white hover:bg-[#1a1a1a] hover:text-white"
                    >
                      {selectedMember ? selectedMember.name : "Search members..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0 bg-[#0D0D0D] border-[#1F1F1F]/40">
                    <Command className="bg-transparent text-white">
                      <CommandInput 
                        placeholder="Search member by name or ID..." 
                        className="text-white"
                      />
                      <CommandList>
                        <CommandEmpty className="py-6 text-center text-sm text-[#6B7280]">No members found.</CommandEmpty>
                        <CommandGroup>
                          {members.map((m) => (
                            <CommandItem
                              key={m.id}
                              value={m.name} // Search by name
                              onSelect={() => {
                                setSelectedMember(m);
                                setOpenMember(false);
                              }}
                              className="text-white data-[selected='true']:bg-[#1F1F1F] data-[selected='true']:text-white"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedMember?.id === m.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {m.name} ({m.membershipId})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </label>

              {/* Selected Member Card Component */}
              {selectedMember && (
              <div className="bg-[#0D0D0D] p-5 rounded-xl border border-[#DC2626]/20 relative group">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-[#2a2a2a]">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMember.name}`} 
                      alt={selectedMember.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{selectedMember.name}</h4>
                    <p className="text-[#6B7280] text-xs">{selectedMember.membershipId}</p>
                  </div>
                  <button type="button" onClick={() => setSelectedMember(null)} className="ml-auto text-[#6B7280] hover:text-[#ffb4ab] transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-[#6B7280] mb-2">
                    <span>Active Loans</span>
                    <span className={selectedMember._count.transactions >= maxBooks ? "text-[#DC2626]" : "text-[#10B981]"}>
                      {selectedMember._count.transactions} of {maxBooks}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full", selectedMember._count.transactions >= maxBooks ? "bg-[#DC2626]" : "bg-[#10B981]")} 
                      style={{ width: `${Math.min((selectedMember._count.transactions / maxBooks) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              )}
            </div>

            {/* Right Column: Book */}
            <div className="space-y-6">
              <label className="block">
                <span className="text-[#6B7280] text-xs font-bold uppercase tracking-widest mb-3 block">Select Book</span>
                
                <Popover open={openBook} onOpenChange={setOpenBook}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openBook}
                      className="w-full justify-between bg-[#0D0D0D] border-[#1F1F1F]/40 text-white hover:bg-[#1a1a1a] hover:text-white"
                    >
                      {selectedBook ? selectedBook.title : "Search books..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0 bg-[#0D0D0D] border-[#1F1F1F]/40">
                    <Command className="bg-transparent text-white">
                      <CommandInput 
                        placeholder="Search by title..." 
                        className="text-white"
                      />
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
                              className="text-white data-[selected='true']:bg-[#1F1F1F] data-[selected='true']:text-white"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedBook?.id === b.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {b.title}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

              </label>

              {/* Selected Book Card Component */}
              {selectedBook && (
              <div className="bg-[#0D0D0D] p-5 rounded-xl border border-[#DC2626]/20 flex gap-4">
                <div className="w-16 h-20 bg-[#2a2a2a] rounded-md overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
                  {selectedBook.coverUrl ? (
                    <img src={selectedBook.coverUrl} alt={selectedBook.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-[10px] text-slate-500 -rotate-90">CODE</div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-white font-bold leading-tight">{selectedBook.title}</h4>
                    <p className="text-[#6B7280] text-xs mt-0.5">{selectedBook.author}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={cn("w-2 h-2 rounded-full", selectedBook.availableCopies > 0 ? "bg-green-500" : "bg-red-500")}></div>
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">{selectedBook.availableCopies} copies available</span>
                  </div>
                </div>
                <button type="button" onClick={() => setSelectedBook(null)} className="text-[#6B7280] hover:text-[#ffb4ab] transition-colors self-start">
                  <X size={18} />
                </button>
              </div>
              )}
            </div>
            
          </div>

          {/* Summary Bar */}
          <div className="mx-8 p-6 bg-[#0D0D0D] rounded-xl flex flex-wrap justify-between items-center gap-6 border-t border-[#1F1F1F]/40">
            <div className="flex items-center gap-3">
              <Calendar className="text-[#6B7280]" size={20} />
              <div>
                <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest">Issue Date</p>
                <p className="text-sm text-white font-medium">Today, {today.toLocaleDateString('en-US')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CalendarOff className="text-[#DC2626]" size={20} />
              <div>
                <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest">Due Date</p>
                <p className="text-sm text-white font-medium">{dueDate.toLocaleDateString('en-US')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="text-[#6B7280]" size={20} />
              <div>
                <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest">Loan Period</p>
                <p className="text-sm text-white font-medium">{loanPeriod} days</p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-8 flex items-center justify-end gap-4 mt-4">
            <button 
              type="button" 
              onClick={() => router.back()}
              className="px-8 py-3 rounded-lg border border-[#1F1F1F] text-white hover:bg-[#1F1F1F] transition-all font-medium text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || !selectedMember || !selectedBook || selectedBook?.availableCopies === 0 || selectedMember?._count.transactions >= maxBooks}
              className="px-10 py-3 rounded-lg bg-gradient-to-br from-[#DC2626] to-[#93000b] text-white font-bold text-sm shadow-xl shadow-red-900/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Issue'}
            </button>
          </div>
        </form>
      </section>

      {/* Additional Contextual Grid */}
      <section className="max-w-[800px] mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111111] p-6 rounded-2xl border border-[#1F1F1F]/40 backdrop-blur-xl">
          <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-widest mb-4">Past Activity</h4>
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-[#DC2626] mt-1.5 flex-shrink-0"></div>
              <p className="text-xs text-white leading-relaxed">Member returned &quot;Pragmatic Programmer&quot; 2 days early.</p>
            </div>
          </div>
        </div>

        <div className="bg-[#111111] p-6 rounded-2xl border border-[#1F1F1F]/40 backdrop-blur-xl">
          <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-widest mb-4">Stock Alerts</h4>
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
              <p className="text-xs text-white leading-relaxed">&quot;Clean Code&quot; is currently high demand. Only 2 remaining.</p>
            </div>
          </div>
        </div>

        <div className="bg-[#111111] p-6 rounded-2xl border border-[#1F1F1F]/40 backdrop-blur-xl">
          <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-widest mb-4">Issuance Rules</h4>
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-[#6B7280] mt-1.5 flex-shrink-0"></div>
              <p className="text-xs text-white leading-relaxed">Standard members are capped at 3 simultaneous loans.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}



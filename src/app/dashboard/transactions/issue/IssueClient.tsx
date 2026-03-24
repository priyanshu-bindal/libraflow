"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { 
  Calendar, 
  CalendarOff, 
  X,
  Clock,
  Check,
  ChevronsUpDown
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { issueBook, searchMembersAction, searchBooksAction, getBookById } from '@/actions/transaction.actions';
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { addDays } from 'date-fns';

interface IssueBookForm {
  memberSearch: string;
  bookSearch: string;
}

// Simple internal types based on Prisma outputs
type SelectedMember = {
  id: string;
  name: string;
  membershipId: string;
  _count: {
    transactions: number;
  };
};

type SelectedBook = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  availableCopies: number;
  coverUrl: string | null;
};

export function IssueFormContent({ loanPeriod = 14, maxBooks = 3 }: { loanPeriod?: number, maxBooks?: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialBookId = searchParams.get('bookId');

  const { handleSubmit } = useForm<IssueBookForm>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedMember, setSelectedMember] = useState<SelectedMember | null>(null);
  const [selectedBook, setSelectedBook] = useState<SelectedBook | null>(null);

  // Popover states
  const [openMember, setOpenMember] = useState(false);
  const [openBook, setOpenBook] = useState(false);

  // Search results
  const [memberResults, setMemberResults] = useState<SelectedMember[]>([]);
  const [bookResults, setBookResults] = useState<SelectedBook[]>([]);

  const [memberQuery, setMemberQuery] = useState("");
  const [bookQuery, setBookQuery] = useState("");

  useEffect(() => {
    if (initialBookId) {
      getBookById(initialBookId).then((book) => {
        if (book) {
          setSelectedBook(book);
        }
      });
    }
  }, [initialBookId]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (memberQuery.length >= 2) {
        searchMembersAction(memberQuery).then(setMemberResults);
      } else {
        setMemberResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [memberQuery]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (bookQuery.length >= 2) {
        searchBooksAction(bookQuery).then(setBookResults);
      } else {
        setBookResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [bookQuery]);


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
  const dueDate = addDays(today, loanPeriod);

  return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-[#111111] rounded-2xl border border-[#1F1F1F]/40 overflow-hidden shadow-2xl shadow-black/50">
          
          {/* Card Header */}
          <div className="px-8 py-8 border-b border-[#1F1F1F]/40 bg-[#161616]">
            <h2 className="text-2xl font-bold text-white font-headline">New Book Issue</h2>
            <p className="text-[#6B7280] text-sm mt-1">Select a member and book to process issuance</p>
          </div>

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
                    <Command className="bg-transparent text-white" shouldFilter={false}>
                      <CommandInput 
                        placeholder="Search member by name or ID..." 
                        value={memberQuery}
                        onValueChange={setMemberQuery}
                      />
                      <CommandList>
                        {memberQuery.length >= 2 && memberResults.length === 0 && (
                          <div className="py-6 text-center text-sm text-[#6B7280]">No members found.</div>
                        )}
                        <CommandGroup>
                          {memberResults.map((m) => (
                            <CommandItem
                              key={m.id}
                              value={m.id}
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
                    <div className={cn("h-full", selectedMember._count.transactions >= maxBooks ? "bg-[#DC2626]" : "bg-[#10B981]")} style={{ width: `${Math.min((selectedMember._count.transactions / maxBooks) * 100, 100)}%` }}></div>
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
                    <Command className="bg-transparent text-white" shouldFilter={false}>
                      <CommandInput 
                        placeholder="Search by title or ISBN..." 
                        value={bookQuery}
                        onValueChange={setBookQuery}
                      />
                      <CommandList>
                        {bookQuery.length >= 2 && bookResults.length === 0 && (
                          <div className="py-6 text-center text-sm text-[#6B7280]">No books found.</div>
                        )}
                        <CommandGroup>
                          {bookResults.map((b) => (
                            <CommandItem
                              key={b.id}
                              value={b.id}
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
              disabled={isSubmitting || !selectedMember || !selectedBook || selectedBook?.availableCopies === 0}
              className="px-10 py-3 rounded-lg bg-gradient-to-br from-[#DC2626] to-[#93000b] text-white font-bold text-sm shadow-xl shadow-red-900/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Issue'}
            </button>
          </div>
        </form>
  )
}



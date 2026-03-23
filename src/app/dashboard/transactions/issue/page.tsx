"use client";

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { 
  User, 
  BookOpen, 
  Search, 
  Calendar, 
  CalendarOff, 
  AlertTriangle,
  X,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { issueBook } from '@/actions/transaction.actions';

interface IssueBookForm {
  memberSearch: string;
  bookSearch: string;
}

export default function IssueBookPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<IssueBookForm>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit: SubmitHandler<IssueBookForm> = async (data) => {
    setIsSubmitting(true);
    
    // In a fully integrated UI, these IDs would come from your selected member/book state.
    // We are simulating the "selected" IDs here for demonstration purposes.
    const selectedMemberId = "simulated_member_id_here"; // e.g. state variable: memberId
    const selectedBookId = "simulated_book_id_here";     // e.g. state variable: bookId

    if (!selectedMemberId || !selectedBookId) {
      toast.error('Please select both a member and a book.');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await issueBook(selectedMemberId, selectedBookId);
      
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

          {/* Warning Banner */}
          <div className="mx-8 mt-6 p-4 rounded-xl bg-[#690005]/20 border border-[#93000a]/40 flex items-center gap-4">
            <AlertTriangle className="text-[#ffb4ab]" size={24} />
            <p className="text-[#ffb4ab] text-sm font-medium">Member has ₹40.00 outstanding fine</p>
          </div>

          {/* Form Columns */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
            
            {/* Left Column: Member */}
            <div className="space-y-6">
              <label className="block">
                <span className="text-[#6B7280] text-xs font-bold uppercase tracking-widest mb-3 block">Select Member</span>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={18} />
                  <input 
                    {...register("memberSearch")}
                    className="w-full bg-[#0D0D0D] border border-[#1F1F1F]/40 rounded-lg py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#DC2626]/50 focus:ring-1 focus:ring-[#DC2626]/50 transition-all" 
                    placeholder="Search by name or ID..." 
                    type="text"
                  />
                </div>
              </label>

              {/* Selected Member Card Component */}
              <div className="bg-[#0D0D0D] p-5 rounded-xl border border-[#DC2626]/20 relative group">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-[#2a2a2a]">
                    <img 
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan" 
                      alt="Jordan Smith" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">Jordan Smith</h4>
                    <p className="text-[#6B7280] text-xs">MEM-0492</p>
                  </div>
                  <button type="button" className="ml-auto text-[#6B7280] hover:text-[#ffb4ab] transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-[#6B7280] mb-2">
                    <span>Active Loans</span>
                    <span className="text-[#DC2626]">2 of 3</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div className="h-full bg-[#DC2626]" style={{ width: '66%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Book */}
            <div className="space-y-6">
              <label className="block">
                <span className="text-[#6B7280] text-xs font-bold uppercase tracking-widest mb-3 block">Select Book</span>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={18} />
                  <input 
                    {...register("bookSearch")}
                    className="w-full bg-[#0D0D0D] border border-[#1F1F1F]/40 rounded-lg py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#DC2626]/50 focus:ring-1 focus:ring-[#DC2626]/50 transition-all" 
                    placeholder="Search by title or ISBN..." 
                    type="text"
                  />
                </div>
              </label>

              {/* Selected Book Card Component */}
              <div className="bg-[#0D0D0D] p-5 rounded-xl border border-[#DC2626]/20 flex gap-4">
                <div className="w-16 h-20 bg-[#2a2a2a] rounded-md overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center">
                  <div className="text-[10px] text-slate-500 -rotate-90">CODE</div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-white font-bold leading-tight">Clean Code</h4>
                    <p className="text-[#6B7280] text-xs mt-0.5">Robert C. Martin</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">3 copies available</span>
                  </div>
                </div>
                <button type="button" className="text-[#6B7280] hover:text-[#ffb4ab] transition-colors self-start">
                  <X size={18} />
                </button>
              </div>
            </div>
            
          </div>

          {/* Summary Bar */}
          <div className="mx-8 p-6 bg-[#0D0D0D] rounded-xl flex flex-wrap justify-between items-center gap-6 border-t border-[#1F1F1F]/40">
            <div className="flex items-center gap-3">
              <Calendar className="text-[#6B7280]" size={20} />
              <div>
                <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest">Issue Date</p>
                <p className="text-sm text-white font-medium">Today, March 13 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CalendarOff className="text-[#DC2626]" size={20} />
              <div>
                <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest">Due Date</p>
                <p className="text-sm text-white font-medium">March 27 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="text-[#6B7280]" size={20} />
              <div>
                <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest">Loan Period</p>
                <p className="text-sm text-white font-medium">14 days</p>
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
              disabled={isSubmitting}
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
              <p className="text-xs text-white leading-relaxed">Member returned "Pragmatic Programmer" 2 days early.</p>
            </div>
          </div>
        </div>

        <div className="bg-[#111111] p-6 rounded-2xl border border-[#1F1F1F]/40 backdrop-blur-xl">
          <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-widest mb-4">Stock Alerts</h4>
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
              <p className="text-xs text-white leading-relaxed">"Clean Code" is currently high demand. Only 2 remaining.</p>
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

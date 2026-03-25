/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import DeleteBookButton from "@/components/books/DeleteBookButton";
import { 
  ArrowLeft, 
  ChevronRight, 
  Edit, 
  BookOpen, 
  MoreVertical 
} from "lucide-react";

export default async function BookDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const book = await db.book.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  if (!book) {
    notFound();
  }

  // Fallback defaults if values are missing
  const categoryName = book.category?.name || "Uncategorized";

  const [issuedTransactions, recentActivity, timesBorrowed] = await Promise.all([
    // Who currently has this book
    db.transaction.findMany({
      where: { bookId: id, status: 'ISSUED' },
      include: { user: { select: { name: true, membershipId: true } } },
      orderBy: { dueDate: 'asc' },
    }),
    // Recent activity (last 6 transactions)
    db.transaction.findMany({
      where: { bookId: id },
      include: { user: { select: { name: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 6,
    }),
    // Total times this book has ever been borrowed
    db.transaction.count({ where: { bookId: id } }),
  ]);

  const activeLoans = issuedTransactions.length;

  return (
    <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#0A0A0A] p-8">
      <div className="max-w-[1200px] mx-auto w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-4">
          <Link href="/dashboard" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <ChevronRight size={12} />
          <Link href="/dashboard/books" className="hover:text-white transition-colors">
            Books
          </Link>
          <ChevronRight size={12} />
          <span className="text-slate-300">{book.title}</span>
        </nav>

        {/* Header Row */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard/books"
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#111111] border border-[#1F1F1F] text-slate-300 hover:text-white transition-all shadow-sm"
            >
              <ArrowLeft size={20} />
            </Link>
            <h2 className="text-2xl font-bold text-white tracking-tight">Book Details</h2>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/dashboard/books/${id}/edit`}
              className="px-5 py-2 flex items-center gap-2 bg-[#111111] border border-[#1F1F1F] rounded-xl text-slate-400 font-semibold text-sm hover:border-slate-700 hover:text-white transition-all"
            >
              <Edit size={16} />
              Edit Book
            </Link>
            <DeleteBookButton
              bookId={id}
              bookTitle={book.title}
              bookAuthor={book.author}
              totalCopies={book.totalCopies}
              activeLoans={activeLoans}
            />
          </div>
        </div>

        {/* Top Book Info Card */}
        <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-8 flex gap-8 shadow-sm">
          {/* Cover Column */}
          <div className="w-[160px] flex flex-col gap-5">
            <div className="w-[160px] h-[220px] bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl flex flex-col items-center justify-center text-slate-700 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <BookOpen size={64} className="opacity-30" strokeWidth={1} />
              )}
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${book.availableCopies > 0 ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                {book.availableCopies} Available
              </div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                of {book.totalCopies} copies
              </p>
            </div>
            
            {book.availableCopies === 0 ? (
              <button disabled className="w-full py-3 bg-[#2A2A2A] text-gray-500 text-sm font-bold uppercase tracking-widest rounded-xl cursor-not-allowed mt-4 shadow-sm border border-[#3A3A3A]">
                Out of Stock
              </button>
            ) : (
              <Link 
                href={`/dashboard/transactions/issue?bookId=${book.id}`}
                className="w-full py-3 bg-[#DC2626] hover:bg-red-500 text-white text-sm font-bold uppercase tracking-widest rounded-xl transition-all shadow-md mt-4 text-center block"
              >
                Issue This Book
              </Link>
            )}
          </div>
          
          {/* Info Column */}
          <div className="flex-1 flex flex-col">
            <div className="mb-6">
              <h3 className="text-4xl font-bold text-white mb-2">{book.title}</h3>
              <p className="text-xl text-slate-400 font-medium">{book.author}</p>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold">
                {categoryName}
              </span>
              {book.isbn && (
                <span className="px-3 py-1.5 bg-[#0D0D0D] text-slate-300 border border-[#1F1F1F] rounded-full text-xs font-bold uppercase tracking-wide">
                  ISBN: {book.isbn}
                </span>
              )}
              {book.publishedYear && (
                <span className="px-3 py-1.5 bg-[#0D0D0D] text-slate-300 border border-[#1F1F1F] rounded-full text-xs font-bold">
                  {book.publishedYear}
                </span>
              )}
            </div>
            
            {/* Info Grid */}
            <div className="grid grid-cols-4 gap-4 mt-auto">
              <div className="bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl p-5">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Publisher</p>
                <p className="text-sm text-slate-200 font-bold truncate" title={book.publisher || "N/A"}>
                  {book.publisher || "N/A"}
                </p>
              </div>
              <div className="bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl p-5">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Total Copies</p>
                <p className="text-sm text-slate-200 font-bold">{book.totalCopies}</p>
              </div>
              <div className="bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl p-5">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Available</p>
                <p className="text-sm text-slate-200 font-bold">{book.availableCopies}</p>
              </div>
              <div className="bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl p-5">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Times Borrowed</p>
                <p className="text-sm text-slate-200 font-bold">{timesBorrowed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description Card */}
        <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-8 mt-6 shadow-sm">
          <h4 className="text-lg font-bold text-white mb-4">Description</h4>
          <p className="text-slate-400 leading-relaxed max-w-4xl text-sm">
            {book.description || "No description available for this book."}
          </p>
        </div>

        {/* Lower Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pb-12">
          {/* Left: Currently Issued To */}
          <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-white">Currently Issued To</h4>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-black text-white ${activeLoans > 0 ? 'bg-[#DC2626]' : 'bg-slate-700'}`}>
                {activeLoans}
              </span>
            </div>

            {issuedTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-slate-600">
                <BookOpen size={32} strokeWidth={1.5} className="mb-3 opacity-40" />
                <p className="text-sm font-semibold">No active issues</p>
                <p className="text-xs mt-1">All copies are currently available.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {issuedTransactions.map((tx) => {
                  const isOverdue = new Date() > new Date(tx.dueDate);
                  const initials = tx.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                  return (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${isOverdue ? 'bg-[#DC2626]' : 'bg-slate-700'}`}>
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{tx.user.name}</p>
                          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">ID: {tx.user.membershipId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-bold mb-1.5 ${isOverdue ? 'text-[#DC2626]' : 'text-slate-400'}`}>
                          Due {new Date(tx.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        {isOverdue && (
                          <span className="px-2 py-1 bg-[#450A0A]/40 text-[#DC2626] border border-[#DC2626]/20 rounded text-[9px] font-black uppercase tracking-wider">
                            Overdue
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Recent Activity */}
          <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-6 shadow-sm flex flex-col">
            <h4 className="text-lg font-bold text-white mb-6">Recent Activity</h4>

            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-slate-600">
                <p className="text-sm font-semibold">No activity yet</p>
                <p className="text-xs mt-1">Transactions will appear here once the book is issued.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {recentActivity.map((tx) => {
                  const isIssued = tx.status === 'ISSUED';
                  const isReturned = tx.status === 'RETURNED';
                  const dot = isReturned
                    ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                    : isIssued
                    ? 'bg-[#DC2626] shadow-[0_0_8px_rgba(220,38,38,0.5)]'
                    : 'bg-slate-500';
                  const label = isReturned ? 'Returned by' : 'Issued to';
                  const date = new Date(tx.updatedAt);
                  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  return (
                    <div key={tx.id} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
                      <p className="text-xs text-slate-400 flex-1 min-w-0">
                        <span className="text-slate-200 font-semibold">{label}</span>{' '}
                        <span className="truncate">{tx.user.name}</span>
                      </p>
                      <p className="text-[10px] text-slate-600 font-medium whitespace-nowrap">{dateStr}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}

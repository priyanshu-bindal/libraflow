'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, X, AlertTriangle, BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteBookAction } from '@/actions/book.actions';

interface DeleteBookButtonProps {
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  totalCopies: number;
  activeLoans?: number;
}

export default function DeleteBookButton({
  bookId,
  bookTitle,
  bookAuthor,
  totalCopies,
  activeLoans = 0,
}: DeleteBookButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isPending, startTransition] = useTransition();
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Animate in/out
  useEffect(() => {
    if (open) {
      // small delay so CSS transition fires
      requestAnimationFrame(() => setVisible(true));
      setTimeout(() => inputRef.current?.focus(), 200);
    } else {
      setVisible(false);
    }
  }, [open]);

  const handleClose = () => {
    if (isPending) return;
    setVisible(false);
    setTimeout(() => {
      setOpen(false);
      setConfirmText('');
    }, 250);
  };

  const handleDelete = () => {
    if (confirmText !== 'DELETE') return;
    startTransition(async () => {
      const result = await deleteBookAction(bookId);
      if (result.success) {
        toast.success('Book deleted successfully');
        handleClose();
        router.push('/dashboard/books');
      } else {
        toast.error(result.message || 'Failed to delete book');
        handleClose();
      }
    });
  };

  const canDelete = confirmText === 'DELETE';

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="px-5 py-2 flex items-center gap-2 bg-[#450A0A]/40 border border-[#DC2626]/20 rounded-xl text-[#DC2626] font-semibold text-sm hover:bg-[#450A0A]/70 hover:border-[#DC2626]/40 transition-all"
      >
        <Trash2 size={16} />
        Delete Book
      </button>

      {/* Modal Portal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-250"
            style={{ opacity: visible ? 1 : 0 }}
          />

          {/* Dialog */}
          <div
            className="relative w-full max-w-md bg-[#111111] border border-[#2A2A2A] rounded-2xl shadow-2xl transition-all duration-250 overflow-hidden"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(16px)',
            }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              disabled={isPending}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {/* Icon */}
            <div className="flex flex-col items-center text-center px-8 pt-10 pb-6">
              <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                <X size={28} className="text-red-500" strokeWidth={2.5} />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Delete Book?</h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                This action cannot be undone. The book and all its transaction history will be
                permanently removed from the system.
              </p>
            </div>

            {/* Book card */}
            <div className="mx-6 mb-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-14 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg flex items-center justify-center shrink-0">
                <BookOpen size={20} className="text-slate-600" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white truncate">{bookTitle}</p>
                <p className="text-xs text-slate-500 mt-0.5">{bookAuthor}</p>
                <p className="text-xs text-red-400 mt-1 font-semibold">{totalCopies} copies will be removed</p>
              </div>
            </div>

            {/* Warning badges */}
            {activeLoans > 0 && (
              <div className="mx-6 mb-4 flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#450A0A]/60 border border-red-700/40 text-red-400 text-xs font-bold rounded-lg">
                  <AlertTriangle size={12} />
                  {activeLoans} active loan{activeLoans !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Confirm input */}
            <div className="mx-6 mb-4">
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                Type <span className="font-black text-slate-200 tracking-wider">DELETE</span> to confirm
              </label>
              <input
                ref={inputRef}
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDelete()}
                placeholder="Type DELETE"
                className="w-full bg-[#0D0D0D] border border-[#2A2A2A] focus:border-red-500/60 focus:ring-1 focus:ring-red-500/30 rounded-xl py-3 px-4 text-white text-sm outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            {/* Actions */}
            <div className="mx-6 mb-6 space-y-2">
              <button
                onClick={handleDelete}
                disabled={!canDelete || isPending}
                className="w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2
                  bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-900/30
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
                  enabled:hover:from-red-500 enabled:hover:to-red-700 enabled:active:scale-[0.98]"
              >
                {isPending ? (
                  <><Loader2 size={16} className="animate-spin" /> Deleting...</>
                ) : (
                  <><Trash2 size={16} /> Delete Permanently</>
                )}
              </button>
              <button
                onClick={handleClose}
                disabled={isPending}
                className="w-full py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-[#1A1A1A] transition-all disabled:opacity-40"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

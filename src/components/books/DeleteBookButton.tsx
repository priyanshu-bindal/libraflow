'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteBookAction } from '@/actions/book.actions';
import { DottedSpinner } from '@/components/ui/loading-spinner';

interface DeleteBookButtonProps {
  bookId: string;
}

export default function DeleteBookButton({ bookId }: DeleteBookButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    startTransition(async () => {
      const result = await deleteBookAction(bookId);

      if (result.success) {
        toast.success('Book deleted successfully');
        router.push('/dashboard/books');
      } else {
        toast.error(result.message || 'Failed to delete book');
      }
    });
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className="px-5 py-2 flex items-center justify-center min-w-[140px] gap-2 bg-[#450A0A]/40 border border-[#DC2626]/20 rounded-xl text-[#DC2626] font-semibold text-sm hover:bg-[#450A0A]/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? (
        <DottedSpinner className="scale-75" />
      ) : (
        <>
          <Trash2 size={16} />
          Delete Book
        </>
      )}
    </button>
  );
}

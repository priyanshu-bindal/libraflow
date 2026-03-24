'use client';

import { useTransition } from 'react';
import { processFinePayment } from '@/actions/fine.actions';

export default function PayFineButton({ fineId }: { fineId: string }) {
  const [isPending, startTransition] = useTransition();

  const handlePayment = () => {
    startTransition(async () => {
      const res = await processFinePayment(fineId);
      if (!res.success) {
        alert(res.error);
      }
    });
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isPending}
      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
        isPending
          ? 'bg-[#1A1A1A] text-gray-500 cursor-not-allowed'
          : 'bg-[#DC2626] text-white hover:bg-red-500'
      }`}
    >
      {isPending ? 'PROCESSING...' : 'MARK PAID'}
    </button>
  );
}

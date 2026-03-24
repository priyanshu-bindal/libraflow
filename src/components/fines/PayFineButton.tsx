'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { markFineAsPaid } from '@/actions/fine.actions';

export function PayFineButton({ fineId }: { fineId: string }) {
  const [isPending, startTransition] = useTransition();

  const handlePay = () => {
    startTransition(async () => {
      try {
        const result = await markFineAsPaid(fineId);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } catch {
        toast.error('An unexpected error occurred.');
      }
    });
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      className="bg-red-600 hover:bg-red-700 text-white"
      onClick={handlePay}
      disabled={isPending}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        'Mark as Paid'
      )}
    </Button>
  );
}



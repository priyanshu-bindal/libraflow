"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Clock, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { renewBookAction } from "@/actions/transaction.actions";

export interface TransactionMetadata {
  id: string;
  dueDate: Date;
  renewalsUsed: number;
  book: {
    title: string;
    author: string;
  };
  user: {
    name: string;
    membershipId: string;
  };
  fine?: {
    paid: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    amount: any;
  } | null;
}

interface RecoverProps {
  transaction: TransactionMetadata;
  renewalLimit?: number;
}

export function RenewLoanModal({ transaction, renewalLimit = 2 }: RecoverProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const newDueDate = new Date(transaction.dueDate);
  newDueDate.setDate(newDueDate.getDate() + 14); // Next 14 days

  const renewalsUsed = transaction.renewalsUsed || 0;
  const isLimitReached = renewalsUsed >= renewalLimit;

  // Calculate if any fines block the modal
  const hasUnpaidFines = transaction.fine ? !transaction.fine.paid : false;
  const fineAmount = hasUnpaidFines ? Number(transaction.fine?.amount) : 0;

  const handleRenew = () => {
    startTransition(async () => {
      const result = await renewBookAction(transaction.id);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="border border-[#1F1F1F] hover:bg-[#1F1F1F] px-3 py-1 rounded-md text-xs font-medium text-gray-300 transition-colors">
          Renew
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#111111] border-[#1F1F1F] text-white w-[95vw] max-w-lg sm:max-w-[425px] max-h-[90vh] overflow-y-auto !fixed !top-[50%] !left-[50%] !-translate-x-1/2 !-translate-y-1/2 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Renew Loan</DialogTitle>
          <DialogDescription className="text-slate-400">
            Are you sure you want to renew this book?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-[#0D0D0D] border border-[#1F1F1F] rounded-lg p-4 space-y-3 shadow-inner">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Book</p>
              <p className="text-sm font-medium text-white line-clamp-1">{transaction.book.title}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Member</p>
              <p className="text-sm font-medium text-white">{transaction.user.name} <span className="text-slate-500 text-xs font-mono">({transaction.user.membershipId.slice(0, 8)})</span></p>
            </div>
          </div>

          <div className="flex justify-between items-center gap-4">
            <div className="flex-1 bg-[#0D0D0D] border border-[#1F1F1F] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={14} className="text-slate-500" />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Current Due</p>
              </div>
              <p className="text-sm font-bold text-white">
                {new Date(transaction.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="flex-1 bg-[#2A0505] border border-[#DC2626]/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays size={14} className="text-[#DC2626]" />
                <p className="text-[10px] text-[#DC2626] font-bold uppercase tracking-widest">New Due</p>
              </div>
              <p className="text-sm font-bold text-white">
                {newDueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-slate-300">Renewals Used</p>
              <p className="text-sm font-bold text-[#DC2626]">{renewalsUsed} of {renewalLimit} Allowed</p>
            </div>
            <div className="h-2 w-full bg-[#1F1F1F] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#DC2626] transition-all duration-500"
                style={{ width: `${Math.min((renewalsUsed / renewalLimit) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {hasUnpaidFines && (
            <div className="bg-[#450A0A] border border-[#DC2626]/30 rounded-lg p-3 flex items-start gap-3 shadow-lg">
              <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
              <p className="text-amber-500 text-xs font-medium leading-relaxed">
                Outstanding fine of <span className="font-bold">₹{fineAmount.toFixed(2)}</span> must be paid before renewal.
              </p>
            </div>
          )}
          {isLimitReached && !hasUnpaidFines && (
            <div className="bg-[#450A0A] border border-[#DC2626]/30 rounded-lg p-3 flex items-start gap-3 shadow-lg">
              <AlertTriangle className="text-[#DC2626] shrink-0 mt-0.5" size={16} />
              <p className="text-[#DC2626] text-xs font-medium leading-relaxed">
                Renewal limit reached. Cannot extend due date further.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-[#1F1F1F] pt-4 flex gap-3 sm:gap-0 mt-2">
          <button
            disabled={isPending}
            onClick={() => setOpen(false)}
            className="px-4 py-2 border border-[#1F1F1F] text-slate-300 hover:bg-[#1F1F1F] hover:text-white rounded-lg transition-colors text-sm font-medium w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            disabled={isPending || isLimitReached || hasUnpaidFines}
            onClick={handleRenew}
            className="px-4 py-2 bg-[#DC2626] hover:bg-red-700 disabled:bg-red-900/50 text-white rounded-lg transition-all text-sm font-medium disabled:cursor-not-allowed w-full sm:w-auto shadow-md"
          >
            {isPending ? 'Processing...' : 'Confirm Renewal'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

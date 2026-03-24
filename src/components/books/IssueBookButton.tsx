"use client";

import { useTransition } from "react";
import { issueBookDirectly } from "@/actions/transaction.actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function IssueBookButton({ bookId, userId, disabled }: { bookId: string, userId: string, disabled: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleIssue = () => {
    if (!userId) {
      toast.error("No valid user found to issue to.");
      return;
    }

    startTransition(async () => {
      const result = await issueBookDirectly(bookId, userId);
      if (result.success) {
        toast.success("Book issued successfully!");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <button 
      disabled={disabled || isPending}
      onClick={handleIssue}
      className="w-full bg-[#DC2626] text-white py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Issuing...
        </>
      ) : (
        "Issue This Book"
      )}
    </button>
  );
}

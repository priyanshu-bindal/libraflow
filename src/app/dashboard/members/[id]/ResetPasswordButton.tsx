"use client";

import { toast } from "sonner";
import { KeyRound, ChevronRight } from "lucide-react";

export default function ResetPasswordButton({ email }: { email: string }) {
  const handleReset = () => {
    toast.success(`Password reset link sent to ${email}`);
  };

  return (
    <div 
      onClick={handleReset}
      className="flex items-center justify-between p-4 rounded-xl border border-[#1F1F1F] hover:bg-[#111111] transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-3">
        <KeyRound className="w-5 h-5 text-gray-400 group-hover:text-white" />
        <span className="text-sm font-medium text-gray-300 group-hover:text-white">Reset Password</span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
    </div>
  );
}

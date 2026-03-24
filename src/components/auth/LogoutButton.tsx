"use client";

import React from "react";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface LogoutButtonProps {
  className?: string;
  isCollapsed?: boolean;
}

export default function LogoutButton({ className, isCollapsed }: LogoutButtonProps) {
  const defaultClasses =
    "flex items-center gap-3 w-full px-4 py-2 text-gray-400 hover:text-white hover:bg-red-900/20 rounded-lg transition-colors";
  
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={className || defaultClasses}
    >
      <LogOut className="w-5 h-5 flex-shrink-0" />
      {!isCollapsed && <span className="whitespace-nowrap font-medium">Logout</span>}
    </button>
  );
}
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function canRenew(dueDate: Date | string): boolean {
  const now = new Date();
  const threeDaysBefore = new Date(dueDate);
  // Subtract 3 days from the due date
  threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
  return now >= threeDaysBefore;
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPages(current: number, total: number): string {
  if (total <= 0) return `${current} стр.`;
  const pct = Math.round((current / total) * 100);
  return `${current} / ${total} стр. (${pct}%)`;
}

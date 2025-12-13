import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function getBaseUrl() {
  if (typeof window !== "undefined") {
    // browser should use relative url
    return "";
  }
  if (process.env.VERCEL_URL) {
    // vercel
    return `https://${process.env.VERCEL_URL}`;
  }
  // localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

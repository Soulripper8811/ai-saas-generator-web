import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  return `https://ai-saas-generator-ml37ltv81-soulripper8811s-projects.vercel.app${path}`;
}

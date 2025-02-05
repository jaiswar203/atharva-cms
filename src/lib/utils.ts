import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function trimText(text: string, length: number = 100) {
  return text.length > length ? text.substring(0, length) + "..." : text;
}

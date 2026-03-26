import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function formatPrice(value: string | number) {
  return new Intl.NumberFormat("ru-RU").format(Number(value));
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | null | undefined,
  currency: string | null | undefined
) {
  // Handle cases where amount or currency is not provided
  if (amount == null || !currency) {
    // Return a sensible default or an empty string
    return amount != null ? amount.toFixed(2) : '0.00';
  }

  try {
    return new Intl.NumberFormat('en-US', { // locale can be dynamic, but 'en-US' is fine for formatting
      style: 'currency',
      currency: currency.toUpperCase(), // Ensure currency code is uppercase (e.g., 'eur', 'usd')
    }).format(amount);
  } catch (error) {
    // Fallback if the currency code is invalid
    console.warn(`Invalid currency code for formatting: ${currency}`);
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  }
}
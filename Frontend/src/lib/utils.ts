import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const getRideIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'bike': return '🚲';
    case 'auto': return '🛺';
    case 'mini': return '🚗';
    case 'sedan': return '🚘';
    case 'suv': return '🚙';
    default: return '🚗';
  }
};

export const api = axios.create({
  baseURL: 'https://yourrideapp.onrender.com/api' || 'http://localhost:3000/api',
  withCredentials: true,
});

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getIntentColor(score: number): string {
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-yellow-500'
  return 'text-red-500'
}

export function getIntentBadge(score: number): string {
  if (score >= 80) return 'bg-green-500/20 text-green-500 border-green-500/50'
  if (score >= 60) return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50'
  return 'bg-red-500/20 text-red-500 border-red-500/50'
}

export function getIntentLabel(score: number): string {
  if (score >= 80) return 'High Intent'
  if (score >= 60) return 'Medium Intent'
  return 'Low Intent'
}

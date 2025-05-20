import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateMeetingId() {
  // Generate a random string for meeting ID
  const chars = "abcdefghijklmnopqrstuvwxyz"
  let result = ""
  for (let i = 0; i < 3; i++) {
    const segment = Array(4)
      .fill(0)
      .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
      .join("")
    result += (i > 0 ? "-" : "") + segment
  }
  return result
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("")
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

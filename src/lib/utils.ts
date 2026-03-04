import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined): string {
    if (!date) return '-'
    const d = new Date(date)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(date: Date | string | null | undefined): string {
    if (!date) return '-'
    const d = new Date(date)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function isOverdue(date: Date | string | null | undefined): boolean {
    if (!date) return false
    return new Date(date) < new Date(new Date().toDateString())
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

export function generateTagColor(name: string): string {
    const colors = [
        '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
        '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#06b6d4',
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
}

export function truncate(str: string, length: number): string {
    if (str.length <= length) return str
    return str.slice(0, length) + '...'
}

export const priorityConfig = {
    LOW: { label: 'Low', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    MEDIUM: { label: 'Medium', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
    HIGH: { label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
    URGENT: { label: 'Urgent', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
}

export const statusConfig = {
    TODO: { label: 'To Do', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    PROGRESS: { label: 'In Progress', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
    DONE: { label: 'Done', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
}

export const eventStatusConfig = {
    PLANNING: { label: 'Planning', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
    READY: { label: 'Ready', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
    DONE: { label: 'Done', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
}

export const contentStatusConfig = {
    DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    REVIEW: { label: 'Review', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
    SCHEDULED: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
    POSTED: { label: 'Posted', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
}

export const platformConfig = {
    INSTAGRAM: { label: 'Instagram', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300' },
    TIKTOK: { label: 'TikTok', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    WEBSITE: { label: 'Website', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
    YOUTUBE: { label: 'YouTube', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
    TWITTER: { label: 'Twitter', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300' },
    OTHER: { label: 'Other', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
}

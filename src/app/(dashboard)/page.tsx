export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckSquare, AlertTriangle, CalendarDays, Megaphone, StickyNote, LinkIcon, Pin, Clock } from "lucide-react"
import { formatDate, isOverdue, statusConfig, priorityConfig } from "@/lib/utils"
import Link from "next/link"

export default async function DashboardPage() {
    const session = await auth()
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
    const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 7)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const [
        tasksDueToday, tasksOverdue, tasksDone, tasksTotal,
        contentScheduled, eventsThisMonth,
        pinnedNotes, pinnedLinks, recentLogs
    ] = await Promise.all([
        prisma.task.count({ where: { dueDate: { gte: today, lt: tomorrow }, status: { not: "DONE" } } }),
        prisma.task.count({ where: { dueDate: { lt: today }, status: { not: "DONE" } } }),
        prisma.task.count({ where: { status: "DONE" } }),
        prisma.task.count(),
        prisma.contentItem.count({ where: { plannedDate: { gte: today, lte: weekEnd }, status: { in: ["SCHEDULED", "REVIEW"] } } }),
        prisma.event.count({ where: { startDate: { gte: monthStart, lte: monthEnd } } }),
        prisma.note.findMany({ where: { pinned: true }, take: 4, orderBy: { updatedAt: "desc" }, include: { tags: true } }),
        prisma.link.findMany({ where: { pinned: true }, take: 6, orderBy: { updatedAt: "desc" }, include: { tags: true } }),
        prisma.auditLog.findMany({
            take: 8,
            orderBy: { createdAt: "desc" },
            include: { user: { select: { name: true } } },
        }),
    ])

    const summaryCards = [
        { label: "Tasks Due Today", value: tasksDueToday, icon: CheckSquare, color: "from-blue-600 to-blue-400", href: "/tasks" },
        { label: "Overdue Tasks", value: tasksOverdue, icon: AlertTriangle, color: "from-red-600 to-red-400", href: "/tasks" },
        { label: "Content Scheduled", value: contentScheduled, icon: Megaphone, color: "from-purple-600 to-purple-400", href: "/content" },
        { label: "Events Bulan Ini", value: eventsThisMonth, icon: CalendarDays, color: "from-emerald-600 to-emerald-400", href: "/events" },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Selamat datang, {session?.user?.name} 👋</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryCards.map((card) => {
                    const Icon = card.icon
                    return (
                        <Link key={card.label} href={card.href}>
                            <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer overflow-hidden">
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{card.label}</p>
                                            <p className="text-3xl font-bold mt-1">{card.value}</p>
                                        </div>
                                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}>
                                            <Icon className="h-5 w-5 text-white" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pinned Notes */}
                <Card className="lg:col-span-1">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Pin className="h-4 w-4 text-violet-500" />
                            Pinned Notes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {pinnedNotes.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Belum ada catatan yang di-pin</p>
                        ) : (
                            pinnedNotes.map((note) => (
                                <Link key={note.id} href="/notes" className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                    <p className="text-sm font-medium truncate">{note.title}</p>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {note.content.replace(/[#*_\[\]]/g, '').slice(0, 100)}
                                    </p>
                                    <div className="flex gap-1 mt-2">
                                        {note.tags.map((tag) => (
                                            <span key={tag.id} className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                </Link>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Pinned Links */}
                <Card className="lg:col-span-1">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 text-blue-500" />
                            Pinned Links
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {pinnedLinks.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Belum ada link yang di-pin</p>
                        ) : (
                            pinnedLinks.map((link) => (
                                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-bold shrink-0">
                                        {link.category.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">{link.title}</p>
                                        <p className="text-[11px] text-muted-foreground truncate">{link.url}</p>
                                    </div>
                                </a>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="lg:col-span-1">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4 text-amber-500" />
                            Aktivitas Terkini
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {recentLogs.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Belum ada aktivitas</p>
                        ) : (
                            recentLogs.map((log) => (
                                <div key={log.id} className="flex items-start gap-2 p-2 rounded-md">
                                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-xs">
                                            <span className="font-medium">{log.user.name}</span>{" "}
                                            <span className="text-muted-foreground">{log.details || `${log.action} ${log.entity}`}</span>
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">{formatDate(log.createdAt)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Task progress */}
            <Card>
                <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold">Task Progress</p>
                        <p className="text-xs text-muted-foreground">{tasksDone} / {tasksTotal} selesai</p>
                    </div>
                    <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: tasksTotal > 0 ? `${(tasksDone / tasksTotal) * 100}%` : '0%' }}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

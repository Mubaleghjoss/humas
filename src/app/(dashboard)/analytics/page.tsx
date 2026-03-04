export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma"
import { AnalyticsClient } from "./analytics-client"

async function getMonthRange(monthsAgo: number) {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0, 23, 59, 59)
    return { start, end, label: start.toLocaleDateString("id-ID", { month: "short" }) }
}

export default async function AnalyticsPage() {
    // Build all month ranges
    const months = await Promise.all(
        Array.from({ length: 6 }, (_, i) => getMonthRange(5 - i))
    )

    // Run ALL queries in parallel instead of sequential loops
    const [
        // Content counts per month (6 queries)
        ...allCounts
    ] = await Promise.all([
        // Content posted per month
        ...months.map(m => prisma.contentItem.count({
            where: { status: "POSTED", postedDate: { gte: m.start, lte: m.end } },
        })),
        // Tasks done per month
        ...months.map(m => prisma.task.count({
            where: { status: "DONE", updatedAt: { gte: m.start, lte: m.end } },
        })),
        // Tasks open per month
        ...months.map(m => prisma.task.count({
            where: { status: { not: "DONE" }, createdAt: { gte: m.start, lte: m.end } },
        })),
        // Events per month
        ...months.map(m => prisma.event.count({
            where: { startDate: { gte: m.start, lte: m.end } },
        })),
        // Summary stats
        prisma.task.count(),
        prisma.task.count({ where: { status: "DONE" } }),
        prisma.contentItem.count(),
        prisma.event.count(),
        prisma.contact.count(),
        // Tags
        prisma.tag.findMany({
            include: {
                _count: { select: { tasks: true, notes: true, contacts: true, events: true, contentItems: true } },
            },
        }),
    ])

    // Parse results
    const contentByMonth = months.map((m, i) => ({ month: m.label, count: allCounts[i] as number }))
    const tasksDoneByMonth = months.map((m, i) => allCounts[6 + i] as number)
    const tasksOpenByMonth = months.map((m, i) => allCounts[12 + i] as number)
    const tasksByMonth = months.map((m, i) => ({ month: m.label, done: tasksDoneByMonth[i], open: tasksOpenByMonth[i] }))
    const eventsByMonth = months.map((m, i) => ({ month: m.label, count: allCounts[18 + i] as number }))

    const totalTasks = allCounts[24] as number
    const totalDone = allCounts[25] as number
    const totalContent = allCounts[26] as number
    const totalEvents = allCounts[27] as number
    const totalContacts = allCounts[28] as number

    const allTags = allCounts[29] as any[]
    const topTags = allTags
        .map((t: any) => ({
            name: t.name,
            color: t.color,
            count: t._count.tasks + t._count.notes + t._count.contacts + t._count.events + t._count.contentItems,
        }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 8)

    return (
        <AnalyticsClient
            contentByMonth={contentByMonth}
            tasksByMonth={tasksByMonth}
            eventsByMonth={eventsByMonth}
            topTags={topTags}
            stats={{ totalTasks, totalDone, totalContent, totalEvents, totalContacts }}
        />
    )
}

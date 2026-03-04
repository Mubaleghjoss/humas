"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { eventSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/lib/audit"

export async function getEvents(filters?: { status?: string; search?: string; month?: number; year?: number }) {
    const where: any = {}
    if (filters?.status && filters.status !== "ALL") where.status = filters.status
    if (filters?.search) {
        where.OR = [
            { title: { contains: filters.search } },
            { description: { contains: filters.search } },
        ]
    }
    if (filters?.month && filters?.year) {
        const start = new Date(filters.year, filters.month - 1, 1)
        const end = new Date(filters.year, filters.month, 0, 23, 59, 59)
        where.startDate = { gte: start, lte: end }
    }

    return prisma.event.findMany({
        where,
        include: {
            picUser: { select: { id: true, name: true } },
            tags: true,
            checklist: true,
            links: true,
        },
        orderBy: { startDate: "asc" },
    })
}

export async function createEvent(formData: FormData) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    const data = eventSchema.parse({
        title: formData.get("title"),
        description: formData.get("description") || undefined,
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate") || undefined,
        location: formData.get("location") || undefined,
        status: formData.get("status") || "PLANNING",
        picUserId: formData.get("picUserId") || session.user.id,
        tags: formData.getAll("tags"),
    })

    const event = await prisma.event.create({
        data: {
            title: data.title,
            description: data.description || null,
            startDate: new Date(data.startDate),
            endDate: data.endDate ? new Date(data.endDate) : null,
            location: data.location || null,
            status: data.status as any,
            picUserId: data.picUserId,
            tags: data.tags?.length ? { connect: data.tags.map(id => ({ id })) } : undefined,
        },
    })

    await logActivity("CREATE", "Event", event.id, `Membuat event: ${event.title}`)
    revalidatePath("/events")
    revalidatePath("/")
    return event
}

export async function updateEvent(id: string, formData: FormData) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    const data = eventSchema.parse({
        title: formData.get("title"),
        description: formData.get("description") || undefined,
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate") || undefined,
        location: formData.get("location") || undefined,
        status: formData.get("status") || "PLANNING",
        picUserId: formData.get("picUserId") || session.user.id,
        tags: formData.getAll("tags"),
    })

    await prisma.event.update({ where: { id }, data: { tags: { set: [] } } })

    const event = await prisma.event.update({
        where: { id },
        data: {
            title: data.title,
            description: data.description || null,
            startDate: new Date(data.startDate),
            endDate: data.endDate ? new Date(data.endDate) : null,
            location: data.location || null,
            status: data.status as any,
            picUserId: data.picUserId,
            tags: data.tags?.length ? { connect: data.tags.map(tid => ({ id: tid })) } : undefined,
        },
    })

    await logActivity("UPDATE", "Event", event.id, `Mengubah event: ${event.title}`)
    revalidatePath("/events")
    revalidatePath("/")
    return event
}

export async function deleteEvent(id: string) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    const event = await prisma.event.delete({ where: { id } })
    await logActivity("DELETE", "Event", id, `Menghapus event: ${event.title}`)
    revalidatePath("/events")
    revalidatePath("/")
}

export async function toggleEventChecklistItem(itemId: string) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    const item = await prisma.eventChecklistItem.findUnique({ where: { id: itemId } })
    if (!item) throw new Error("Not found")

    await prisma.eventChecklistItem.update({
        where: { id: itemId },
        data: { completed: !item.completed },
    })
    revalidatePath("/events")
}

export async function addEventChecklistItem(eventId: string, text: string) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    await prisma.eventChecklistItem.create({
        data: { text, eventId },
    })
    revalidatePath("/events")
}

export async function addEventLink(eventId: string, title: string, url: string) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    await prisma.eventLink.create({
        data: { title, url, eventId },
    })
    revalidatePath("/events")
}

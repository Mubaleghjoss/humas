"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { contentSchema, hashtagSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/lib/audit"

export async function getContentItems(filters?: { status?: string; platform?: string; search?: string; month?: number; year?: number }) {
    const where: any = {}
    if (filters?.status && filters.status !== "ALL") where.status = filters.status
    if (filters?.platform && filters.platform !== "ALL") where.platform = filters.platform
    if (filters?.search) {
        where.OR = [
            { title: { contains: filters.search } },
            { caption: { contains: filters.search } },
        ]
    }
    if (filters?.month && filters?.year) {
        const start = new Date(filters.year, filters.month - 1, 1)
        const end = new Date(filters.year, filters.month, 0, 23, 59, 59)
        where.plannedDate = { gte: start, lte: end }
    }

    return prisma.contentItem.findMany({
        where,
        include: {
            user: { select: { id: true, name: true } },
            tags: true,
        },
        orderBy: { plannedDate: "asc" },
    })
}

export async function createContent(formData: FormData) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    const data = contentSchema.parse({
        title: formData.get("title"),
        platform: formData.get("platform") || "INSTAGRAM",
        plannedDate: formData.get("plannedDate") || undefined,
        postedDate: formData.get("postedDate") || undefined,
        status: formData.get("status") || "DRAFT",
        caption: formData.get("caption") || undefined,
        hashtags: formData.get("hashtags") || undefined,
        assetLinks: formData.get("assetLinks") || undefined,
        tags: formData.getAll("tags"),
    })

    const item = await prisma.contentItem.create({
        data: {
            title: data.title,
            platform: data.platform as any,
            plannedDate: data.plannedDate ? new Date(data.plannedDate) : null,
            postedDate: data.postedDate ? new Date(data.postedDate) : null,
            status: data.status as any,
            caption: data.caption || null,
            hashtags: data.hashtags || null,
            assetLinks: data.assetLinks || null,
            userId: session.user.id,
            tags: data.tags?.length ? { connect: data.tags.map(id => ({ id })) } : undefined,
        },
    })

    await logActivity("CREATE", "Content", item.id, `Membuat konten: ${item.title}`)
    revalidatePath("/content")
    revalidatePath("/")
    return item
}

export async function updateContent(id: string, formData: FormData) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    const data = contentSchema.parse({
        title: formData.get("title"),
        platform: formData.get("platform") || "INSTAGRAM",
        plannedDate: formData.get("plannedDate") || undefined,
        postedDate: formData.get("postedDate") || undefined,
        status: formData.get("status") || "DRAFT",
        caption: formData.get("caption") || undefined,
        hashtags: formData.get("hashtags") || undefined,
        assetLinks: formData.get("assetLinks") || undefined,
        tags: formData.getAll("tags"),
    })

    await prisma.contentItem.update({ where: { id }, data: { tags: { set: [] } } })

    const item = await prisma.contentItem.update({
        where: { id },
        data: {
            title: data.title,
            platform: data.platform as any,
            plannedDate: data.plannedDate ? new Date(data.plannedDate) : null,
            postedDate: data.postedDate ? new Date(data.postedDate) : null,
            status: data.status as any,
            caption: data.caption || null,
            hashtags: data.hashtags || null,
            assetLinks: data.assetLinks || null,
            tags: data.tags?.length ? { connect: data.tags.map(tid => ({ id: tid })) } : undefined,
        },
    })

    await logActivity("UPDATE", "Content", item.id, `Mengubah konten: ${item.title}`)
    revalidatePath("/content")
    revalidatePath("/")
    return item
}

export async function deleteContent(id: string) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    const item = await prisma.contentItem.delete({ where: { id } })
    await logActivity("DELETE", "Content", id, `Menghapus konten: ${item.title}`)
    revalidatePath("/content")
    revalidatePath("/")
}

// Hashtag Bank
export async function getHashtags() {
    return prisma.hashtag.findMany({ orderBy: { category: "asc" } })
}

export async function createHashtag(formData: FormData) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    const data = hashtagSchema.parse({
        name: formData.get("name"),
        category: formData.get("category") || "General",
    })

    const hashtag = await prisma.hashtag.create({ data })
    revalidatePath("/content")
    return hashtag
}

export async function deleteHashtag(id: string) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    await prisma.hashtag.delete({ where: { id } })
    revalidatePath("/content")
}

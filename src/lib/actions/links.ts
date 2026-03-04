"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { linkSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/lib/audit"

export async function getLinks(filters?: { search?: string; category?: string }) {
    const where: any = {}
    if (filters?.search) {
        where.OR = [
            { title: { contains: filters.search } },
            { description: { contains: filters.search } },
            { url: { contains: filters.search } },
        ]
    }
    if (filters?.category && filters.category !== "ALL") where.category = filters.category

    return prisma.link.findMany({
        where,
        include: {
            user: { select: { id: true, name: true } },
            tags: true,
        },
        orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    })
}

export async function createLink(formData: FormData) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    const data = linkSchema.parse({
        title: formData.get("title"),
        url: formData.get("url"),
        category: formData.get("category") || "General",
        description: formData.get("description") || undefined,
        pinned: formData.get("pinned") === "true",
        tags: formData.getAll("tags"),
    })

    const link = await prisma.link.create({
        data: {
            title: data.title,
            url: data.url,
            category: data.category,
            description: data.description || null,
            pinned: data.pinned,
            userId: session.user.id,
            tags: data.tags?.length ? { connect: data.tags.map(id => ({ id })) } : undefined,
        },
    })

    await logActivity("CREATE", "Link", link.id, `Membuat link: ${link.title}`)
    revalidatePath("/links")
    revalidatePath("/")
    return link
}

export async function updateLink(id: string, formData: FormData) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    const data = linkSchema.parse({
        title: formData.get("title"),
        url: formData.get("url"),
        category: formData.get("category") || "General",
        description: formData.get("description") || undefined,
        pinned: formData.get("pinned") === "true",
        tags: formData.getAll("tags"),
    })

    await prisma.link.update({ where: { id }, data: { tags: { set: [] } } })

    const link = await prisma.link.update({
        where: { id },
        data: {
            title: data.title,
            url: data.url,
            category: data.category,
            description: data.description || null,
            pinned: data.pinned,
            tags: data.tags?.length ? { connect: data.tags.map(tid => ({ id: tid })) } : undefined,
        },
    })

    await logActivity("UPDATE", "Link", link.id, `Mengubah link: ${link.title}`)
    revalidatePath("/links")
    revalidatePath("/")
    return link
}

export async function deleteLink(id: string) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    const link = await prisma.link.delete({ where: { id } })
    await logActivity("DELETE", "Link", id, `Menghapus link: ${link.title}`)
    revalidatePath("/links")
    revalidatePath("/")
}

export async function toggleLinkPin(id: string) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    const link = await prisma.link.findUnique({ where: { id } })
    if (!link) throw new Error("Not found")

    await prisma.link.update({ where: { id }, data: { pinned: !link.pinned } })
    revalidatePath("/links")
    revalidatePath("/")
}

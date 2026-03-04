"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { noteSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/lib/audit"

export async function getNotes(search?: string) {
    const where: any = {}
    if (search) {
        where.OR = [
            { title: { contains: search } },
            { content: { contains: search } },
        ]
    }

    return prisma.note.findMany({
        where,
        include: {
            user: { select: { id: true, name: true } },
            tags: true,
        },
        orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    })
}

export async function getNote(id: string) {
    return prisma.note.findUnique({
        where: { id },
        include: { tags: true, user: { select: { id: true, name: true } } },
    })
}

export async function createNote(formData: FormData) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    const data = noteSchema.parse({
        title: formData.get("title"),
        content: formData.get("content"),
        pinned: formData.get("pinned") === "true",
        tags: formData.getAll("tags"),
    })

    const note = await prisma.note.create({
        data: {
            title: data.title,
            content: data.content,
            pinned: data.pinned,
            userId: session.user.id,
            tags: data.tags?.length ? { connect: data.tags.map(id => ({ id })) } : undefined,
        },
    })

    await logActivity("CREATE", "Note", note.id, `Membuat note: ${note.title}`)
    revalidatePath("/notes")
    revalidatePath("/")
    return note
}

export async function updateNote(id: string, formData: FormData) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    const data = noteSchema.parse({
        title: formData.get("title"),
        content: formData.get("content"),
        pinned: formData.get("pinned") === "true",
        tags: formData.getAll("tags"),
    })

    await prisma.note.update({ where: { id }, data: { tags: { set: [] } } })

    const note = await prisma.note.update({
        where: { id },
        data: {
            title: data.title,
            content: data.content,
            pinned: data.pinned,
            tags: data.tags?.length ? { connect: data.tags.map(tid => ({ id: tid })) } : undefined,
        },
    })

    await logActivity("UPDATE", "Note", note.id, `Mengubah note: ${note.title}`)
    revalidatePath("/notes")
    revalidatePath("/")
    return note
}

export async function deleteNote(id: string) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    const note = await prisma.note.delete({ where: { id } })
    await logActivity("DELETE", "Note", id, `Menghapus note: ${note.title}`)
    revalidatePath("/notes")
    revalidatePath("/")
}

export async function toggleNotePin(id: string) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    const note = await prisma.note.findUnique({ where: { id } })
    if (!note) throw new Error("Not found")

    await prisma.note.update({ where: { id }, data: { pinned: !note.pinned } })
    revalidatePath("/notes")
    revalidatePath("/")
}

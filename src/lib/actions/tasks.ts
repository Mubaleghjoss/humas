"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { taskSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/lib/audit"

export async function getTasks(filters?: {
    status?: string
    priority?: string
    search?: string
}) {
    const where: any = {}
    if (filters?.status && filters.status !== "ALL") where.status = filters.status
    if (filters?.priority && filters.priority !== "ALL") where.priority = filters.priority
    if (filters?.search) {
        where.OR = [
            { title: { contains: filters.search } },
            { description: { contains: filters.search } },
        ]
    }

    return prisma.task.findMany({
        where,
        include: {
            creator: { select: { id: true, name: true, username: true } },
            assignee: { select: { id: true, name: true, username: true } },
            tags: true,
            checklist: true,
        },
        orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    })
}

export async function createTask(formData: FormData) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    const raw = {
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || undefined,
        status: (formData.get("status") as string) || "TODO",
        priority: (formData.get("priority") as string) || "MEDIUM",
        dueDate: (formData.get("dueDate") as string) || undefined,
        assigneeId: (formData.get("assigneeId") as string) || undefined,
        tags: formData.getAll("tags") as string[],
    }

    const data = taskSchema.parse(raw)

    const task = await prisma.task.create({
        data: {
            title: data.title,
            description: data.description || null,
            status: data.status as any,
            priority: data.priority as any,
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
            creatorId: session.user.id,
            assigneeId: data.assigneeId || null,
            tags: data.tags?.length ? { connect: data.tags.map(id => ({ id })) } : undefined,
        },
    })

    await logActivity("CREATE", "Task", task.id, `Membuat task: ${task.title}`)
    revalidatePath("/tasks")
    revalidatePath("/")
    return task
}

export async function updateTask(id: string, formData: FormData) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    const raw = {
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || undefined,
        status: (formData.get("status") as string) || "TODO",
        priority: (formData.get("priority") as string) || "MEDIUM",
        dueDate: (formData.get("dueDate") as string) || undefined,
        assigneeId: (formData.get("assigneeId") as string) || undefined,
        tags: formData.getAll("tags") as string[],
    }

    const data = taskSchema.parse(raw)

    // Disconnect all existing tags, then reconnect
    await prisma.task.update({
        where: { id },
        data: { tags: { set: [] } },
    })

    const task = await prisma.task.update({
        where: { id },
        data: {
            title: data.title,
            description: data.description || null,
            status: data.status as any,
            priority: data.priority as any,
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
            assigneeId: data.assigneeId || null,
            tags: data.tags?.length ? { connect: data.tags.map(tid => ({ id: tid })) } : undefined,
        },
    })

    await logActivity("UPDATE", "Task", task.id, `Mengubah task: ${task.title}`)
    revalidatePath("/tasks")
    revalidatePath("/")
    return task
}

export async function deleteTask(id: string) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    const task = await prisma.task.delete({ where: { id } })
    await logActivity("DELETE", "Task", id, `Menghapus task: ${task.title}`)
    revalidatePath("/tasks")
    revalidatePath("/")
}

export async function updateTaskStatus(id: string, status: string) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    const task = await prisma.task.update({
        where: { id },
        data: { status: status as any },
    })
    await logActivity("UPDATE", "Task", id, `Status task "${task.title}" -> ${status}`)
    revalidatePath("/tasks")
    revalidatePath("/")
}

export async function bulkUpdateTaskStatus(ids: string[], status: string) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    await prisma.task.updateMany({
        where: { id: { in: ids } },
        data: { status: status as any },
    })
    await logActivity("UPDATE", "Task", undefined, `Bulk update ${ids.length} tasks -> ${status}`)
    revalidatePath("/tasks")
    revalidatePath("/")
}

export async function bulkDeleteTasks(ids: string[]) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    await prisma.task.deleteMany({ where: { id: { in: ids } } })
    await logActivity("DELETE", "Task", undefined, `Bulk delete ${ids.length} tasks`)
    revalidatePath("/tasks")
    revalidatePath("/")
}

export async function toggleChecklistItem(itemId: string) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    const item = await prisma.taskChecklistItem.findUnique({ where: { id: itemId } })
    if (!item) throw new Error("Not found")

    await prisma.taskChecklistItem.update({
        where: { id: itemId },
        data: { completed: !item.completed },
    })
    revalidatePath("/tasks")
}

"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { templateSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/lib/audit"

export async function getTemplates(filters?: { search?: string; category?: string }) {
    const where: any = {}
    if (filters?.search) {
        where.OR = [
            { title: { contains: filters.search } },
            { content: { contains: filters.search } },
        ]
    }
    if (filters?.category && filters.category !== "ALL") where.category = filters.category

    return prisma.template.findMany({
        where,
        include: { user: { select: { id: true, name: true } } },
        orderBy: { updatedAt: "desc" },
    })
}

export async function createTemplate(formData: FormData) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    const data = templateSchema.parse({
        title: formData.get("title"),
        category: formData.get("category") || "OTHER",
        content: formData.get("content"),
    })

    // Auto-detect variables
    const varMatches = data.content.match(/\{([A-Z_]+)\}/g)
    const variables = varMatches ? [...new Set(varMatches.map(v => v.slice(1, -1)))].join(",") : null

    const tmpl = await prisma.template.create({
        data: {
            title: data.title,
            category: data.category as any,
            content: data.content,
            variables,
            userId: session.user.id,
        },
    })

    await logActivity("CREATE", "Template", tmpl.id, `Membuat template: ${tmpl.title}`)
    revalidatePath("/templates")
    return tmpl
}

export async function updateTemplate(id: string, formData: FormData) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    const data = templateSchema.parse({
        title: formData.get("title"),
        category: formData.get("category") || "OTHER",
        content: formData.get("content"),
    })

    const varMatches = data.content.match(/\{([A-Z_]+)\}/g)
    const variables = varMatches ? [...new Set(varMatches.map(v => v.slice(1, -1)))].join(",") : null

    const tmpl = await prisma.template.update({
        where: { id },
        data: {
            title: data.title,
            category: data.category as any,
            content: data.content,
            variables,
        },
    })

    await logActivity("UPDATE", "Template", tmpl.id, `Mengubah template: ${tmpl.title}`)
    revalidatePath("/templates")
    return tmpl
}

export async function deleteTemplate(id: string) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    const tmpl = await prisma.template.delete({ where: { id } })
    await logActivity("DELETE", "Template", id, `Menghapus template: ${tmpl.title}`)
    revalidatePath("/templates")
}

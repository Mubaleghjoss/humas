"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { contactSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/lib/audit"

export async function getContacts(filters?: { search?: string }) {
    const where: any = {}
    if (filters?.search) {
        where.OR = [
            { name: { contains: filters.search } },
            { organization: { contains: filters.search } },
            { roleTitle: { contains: filters.search } },
            { email: { contains: filters.search } },
            { phone: { contains: filters.search } },
        ]
    }

    return prisma.contact.findMany({
        where,
        include: {
            user: { select: { id: true, name: true } },
            tags: true,
        },
        orderBy: { name: "asc" },
    })
}

export async function createContact(formData: FormData) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    const data = contactSchema.parse({
        name: formData.get("name"),
        roleTitle: formData.get("roleTitle") || undefined,
        organization: formData.get("organization") || undefined,
        phone: formData.get("phone") || undefined,
        whatsapp: formData.get("whatsapp") || undefined,
        email: formData.get("email") || undefined,
        address: formData.get("address") || undefined,
        notes: formData.get("notes") || undefined,
        tags: formData.getAll("tags"),
    })

    const contact = await prisma.contact.create({
        data: {
            name: data.name,
            roleTitle: data.roleTitle || null,
            organization: data.organization || null,
            phone: data.phone || null,
            whatsapp: data.whatsapp || null,
            email: data.email || null,
            address: data.address || null,
            notes: data.notes || null,
            userId: session.user.id,
            tags: data.tags?.length ? { connect: data.tags.map(id => ({ id })) } : undefined,
        },
    })

    await logActivity("CREATE", "Contact", contact.id, `Membuat kontak: ${contact.name}`)
    revalidatePath("/contacts")
    return contact
}

export async function updateContact(id: string, formData: FormData) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    const data = contactSchema.parse({
        name: formData.get("name"),
        roleTitle: formData.get("roleTitle") || undefined,
        organization: formData.get("organization") || undefined,
        phone: formData.get("phone") || undefined,
        whatsapp: formData.get("whatsapp") || undefined,
        email: formData.get("email") || undefined,
        address: formData.get("address") || undefined,
        notes: formData.get("notes") || undefined,
        tags: formData.getAll("tags"),
    })

    await prisma.contact.update({ where: { id }, data: { tags: { set: [] } } })

    const contact = await prisma.contact.update({
        where: { id },
        data: {
            name: data.name,
            roleTitle: data.roleTitle || null,
            organization: data.organization || null,
            phone: data.phone || null,
            whatsapp: data.whatsapp || null,
            email: data.email || null,
            address: data.address || null,
            notes: data.notes || null,
            tags: data.tags?.length ? { connect: data.tags.map(tid => ({ id: tid })) } : undefined,
        },
    })

    await logActivity("UPDATE", "Contact", contact.id, `Mengubah kontak: ${contact.name}`)
    revalidatePath("/contacts")
    return contact
}

export async function deleteContact(id: string) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    const contact = await prisma.contact.delete({ where: { id } })
    await logActivity("DELETE", "Contact", id, `Menghapus kontak: ${contact.name}`)
    revalidatePath("/contacts")
}

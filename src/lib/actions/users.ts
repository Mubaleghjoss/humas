"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { userSchema } from "@/lib/validations"
import { hashSync } from "bcryptjs"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/lib/audit"

export async function getUsers() {
    return prisma.user.findMany({
        select: { id: true, username: true, name: true, email: true, role: true, active: true, createdAt: true },
        orderBy: { createdAt: "asc" },
    })
}

export async function createUser(formData: FormData) {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized")

    const data = userSchema.parse({
        username: formData.get("username"),
        name: formData.get("name"),
        email: formData.get("email") || undefined,
        password: formData.get("password"),
        role: formData.get("role") || "HUMAS",
        active: true,
    })

    if (!data.password) throw new Error("Password wajib diisi")

    const user = await prisma.user.create({
        data: {
            username: data.username,
            name: data.name,
            email: data.email || null,
            password: hashSync(data.password, 12),
            role: data.role as any,
        },
    })

    await logActivity("CREATE", "User", user.id, `Membuat user: ${user.username}`)
    revalidatePath("/settings/users")
    return user
}

export async function updateUser(id: string, formData: FormData) {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized")

    const updateData: any = {
        username: formData.get("username"),
        name: formData.get("name"),
        email: formData.get("email") || null,
        role: formData.get("role"),
        active: formData.get("active") === "true",
    }

    const password = formData.get("password") as string
    if (password && password.length >= 6) {
        updateData.password = hashSync(password, 12)
    }

    const user = await prisma.user.update({ where: { id }, data: updateData })
    await logActivity("UPDATE", "User", user.id, `Mengubah user: ${user.username}`)
    revalidatePath("/settings/users")
    return user
}

export async function deleteUser(id: string) {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized")
    if (id === session.user.id) throw new Error("Tidak bisa menghapus diri sendiri")

    const user = await prisma.user.delete({ where: { id } })
    await logActivity("DELETE", "User", id, `Menghapus user: ${user.username}`)
    revalidatePath("/settings/users")
}

export async function resetPassword(id: string, newPassword: string) {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized")

    await prisma.user.update({
        where: { id },
        data: { password: hashSync(newPassword, 12) },
    })
    await logActivity("UPDATE", "User", id, `Reset password user`)
    revalidatePath("/settings/users")
}

// Tags
export async function getTags() {
    return prisma.tag.findMany({ orderBy: { name: "asc" } })
}

export async function createTag(name: string, color?: string) {
    const session = await auth()
    if (!session?.user || session.user.role === "VIEWER") throw new Error("Unauthorized")

    return prisma.tag.create({ data: { name, color: color || undefined } })
}

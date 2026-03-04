"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function logActivity(
    action: string,
    entity: string,
    entityId?: string,
    details?: string
) {
    try {
        const session = await auth()
        if (!session?.user?.id) return

        await prisma.auditLog.create({
            data: {
                action,
                entity,
                entityId,
                details,
                userId: session.user.id,
            },
        })
    } catch (error) {
        console.error("Failed to log activity:", error)
    }
}

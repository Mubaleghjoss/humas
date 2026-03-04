import { z } from "zod"

export const loginSchema = z.object({
    username: z.string().min(1, "Username wajib diisi"),
    password: z.string().min(1, "Password wajib diisi"),
})

export const taskSchema = z.object({
    title: z.string().min(1, "Judul wajib diisi"),
    description: z.string().optional(),
    status: z.enum(["TODO", "PROGRESS", "DONE"]).default("TODO"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
    dueDate: z.string().optional(),
    assigneeId: z.string().optional(),
    tags: z.array(z.string()).optional(),
})

export const noteSchema = z.object({
    title: z.string().min(1, "Judul wajib diisi"),
    content: z.string().min(1, "Konten wajib diisi"),
    pinned: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
})

export const linkSchema = z.object({
    title: z.string().min(1, "Judul wajib diisi"),
    url: z.string().url("URL tidak valid"),
    category: z.string().default("General"),
    description: z.string().optional(),
    pinned: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
})

export const contactSchema = z.object({
    name: z.string().min(1, "Nama wajib diisi"),
    roleTitle: z.string().optional(),
    organization: z.string().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    email: z.string().email("Email tidak valid").optional().or(z.literal("")),
    address: z.string().optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
})

export const eventSchema = z.object({
    title: z.string().min(1, "Judul wajib diisi"),
    description: z.string().optional(),
    startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
    endDate: z.string().optional(),
    location: z.string().optional(),
    status: z.enum(["PLANNING", "READY", "DONE"]).default("PLANNING"),
    picUserId: z.string().min(1, "PIC wajib diisi"),
    tags: z.array(z.string()).optional(),
})

export const contentSchema = z.object({
    title: z.string().min(1, "Judul wajib diisi"),
    platform: z.enum(["INSTAGRAM", "TIKTOK", "WEBSITE", "YOUTUBE", "TWITTER", "OTHER"]).default("INSTAGRAM"),
    plannedDate: z.string().optional(),
    postedDate: z.string().optional(),
    status: z.enum(["DRAFT", "REVIEW", "SCHEDULED", "POSTED"]).default("DRAFT"),
    caption: z.string().optional(),
    hashtags: z.string().optional(),
    assetLinks: z.string().optional(),
    tags: z.array(z.string()).optional(),
})

export const templateSchema = z.object({
    title: z.string().min(1, "Judul wajib diisi"),
    category: z.enum(["CAPTION", "PRESS_RELEASE", "INVITATION", "LETTER", "OTHER"]).default("OTHER"),
    content: z.string().min(1, "Konten wajib diisi"),
})

export const userSchema = z.object({
    username: z.string().min(3, "Username min 3 karakter"),
    name: z.string().min(1, "Nama wajib diisi"),
    email: z.string().email("Email tidak valid").optional().or(z.literal("")),
    password: z.string().min(6, "Password min 6 karakter").optional(),
    role: z.enum(["ADMIN", "HUMAS", "VIEWER"]).default("HUMAS"),
    active: z.boolean().default(true),
})

export const hashtagSchema = z.object({
    name: z.string().min(1, "Hashtag wajib diisi"),
    category: z.string().default("General"),
})

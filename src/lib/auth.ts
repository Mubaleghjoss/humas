import type { NextAuthOptions, Session } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compareSync } from "bcryptjs"
import { prisma } from "./prisma"
import { getServerSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            username: string
            name: string
            email?: string | null
            role: "ADMIN" | "HUMAS" | "VIEWER"
        }
    }
    interface User {
        id: string
        username: string
        name: string
        email?: string | null
        role: "ADMIN" | "HUMAS" | "VIEWER"
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        username: string
        role: "ADMIN" | "HUMAS" | "VIEWER"
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { username: credentials.username },
                })

                if (!user || !user.active) return null

                const isValid = compareSync(credentials.password, user.password)
                if (!isValid) return null

                return {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.username = (user as any).username
                token.role = (user as any).role
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.username = token.username as string
                session.user.role = token.role as "ADMIN" | "HUMAS" | "VIEWER"
            }
            return session
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
}

export async function auth(): Promise<Session | null> {
    return getServerSession(authOptions)
}

import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    // Public paths
    if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
        return NextResponse.next()
    }

    const token = await getToken({ req, secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET })

    // Redirect to login if not logged in
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    // Already logged in, redirect from login
    if (pathname === "/login") {
        return NextResponse.redirect(new URL("/", req.url))
    }

    // Admin only paths
    if (pathname.startsWith("/settings")) {
        if (token.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", req.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
}

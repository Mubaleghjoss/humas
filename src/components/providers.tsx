"use client"

import * as React from "react"
import { Suspense } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"
import { TopLoader } from "./top-loader"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
                <Suspense fallback={null}>
                    <TopLoader />
                </Suspense>
                {children}
                <Toaster richColors position="top-right" />
            </NextThemesProvider>
        </SessionProvider>
    )
}

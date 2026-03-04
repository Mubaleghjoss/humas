"use client"

import { useEffect, useState, useCallback } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function TopLoader() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)

    const startLoading = useCallback(() => {
        setLoading(true)
        setProgress(20)
        const t1 = setTimeout(() => setProgress(50), 100)
        const t2 = setTimeout(() => setProgress(70), 300)
        const t3 = setTimeout(() => setProgress(85), 600)
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    }, [])

    useEffect(() => {
        setProgress(100)
        const timeout = setTimeout(() => {
            setLoading(false)
            setProgress(0)
        }, 200)
        return () => clearTimeout(timeout)
    }, [pathname, searchParams])

    // Intercept link clicks to show loader immediately
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const anchor = target.closest("a")
            if (!anchor) return
            const href = anchor.getAttribute("href")
            if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) return
            if (href === pathname) return
            startLoading()
        }
        document.addEventListener("click", handleClick)
        return () => document.removeEventListener("click", handleClick)
    }, [pathname, startLoading])

    if (!loading && progress === 0) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] h-[3px]">
            <div
                className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-violet-600 shadow-lg shadow-violet-500/30 transition-all ease-out"
                style={{
                    width: `${progress}%`,
                    transitionDuration: progress === 100 ? "200ms" : "400ms",
                    opacity: progress === 100 ? 0 : 1,
                }}
            />
        </div>
    )
}

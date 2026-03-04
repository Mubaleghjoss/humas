"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard, CheckSquare, StickyNote, LinkIcon, Users,
    CalendarDays, FileText, BarChart3, Settings, ChevronLeft,
    ChevronRight, Megaphone, Zap
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tasks", label: "Tasks", icon: CheckSquare },
    { href: "/notes", label: "Notes", icon: StickyNote },
    { href: "/links", label: "Links", icon: LinkIcon },
    { href: "/contacts", label: "Contacts", icon: Users },
    { href: "/events", label: "Events", icon: CalendarDays },
    { href: "/content", label: "Content", icon: Megaphone },
    { href: "/templates", label: "Templates", icon: FileText },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
]

const adminItems = [
    { href: "/settings/users", label: "Kelola User", icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const [collapsed, setCollapsed] = useState(false)

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/"
        return pathname.startsWith(href)
    }

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-card transition-all duration-300",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center border-b px-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25">
                        <Zap className="h-5 w-5 text-white" />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col">
                            <span className="text-sm font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                                HumasHub PRO
                            </span>
                            <span className="text-[10px] text-muted-foreground">SMA AFBS</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                <div className={cn("mb-2", !collapsed && "px-2")}>
                    {!collapsed && <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Menu</p>}
                </div>
                {navItems.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                                active
                                    ? "bg-gradient-to-r from-violet-600/10 to-indigo-600/10 text-violet-600 dark:text-violet-400 shadow-sm"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                                collapsed && "justify-center px-2"
                            )}
                        >
                            <Icon className={cn("h-4 w-4 shrink-0", active && "text-violet-600 dark:text-violet-400")} />
                            {!collapsed && <span>{item.label}</span>}
                        </Link>
                    )
                })}

                {session?.user?.role === "ADMIN" && (
                    <>
                        <div className={cn("mt-6 mb-2", !collapsed && "px-2")}>
                            {!collapsed && <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Admin</p>}
                        </div>
                        {adminItems.map((item) => {
                            const Icon = item.icon
                            const active = isActive(item.href)
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                                        active
                                            ? "bg-gradient-to-r from-violet-600/10 to-indigo-600/10 text-violet-600 dark:text-violet-400 shadow-sm"
                                            : "text-muted-foreground hover:bg-accent hover:text-foreground",
                                        collapsed && "justify-center px-2"
                                    )}
                                >
                                    <Icon className={cn("h-4 w-4 shrink-0", active && "text-violet-600 dark:text-violet-400")} />
                                    {!collapsed && <span>{item.label}</span>}
                                </Link>
                            )
                        })}
                    </>
                )}
            </nav>

            {/* Collapse toggle */}
            <div className="border-t p-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full justify-center"
                >
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    {!collapsed && <span className="ml-2 text-xs">Collapse</span>}
                </Button>
            </div>
        </aside>
    )
}

"use client"

import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { Search, Moon, Sun, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getInitials } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export function Topbar() {
    const { data: session } = useSession()
    const { theme, setTheme } = useTheme()

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder='Cari di HumasHub... (tekan "/")'
                    className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
                />
            </div>

            <div className="flex items-center gap-2 ml-auto">
                {/* Theme Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="rounded-full"
                >
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 gap-2 rounded-full px-2">
                            <Avatar className="h-7 w-7">
                                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-[10px]">
                                    {getInitials(session?.user?.name || "U")}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start text-left max-sm:hidden">
                                <span className="text-xs font-medium">{session?.user?.name}</span>
                                <span className="text-[10px] text-muted-foreground">{session?.user?.role}</span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium">{session?.user?.name}</p>
                                <p className="text-xs text-muted-foreground">@{session?.user?.username}</p>
                                <Badge variant="secondary" className="w-fit text-[10px] mt-1">{session?.user?.role}</Badge>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            Profil
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })} className="text-red-600 dark:text-red-400">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}

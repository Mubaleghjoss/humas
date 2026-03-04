"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from "recharts"
import { CheckSquare, Megaphone, CalendarDays, Users, TrendingUp } from "lucide-react"

interface Props {
    contentByMonth: { month: string; count: number }[]
    tasksByMonth: { month: string; done: number; open: number }[]
    eventsByMonth: { month: string; count: number }[]
    topTags: { name: string; color: string; count: number }[]
    stats: { totalTasks: number; totalDone: number; totalContent: number; totalEvents: number; totalContacts: number }
}

export function AnalyticsClient({ contentByMonth, tasksByMonth, eventsByMonth, topTags, stats }: Props) {
    const summaryCards = [
        { label: "Total Tasks", value: stats.totalTasks, icon: CheckSquare, color: "from-blue-600 to-blue-400" },
        { label: "Tasks Done", value: stats.totalDone, icon: TrendingUp, color: "from-green-600 to-green-400" },
        { label: "Total Content", value: stats.totalContent, icon: Megaphone, color: "from-purple-600 to-purple-400" },
        { label: "Total Events", value: stats.totalEvents, icon: CalendarDays, color: "from-emerald-600 to-emerald-400" },
        { label: "Total Contacts", value: stats.totalContacts, icon: Users, color: "from-orange-600 to-orange-400" },
    ]

    const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4", "#6366f1"]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Analytics</h1>
                <p className="text-sm text-muted-foreground">Ringkasan aktivitas tim Humas</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {summaryCards.map((card) => {
                    const Icon = card.icon
                    return (
                        <Card key={card.label}>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}>
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{card.value}</p>
                                        <p className="text-[10px] text-muted-foreground">{card.label}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tasks Done vs Open */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Tasks: Done vs Open (6 bulan)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={tasksByMonth}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                                <Bar dataKey="done" fill="#10b981" radius={[4, 4, 0, 0]} name="Done" />
                                <Bar dataKey="open" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Open" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Content Posted per Month */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Content Posted per Bulan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={contentByMonth}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} name="Posted" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Events per Month */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Events per Bulan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={eventsByMonth}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                                <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Events" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Tags */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Top Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {topTags.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">Belum ada data tag</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={topTags} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, count }) => `${name} (${count})`} labelLine={false}>
                                        {topTags.map((entry, index) => (
                                            <Cell key={entry.name} fill={entry.color || COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

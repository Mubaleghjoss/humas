"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { EmptyState } from "@/components/empty-state"
import { Plus, Search, Megaphone, Trash2, Edit, Hash, Copy, X } from "lucide-react"
import { createContent, updateContent, deleteContent, createHashtag, deleteHashtag } from "@/lib/actions/content"
import { formatDate, contentStatusConfig, platformConfig } from "@/lib/utils"
import { toast } from "sonner"

interface Props { initialItems: any[]; tags: any[]; hashtags: any[] }

export function ContentClient({ initialItems, tags, hashtags }: Props) {
    const { data: session } = useSession()
    const isViewer = session?.user?.role === "VIEWER"
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [platformFilter, setPlatformFilter] = useState("ALL")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<any>(null)
    const [hashtagDialog, setHashtagDialog] = useState(false)
    const [loading, setLoading] = useState(false)

    const items = initialItems.filter((item) => {
        if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false
        if (statusFilter !== "ALL" && item.status !== statusFilter) return false
        if (platformFilter !== "ALL" && item.platform !== platformFilter) return false
        return true
    })

    // Calendar view: Group by week/date
    const calendarItems = items.filter(i => i.plannedDate).sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime())

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault(); setLoading(true)
        try {
            const fd = new FormData(e.currentTarget)
            if (editingItem) { await updateContent(editingItem.id, fd); toast.success("Konten diubah") }
            else { await createContent(fd); toast.success("Konten dibuat") }
            setDialogOpen(false); setEditingItem(null)
        } catch (err: any) { toast.error(err.message || "Gagal") }
        setLoading(false)
    }

    async function handleDelete(id: string) {
        if (!confirm("Hapus konten ini?")) return
        try { await deleteContent(id); toast.success("Konten dihapus") } catch { toast.error("Gagal") }
    }

    async function handleAddHashtag(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        try { await createHashtag(fd); toast.success("Hashtag ditambah"); (e.target as HTMLFormElement).reset() } catch { toast.error("Gagal") }
    }

    function copyHashtags(item: any) {
        navigator.clipboard.writeText(item.hashtags || "")
        toast.success("Hashtag disalin!")
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Content</h1>
                    <p className="text-sm text-muted-foreground">{items.length} konten media</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setHashtagDialog(true)} size="sm"><Hash className="h-3 w-3 mr-1" /> Hashtag Bank</Button>
                    {!isViewer && (
                        <Button onClick={() => { setEditingItem(null); setDialogOpen(true) }} className="bg-gradient-to-r from-violet-600 to-indigo-600">
                            <Plus className="h-4 w-4 mr-1" /> Tambah Konten
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Cari konten..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Semua Status</SelectItem>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="REVIEW">Review</SelectItem>
                        <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                        <SelectItem value="POSTED">Posted</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Semua Platform</SelectItem>
                        <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                        <SelectItem value="TIKTOK">TikTok</SelectItem>
                        <SelectItem value="WEBSITE">Website</SelectItem>
                        <SelectItem value="YOUTUBE">YouTube</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Tabs defaultValue="list">
                <TabsList>
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                </TabsList>

                <TabsContent value="list">
                    {items.length === 0 ? (
                        <EmptyState icon={Megaphone} title="Belum ada konten" description="Mulai rencanakan konten media" action={!isViewer ? <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Buat</Button> : undefined} />
                    ) : (
                        <div className="space-y-2">
                            {items.map((item) => (
                                <Card key={item.id} className="hover:shadow-md transition-all duration-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-medium text-sm">{item.title}</h3>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge className={platformConfig[item.platform as keyof typeof platformConfig].color + " border-0 text-[11px]"} variant="outline">
                                                        {platformConfig[item.platform as keyof typeof platformConfig].label}
                                                    </Badge>
                                                    <Badge className={contentStatusConfig[item.status as keyof typeof contentStatusConfig].color + " border-0 text-[11px]"} variant="outline">
                                                        {contentStatusConfig[item.status as keyof typeof contentStatusConfig].label}
                                                    </Badge>
                                                    {item.plannedDate && <span className="text-xs text-muted-foreground">📅 {formatDate(item.plannedDate)}</span>}
                                                    {item.tags.map((tag: any) => (
                                                        <span key={tag.id} style={{ backgroundColor: tag.color + "20", color: tag.color }} className="text-[10px] px-1.5 py-0.5 rounded-full font-medium">{tag.name}</span>
                                                    ))}
                                                </div>
                                                {item.caption && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{item.caption}</p>}
                                            </div>
                                            <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                                {item.hashtags && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyHashtags(item)}><Copy className="h-3 w-3" /></Button>}
                                                {!isViewer && (
                                                    <>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingItem(item); setDialogOpen(true) }}><Edit className="h-3 w-3" /></Button>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-3 w-3" /></Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="calendar">
                    {calendarItems.length === 0 ? (
                        <EmptyState icon={Megaphone} title="Tidak ada konten terjadwal" description="Tambah konten dengan tanggal planned" />
                    ) : (
                        <div className="grid grid-cols-7 gap-1">
                            {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(d => (
                                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
                            ))}
                            {(() => {
                                const now = new Date()
                                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
                                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                                const startPad = (firstDay.getDay() + 6) % 7
                                const cells = []
                                for (let i = 0; i < startPad; i++) cells.push(<div key={`pad-${i}`} className="min-h-[80px]" />)
                                for (let d = 1; d <= lastDay.getDate(); d++) {
                                    const dayItems = calendarItems.filter(item => {
                                        const pd = new Date(item.plannedDate)
                                        return pd.getDate() === d && pd.getMonth() === now.getMonth() && pd.getFullYear() === now.getFullYear()
                                    })
                                    const isToday = d === now.getDate()
                                    cells.push(
                                        <div key={d} className={`min-h-[80px] border rounded-lg p-1.5 ${isToday ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30" : "border-border"}`}>
                                            <span className={`text-xs font-medium ${isToday ? "text-violet-600 dark:text-violet-400" : ""}`}>{d}</span>
                                            {dayItems.map(item => (
                                                <div key={item.id} className={`mt-1 text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer ${contentStatusConfig[item.status as keyof typeof contentStatusConfig].color}`} onClick={() => { setEditingItem(item); setDialogOpen(true) }}>
                                                    {item.title}
                                                </div>
                                            ))}
                                        </div>
                                    )
                                }
                                return cells
                            })()}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Hashtag Bank Dialog */}
            <Dialog open={hashtagDialog} onOpenChange={setHashtagDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Hashtag Bank</DialogTitle><DialogDescription>Kelola hashtag yang sering dipakai</DialogDescription></DialogHeader>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {hashtags.map((h: any) => (
                            <div key={h.id} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-xs">
                                <span>{h.name}</span>
                                <span className="text-muted-foreground">({h.category})</span>
                                {!isViewer && <button onClick={() => deleteHashtag(h.id)} className="ml-1 text-red-500 hover:text-red-700"><X className="h-3 w-3" /></button>}
                            </div>
                        ))}
                    </div>
                    {!isViewer && (
                        <form onSubmit={handleAddHashtag} className="flex gap-2">
                            <Input name="name" placeholder="#hashtag" required className="text-sm" />
                            <Input name="category" placeholder="Kategori" defaultValue="General" className="text-sm w-28" />
                            <Button size="sm" type="submit">+</Button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingItem(null) }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit Konten" : "Tambah Konten"}</DialogTitle>
                        <DialogDescription>{editingItem ? "Ubah detail konten" : "Rencana kan konten baru"}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2"><Label>Judul *</Label><Input name="title" defaultValue={editingItem?.title || ""} required /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Platform</Label>
                                <Select name="platform" defaultValue={editingItem?.platform || "INSTAGRAM"}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                                        <SelectItem value="TIKTOK">TikTok</SelectItem>
                                        <SelectItem value="WEBSITE">Website</SelectItem>
                                        <SelectItem value="YOUTUBE">YouTube</SelectItem>
                                        <SelectItem value="TWITTER">Twitter</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select name="status" defaultValue={editingItem?.status || "DRAFT"}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DRAFT">Draft</SelectItem>
                                        <SelectItem value="REVIEW">Review</SelectItem>
                                        <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                        <SelectItem value="POSTED">Posted</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Tanggal Planned</Label><Input name="plannedDate" type="date" defaultValue={editingItem?.plannedDate ? new Date(editingItem.plannedDate).toISOString().split("T")[0] : ""} /></div>
                            <div className="space-y-2"><Label>Tanggal Posted</Label><Input name="postedDate" type="date" defaultValue={editingItem?.postedDate ? new Date(editingItem.postedDate).toISOString().split("T")[0] : ""} /></div>
                        </div>
                        <div className="space-y-2"><Label>Caption</Label><Textarea name="caption" defaultValue={editingItem?.caption || ""} rows={4} /></div>
                        <div className="space-y-2">
                            <Label>Hashtags</Label>
                            <Input name="hashtags" defaultValue={editingItem?.hashtags || ""} placeholder="#hashtag1 #hashtag2" />
                            <div className="flex flex-wrap gap-1 mt-1">
                                {hashtags.slice(0, 10).map((h: any) => (
                                    <button key={h.id} type="button" className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted hover:bg-accent" onClick={(e) => {
                                        const input = (e.target as HTMLElement).closest("div")?.querySelector("input[name='hashtags']") as HTMLInputElement
                                        if (input) input.value = (input.value + " " + h.name).trim()
                                    }}>{h.name}</button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2"><Label>Link Asset</Label><Input name="assetLinks" defaultValue={editingItem?.assetLinks || ""} placeholder="Link ke design, video, dll" /></div>
                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag: any) => (
                                    <label key={tag.id} className="flex items-center gap-1.5 text-xs cursor-pointer">
                                        <input type="checkbox" name="tags" value={tag.id} defaultChecked={editingItem?.tags?.some((t: any) => t.id === tag.id)} className="rounded" />
                                        <span style={{ color: tag.color }}>{tag.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

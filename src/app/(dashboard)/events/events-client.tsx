"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { EmptyState } from "@/components/empty-state"
import { Plus, Search, CalendarDays, MapPin, Trash2, Edit, CheckSquare, ExternalLink, User } from "lucide-react"
import { createEvent, updateEvent, deleteEvent, toggleEventChecklistItem, addEventChecklistItem, addEventLink } from "@/lib/actions/events"
import { formatDate, eventStatusConfig } from "@/lib/utils"
import { toast } from "sonner"

interface Props { initialEvents: any[]; tags: any[]; users: any[] }

export function EventsClient({ initialEvents, tags, users }: Props) {
    const { data: session } = useSession()
    const isViewer = session?.user?.role === "VIEWER"
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingEvent, setEditingEvent] = useState<any>(null)
    const [detailEvent, setDetailEvent] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [newChecklist, setNewChecklist] = useState("")
    const [newLinkTitle, setNewLinkTitle] = useState("")
    const [newLinkUrl, setNewLinkUrl] = useState("")

    const events = initialEvents.filter((ev) => {
        if (search && !ev.title.toLowerCase().includes(search.toLowerCase())) return false
        if (statusFilter !== "ALL" && ev.status !== statusFilter) return false
        return true
    })

    // Group by month
    const grouped = events.reduce((acc: any, ev: any) => {
        const key = new Date(ev.startDate).toLocaleDateString("id-ID", { month: "long", year: "numeric" })
        if (!acc[key]) acc[key] = []
        acc[key].push(ev)
        return acc
    }, {})

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault(); setLoading(true)
        try {
            const fd = new FormData(e.currentTarget)
            if (editingEvent) { await updateEvent(editingEvent.id, fd); toast.success("Event diubah") }
            else { await createEvent(fd); toast.success("Event dibuat") }
            setDialogOpen(false); setEditingEvent(null)
        } catch (err: any) { toast.error(err.message || "Gagal") }
        setLoading(false)
    }

    async function handleDelete(id: string) {
        if (!confirm("Hapus event ini?")) return
        try { await deleteEvent(id); toast.success("Event dihapus"); setDetailEvent(null) } catch { toast.error("Gagal") }
    }

    async function handleAddChecklist() {
        if (!newChecklist.trim() || !detailEvent) return
        try { await addEventChecklistItem(detailEvent.id, newChecklist); setNewChecklist(""); toast.success("Checklist ditambah") } catch { toast.error("Gagal") }
    }

    async function handleAddLink() {
        if (!newLinkTitle.trim() || !newLinkUrl.trim() || !detailEvent) return
        try { await addEventLink(detailEvent.id, newLinkTitle, newLinkUrl); setNewLinkTitle(""); setNewLinkUrl(""); toast.success("Link ditambah") } catch { toast.error("Gagal") }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Events</h1>
                    <p className="text-sm text-muted-foreground">{events.length} event</p>
                </div>
                {!isViewer && (
                    <Button onClick={() => { setEditingEvent(null); setDialogOpen(true) }} className="bg-gradient-to-r from-violet-600 to-indigo-600">
                        <Plus className="h-4 w-4 mr-1" /> Tambah Event
                    </Button>
                )}
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Cari event..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Semua Status</SelectItem>
                        <SelectItem value="PLANNING">Planning</SelectItem>
                        <SelectItem value="READY">Ready</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {events.length === 0 ? (
                <EmptyState icon={CalendarDays} title="Belum ada event" description="Buat event pertama" action={!isViewer ? <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Buat Event</Button> : undefined} />
            ) : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([month, evts]) => (
                        <div key={month}>
                            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{month}</h2>
                            <div className="space-y-3">
                                {(evts as any[]).map((event) => (
                                    <Card key={event.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => setDetailEvent(event)}>
                                        <CardContent className="p-5">
                                            <div className="flex items-start justify-between">
                                                <div className="flex gap-4">
                                                    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900 dark:to-emerald-950 text-center">
                                                        <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{new Date(event.startDate).getDate()}</span>
                                                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">{new Date(event.startDate).toLocaleDateString("id-ID", { month: "short" })}</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold">{event.title}</h3>
                                                        {event.location && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{event.location}</p>}
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            <Badge className={eventStatusConfig[event.status as keyof typeof eventStatusConfig].color + " border-0 text-[11px]"} variant="outline">
                                                                {eventStatusConfig[event.status as keyof typeof eventStatusConfig].label}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" />{event.picUser.name}</span>
                                                            {event.checklist.length > 0 && (
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <CheckSquare className="h-3 w-3" />
                                                                    {event.checklist.filter((c: any) => c.completed).length}/{event.checklist.length}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                    {!isViewer && (
                                                        <>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingEvent(event); setDialogOpen(true) }}><Edit className="h-3 w-3" /></Button>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(event.id)}><Trash2 className="h-3 w-3" /></Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Dialog */}
            <Dialog open={!!detailEvent} onOpenChange={() => setDetailEvent(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{detailEvent?.title}</DialogTitle>
                        <DialogDescription>{formatDate(detailEvent?.startDate)} {detailEvent?.endDate ? `— ${formatDate(detailEvent.endDate)}` : ""}</DialogDescription>
                    </DialogHeader>
                    {detailEvent && (
                        <div className="space-y-4">
                            {detailEvent.description && <p className="text-sm text-muted-foreground">{detailEvent.description}</p>}
                            {/* Checklist */}
                            <div>
                                <h4 className="text-sm font-semibold mb-2">Checklist Persiapan</h4>
                                <div className="space-y-2">
                                    {detailEvent.checklist?.map((item: any) => (
                                        <label key={item.id} className="flex items-center gap-2 text-sm cursor-pointer">
                                            <Checkbox checked={item.completed} onCheckedChange={() => !isViewer && toggleEventChecklistItem(item.id)} disabled={isViewer} />
                                            <span className={item.completed ? "line-through text-muted-foreground" : ""}>{item.text}</span>
                                        </label>
                                    ))}
                                </div>
                                {!isViewer && (
                                    <div className="flex gap-2 mt-2">
                                        <Input placeholder="Tambah item..." value={newChecklist} onChange={(e) => setNewChecklist(e.target.value)} className="text-sm" />
                                        <Button size="sm" onClick={handleAddChecklist}>+</Button>
                                    </div>
                                )}
                            </div>
                            {/* Links */}
                            <div>
                                <h4 className="text-sm font-semibold mb-2">Link Terkait</h4>
                                <div className="space-y-1.5">
                                    {detailEvent.links?.map((link: any) => (
                                        <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                            <ExternalLink className="h-3 w-3" />{link.title}
                                        </a>
                                    ))}
                                </div>
                                {!isViewer && (
                                    <div className="flex gap-2 mt-2">
                                        <Input placeholder="Judul" value={newLinkTitle} onChange={(e) => setNewLinkTitle(e.target.value)} className="text-sm" />
                                        <Input placeholder="URL" value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} className="text-sm" />
                                        <Button size="sm" onClick={handleAddLink}>+</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingEvent(null) }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingEvent ? "Edit Event" : "Tambah Event"}</DialogTitle>
                        <DialogDescription>{editingEvent ? "Ubah detail event" : "Buat event baru"}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2"><Label>Judul *</Label><Input name="title" defaultValue={editingEvent?.title || ""} required /></div>
                        <div className="space-y-2"><Label>Deskripsi</Label><Textarea name="description" defaultValue={editingEvent?.description || ""} rows={3} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Tanggal Mulai *</Label><Input name="startDate" type="date" defaultValue={editingEvent?.startDate ? new Date(editingEvent.startDate).toISOString().split("T")[0] : ""} required /></div>
                            <div className="space-y-2"><Label>Tanggal Selesai</Label><Input name="endDate" type="date" defaultValue={editingEvent?.endDate ? new Date(editingEvent.endDate).toISOString().split("T")[0] : ""} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Lokasi</Label><Input name="location" defaultValue={editingEvent?.location || ""} /></div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select name="status" defaultValue={editingEvent?.status || "PLANNING"}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PLANNING">Planning</SelectItem>
                                        <SelectItem value="READY">Ready</SelectItem>
                                        <SelectItem value="DONE">Done</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>PIC</Label>
                            <select name="picUserId" defaultValue={editingEvent?.picUserId || session?.user?.id || ""} className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm">
                                {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag: any) => (
                                    <label key={tag.id} className="flex items-center gap-1.5 text-xs cursor-pointer">
                                        <input type="checkbox" name="tags" value={tag.id} defaultChecked={editingEvent?.tags?.some((t: any) => t.id === tag.id)} className="rounded" />
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

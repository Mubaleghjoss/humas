"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { EmptyState } from "@/components/empty-state"
import { Plus, Search, LinkIcon, Pin, PinOff, Trash2, Edit, ExternalLink } from "lucide-react"
import { createLink, updateLink, deleteLink, toggleLinkPin } from "@/lib/actions/links"
import { toast } from "sonner"

interface Props { initialLinks: any[]; tags: any[] }

export function LinksClient({ initialLinks, tags }: Props) {
    const { data: session } = useSession()
    const isViewer = session?.user?.role === "VIEWER"
    const [search, setSearch] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingLink, setEditingLink] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const links = initialLinks.filter((l) => {
        if (search && !l.title.toLowerCase().includes(search.toLowerCase()) && !l.url.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault(); setLoading(true)
        try {
            const fd = new FormData(e.currentTarget)
            if (editingLink) { await updateLink(editingLink.id, fd); toast.success("Link diubah") }
            else { await createLink(fd); toast.success("Link dibuat") }
            setDialogOpen(false); setEditingLink(null)
        } catch (err: any) { toast.error(err.message || "Gagal menyimpan") }
        setLoading(false)
    }

    async function handleDelete(id: string) {
        if (!confirm("Hapus link ini?")) return
        try { await deleteLink(id); toast.success("Link dihapus") } catch { toast.error("Gagal") }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Links</h1>
                    <p className="text-sm text-muted-foreground">{links.length} link tersimpan</p>
                </div>
                {!isViewer && (
                    <Button onClick={() => { setEditingLink(null); setDialogOpen(true) }} className="bg-gradient-to-r from-violet-600 to-indigo-600">
                        <Plus className="h-4 w-4 mr-1" /> Tambah Link
                    </Button>
                )}
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Cari link..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>

            {links.length === 0 ? (
                <EmptyState icon={LinkIcon} title="Belum ada link" description="Simpan link penting agar mudah diakses" action={!isViewer ? <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Tambah</Button> : undefined} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {links.map((link) => (
                        <Card key={link.id} className="hover:shadow-lg transition-all duration-200 group">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-bold shrink-0">
                                            {link.category.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1">
                                                {link.pinned && <Pin className="h-3 w-3 text-violet-500 shrink-0" />}
                                                <h3 className="font-medium text-sm truncate">{link.title}</h3>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground truncate">{link.url}</p>
                                        </div>
                                    </div>
                                </div>
                                {link.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{link.description}</p>}
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-1 flex-wrap">
                                        {link.tags.map((tag: any) => (
                                            <span key={tag.id} style={{ backgroundColor: tag.color + "20", color: tag.color }} className="text-[10px] px-1.5 py-0.5 rounded-full font-medium">{tag.name}</span>
                                        ))}
                                    </div>
                                    <div className="flex gap-1">
                                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                                            <Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink className="h-3.5 w-3.5" /></Button>
                                        </a>
                                        {!isViewer && (
                                            <>
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleLinkPin(link.id)}>
                                                    {link.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingLink(link); setDialogOpen(true) }}>
                                                    <Edit className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(link.id)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingLink(null) }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingLink ? "Edit Link" : "Tambah Link"}</DialogTitle>
                        <DialogDescription>{editingLink ? "Ubah detail link" : "Simpan link baru"}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2"><Label>Judul *</Label><Input name="title" defaultValue={editingLink?.title || ""} required /></div>
                        <div className="space-y-2"><Label>URL *</Label><Input name="url" type="url" defaultValue={editingLink?.url || ""} required placeholder="https://..." /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Kategori</Label><Input name="category" defaultValue={editingLink?.category || "General"} placeholder="General, Drive, Sosmed..." /></div>
                            <div className="space-y-2">
                                <Label>Pin</Label>
                                <label className="flex items-center gap-2 h-9">
                                    <input type="checkbox" name="pinned" value="true" defaultChecked={editingLink?.pinned} className="rounded" />
                                    <span className="text-sm">Pin link ini</span>
                                </label>
                            </div>
                        </div>
                        <div className="space-y-2"><Label>Deskripsi</Label><Textarea name="description" defaultValue={editingLink?.description || ""} rows={2} /></div>
                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag: any) => (
                                    <label key={tag.id} className="flex items-center gap-1.5 text-xs cursor-pointer">
                                        <input type="checkbox" name="tags" value={tag.id} defaultChecked={editingLink?.tags?.some((t: any) => t.id === tag.id)} className="rounded" />
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

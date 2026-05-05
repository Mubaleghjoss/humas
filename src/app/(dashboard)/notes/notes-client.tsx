"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { EmptyState } from "@/components/empty-state"
import { Plus, Search, StickyNote, Pin, PinOff, Trash2, Edit, Eye } from "lucide-react"
import { createNote, updateNote, deleteNote, toggleNotePin } from "@/lib/actions/notes"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"
import { marked } from "marked"

type TagOption = {
    id: string
    name: string
    color: string
}

type NoteItem = {
    id: string
    title: string
    content: string
    pinned: boolean
    updatedAt: Date | string
    tags: TagOption[]
}

interface Props {
    initialNotes: NoteItem[]
    tags: TagOption[]
}

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback
}

function sanitizeHtmlString(html: string) {
    return html
        .replace(/<\s*(script|style|iframe|object|embed|form|input|button|textarea|select|option|meta|link)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
        .replace(/<\s*(script|style|iframe|object|embed|form|input|button|textarea|select|option|meta|link)\b[^>]*\/?>/gi, "")
        .replace(/\son\w+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
        .replace(/\s(style|srcdoc)=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
        .replace(/\s(href|src)=("|\')\s*(javascript:|data:text\/html)[^"\']*\2/gi, "")
        .replace(/\s(href|src)=\s*(javascript:|data:text\/html)[^\s>]*/gi, "")
}

function renderSafeMarkdown(markdown: string) {
    const html = sanitizeHtmlString(marked.parse(markdown, { async: false }) as string)
    if (typeof document === "undefined") return html

    const template = document.createElement("template")
    template.innerHTML = html

    template.content
        .querySelectorAll("script,style,iframe,object,embed,form,input,button,textarea,select,option,meta,link")
        .forEach((element) => element.remove())

    template.content.querySelectorAll("*").forEach((element) => {
        Array.from(element.attributes).forEach((attribute) => {
            const name = attribute.name.toLowerCase()
            const value = attribute.value.trim().replace(/\s+/g, "").toLowerCase()

            if (name.startsWith("on") || name === "style" || name === "srcdoc") {
                element.removeAttribute(attribute.name)
                return
            }

            if ((name === "href" || name === "src") && value.includes(":") && !/^(https?:|mailto:|tel:)/.test(value)) {
                element.removeAttribute(attribute.name)
            }
        })

        if (element.tagName === "A") {
            element.setAttribute("rel", "noopener noreferrer")
        }
    })

    return template.innerHTML
}

export function NotesClient({ initialNotes, tags }: Props) {
    const { data: session } = useSession()
    const isViewer = session?.user?.role === "VIEWER"
    const [search, setSearch] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingNote, setEditingNote] = useState<NoteItem | null>(null)
    const [previewNote, setPreviewNote] = useState<NoteItem | null>(null)
    const [loading, setLoading] = useState(false)
    const [editorContent, setEditorContent] = useState("")

    const notes = initialNotes.filter((n) => {
        if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.content.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        try {
            const fd = new FormData(e.currentTarget)
            if (editingNote) {
                await updateNote(editingNote.id, fd)
                toast.success("Note berhasil diubah")
            } else {
                await createNote(fd)
                toast.success("Note berhasil dibuat")
            }
            setDialogOpen(false)
            setEditingNote(null)
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Gagal menyimpan"))
        }
        setLoading(false)
    }

    async function handleDelete(id: string) {
        if (!confirm("Hapus note ini?")) return
        try { await deleteNote(id); toast.success("Note dihapus") } catch { toast.error("Gagal menghapus") }
    }

    async function handleTogglePin(id: string) {
        try { await toggleNotePin(id); toast.success("Pin diubah") } catch { toast.error("Gagal") }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Notes</h1>
                    <p className="text-sm text-muted-foreground">{notes.length} catatan</p>
                </div>
                {!isViewer && (
                    <Button onClick={() => { setEditingNote(null); setEditorContent(""); setDialogOpen(true) }} className="bg-gradient-to-r from-violet-600 to-indigo-600">
                        <Plus className="h-4 w-4 mr-1" /> Tambah Note
                    </Button>
                )}
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Cari catatan..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>

            {notes.length === 0 ? (
                <EmptyState icon={StickyNote} title="Belum ada catatan" description="Buat catatan pertama untuk menyimpan ide dan informasi penting" action={!isViewer ? <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Buat Note</Button> : undefined} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notes.map((note) => (
                        <Card key={note.id} className="hover:shadow-lg transition-all duration-200 group cursor-pointer" onClick={() => setPreviewNote(note)}>
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {note.pinned && <Pin className="h-3.5 w-3.5 text-violet-500" />}
                                        <h3 className="font-semibold text-sm truncate">{note.title}</h3>
                                    </div>
                                    {!isViewer && (
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleTogglePin(note.id)}>
                                                {note.pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingNote(note); setEditorContent(note.content); setDialogOpen(true) }}>
                                                <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(note.id)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-4 mb-3">{note.content.replace(/[#*_\[\]`>]/g, '').slice(0, 200)}</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-1">
                                        {note.tags.map((tag) => (
                                            <span key={tag.id} style={{ backgroundColor: tag.color + "20", color: tag.color }} className="text-[10px] px-1.5 py-0.5 rounded-full font-medium">{tag.name}</span>
                                        ))}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">{formatDate(note.updatedAt)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Preview Dialog */}
            <Dialog open={!!previewNote} onOpenChange={() => setPreviewNote(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {previewNote?.pinned && <Pin className="h-4 w-4 text-violet-500" />}
                            {previewNote?.title}
                        </DialogTitle>
                        <DialogDescription>
                            Terakhir diubah: {formatDate(previewNote?.updatedAt)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="prose-preview text-sm max-h-[60vh] overflow-y-auto" dangerouslySetInnerHTML={{ __html: previewNote ? renderSafeMarkdown(previewNote.content) : "" }} />
                </DialogContent>
            </Dialog>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingNote(null) }}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingNote ? "Edit Note" : "Tambah Note"}</DialogTitle>
                        <DialogDescription>{editingNote ? "Ubah catatan" : "Buat catatan baru"}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Judul *</Label>
                            <Input name="title" defaultValue={editingNote?.title || ""} required placeholder="Judul catatan" />
                        </div>
                        <Tabs defaultValue="write">
                            <TabsList>
                                <TabsTrigger value="write"><Edit className="h-3 w-3 mr-1" /> Write</TabsTrigger>
                                <TabsTrigger value="preview"><Eye className="h-3 w-3 mr-1" /> Preview</TabsTrigger>
                            </TabsList>
                            <TabsContent value="write">
                                <Textarea name="content" value={editorContent} onChange={(e) => setEditorContent(e.target.value)} rows={12} placeholder="Tulis catatan dengan format Markdown..." className="font-mono text-sm" required />
                            </TabsContent>
                            <TabsContent value="preview">
                                <div className="prose-preview text-sm border rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto" dangerouslySetInnerHTML={{ __html: renderSafeMarkdown(editorContent) }} />
                                <input type="hidden" name="content" value={editorContent} />
                            </TabsContent>
                        </Tabs>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" name="pinned" value="true" defaultChecked={editingNote?.pinned} className="rounded" />
                                Pin catatan
                            </label>
                        </div>
                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <label key={tag.id} className="flex items-center gap-1.5 text-xs cursor-pointer">
                                        <input type="checkbox" name="tags" value={tag.id} defaultChecked={editingNote?.tags?.some((t) => t.id === tag.id)} className="rounded" />
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

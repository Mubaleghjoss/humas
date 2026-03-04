"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { EmptyState } from "@/components/empty-state"
import { Plus, Search, FileText, Trash2, Edit, Copy, Wand2 } from "lucide-react"
import { createTemplate, updateTemplate, deleteTemplate } from "@/lib/actions/templates"
import { toast } from "sonner"

const categoryLabels: Record<string, string> = {
    CAPTION: "Caption IG",
    PRESS_RELEASE: "Press Release",
    INVITATION: "Undangan",
    LETTER: "Surat",
    OTHER: "Lainnya",
}

interface Props { initialTemplates: any[] }

export function TemplatesClient({ initialTemplates }: Props) {
    const { data: session } = useSession()
    const isViewer = session?.user?.role === "VIEWER"
    const [search, setSearch] = useState("")
    const [catFilter, setCatFilter] = useState("ALL")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<any>(null)
    const [fillDialog, setFillDialog] = useState<any>(null)
    const [fillValues, setFillValues] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)

    const templates = initialTemplates.filter((t) => {
        if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
        if (catFilter !== "ALL" && t.category !== catFilter) return false
        return true
    })

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault(); setLoading(true)
        try {
            const fd = new FormData(e.currentTarget)
            if (editingTemplate) { await updateTemplate(editingTemplate.id, fd); toast.success("Template diubah") }
            else { await createTemplate(fd); toast.success("Template dibuat") }
            setDialogOpen(false); setEditingTemplate(null)
        } catch (err: any) { toast.error(err.message || "Gagal") }
        setLoading(false)
    }

    async function handleDelete(id: string) {
        if (!confirm("Hapus template ini?")) return
        try { await deleteTemplate(id); toast.success("Template dihapus") } catch { toast.error("Gagal") }
    }

    function openFillAndCopy(tmpl: any) {
        const vars = tmpl.variables ? tmpl.variables.split(",") : []
        const initial: Record<string, string> = {}
        vars.forEach((v: string) => { initial[v] = "" })
        setFillValues(initial)
        setFillDialog(tmpl)
    }

    function getFinalText() {
        if (!fillDialog) return ""
        let text = fillDialog.content
        Object.entries(fillValues).forEach(([key, value]) => {
            text = text.replace(new RegExp(`\\{${key}\\}`, "g"), value || `{${key}}`)
        })
        return text
    }

    function copyFinal() {
        navigator.clipboard.writeText(getFinalText())
        toast.success("Teks disalin ke clipboard!")
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Templates</h1>
                    <p className="text-sm text-muted-foreground">{templates.length} template teks</p>
                </div>
                {!isViewer && (
                    <Button onClick={() => { setEditingTemplate(null); setDialogOpen(true) }} className="bg-gradient-to-r from-violet-600 to-indigo-600">
                        <Plus className="h-4 w-4 mr-1" /> Tambah Template
                    </Button>
                )}
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Cari template..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={catFilter} onValueChange={setCatFilter}>
                    <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Semua Kategori</SelectItem>
                        <SelectItem value="CAPTION">Caption IG</SelectItem>
                        <SelectItem value="PRESS_RELEASE">Press Release</SelectItem>
                        <SelectItem value="INVITATION">Undangan</SelectItem>
                        <SelectItem value="LETTER">Surat</SelectItem>
                        <SelectItem value="OTHER">Lainnya</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {templates.length === 0 ? (
                <EmptyState icon={FileText} title="Belum ada template" description="Buat template teks untuk efisiensi kerja" action={!isViewer ? <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Buat</Button> : undefined} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((tmpl) => (
                        <Card key={tmpl.id} className="hover:shadow-lg transition-all duration-200">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-sm">{tmpl.title}</CardTitle>
                                    <Badge variant="secondary" className="text-[10px]">{categoryLabels[tmpl.category] || tmpl.category}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground line-clamp-4 font-mono mb-3 whitespace-pre-line">{tmpl.content.slice(0, 200)}</p>
                                {tmpl.variables && (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {tmpl.variables.split(",").map((v: string) => (
                                            <span key={v} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 font-mono">{`{${v}}`}</span>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-1.5">
                                    <Button size="sm" variant="outline" className="text-xs" onClick={() => openFillAndCopy(tmpl)}>
                                        <Wand2 className="h-3 w-3 mr-1" /> Fill & Copy
                                    </Button>
                                    {!isViewer && (
                                        <>
                                            <Button size="sm" variant="ghost" className="text-xs" onClick={() => { setEditingTemplate(tmpl); setDialogOpen(true) }}><Edit className="h-3 w-3" /></Button>
                                            <Button size="sm" variant="ghost" className="text-xs text-red-500" onClick={() => handleDelete(tmpl.id)}><Trash2 className="h-3 w-3" /></Button>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Fill & Copy Dialog */}
            <Dialog open={!!fillDialog} onOpenChange={() => setFillDialog(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Fill & Copy: {fillDialog?.title}</DialogTitle>
                        <DialogDescription>Isi variabel lalu salin teks final</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Variabel</p>
                            {Object.keys(fillValues).map((key) => (
                                <div key={key} className="space-y-1">
                                    <Label className="text-xs font-mono">{`{${key}}`}</Label>
                                    <Input value={fillValues[key]} onChange={(e) => setFillValues({ ...fillValues, [key]: e.target.value })} placeholder={key.toLowerCase().replace(/_/g, " ")} className="text-sm" />
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Hasil</p>
                            <div className="bg-muted rounded-lg p-3 text-sm whitespace-pre-line min-h-[200px] max-h-[400px] overflow-y-auto font-mono">{getFinalText()}</div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={copyFinal} className="bg-gradient-to-r from-violet-600 to-indigo-600">
                            <Copy className="h-4 w-4 mr-1" /> Salin ke Clipboard
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingTemplate(null) }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingTemplate ? "Edit Template" : "Tambah Template"}</DialogTitle>
                        <DialogDescription>{editingTemplate ? "Ubah template" : "Buat template baru. Gunakan {'{VARIABEL}'} untuk placeholder."}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2"><Label>Judul *</Label><Input name="title" defaultValue={editingTemplate?.title || ""} required /></div>
                        <div className="space-y-2">
                            <Label>Kategori</Label>
                            <Select name="category" defaultValue={editingTemplate?.category || "OTHER"}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CAPTION">Caption IG</SelectItem>
                                    <SelectItem value="PRESS_RELEASE">Press Release</SelectItem>
                                    <SelectItem value="INVITATION">Undangan</SelectItem>
                                    <SelectItem value="LETTER">Surat</SelectItem>
                                    <SelectItem value="OTHER">Lainnya</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Konten Template *</Label>
                            <Textarea name="content" defaultValue={editingTemplate?.content || ""} rows={10} placeholder="Tulis template...\nGunakan {NAMA}, {TANGGAL}, dll untuk variabel" className="font-mono text-sm" required />
                            <p className="text-[10px] text-muted-foreground">Variabel akan auto-detected dari format {"{NAMA_VARIABEL}"}</p>
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

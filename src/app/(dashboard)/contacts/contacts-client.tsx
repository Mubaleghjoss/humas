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
import { Plus, Search, Users, Phone, Mail, MessageCircle, Trash2, Edit, Copy, Download } from "lucide-react"
import { createContact, updateContact, deleteContact } from "@/lib/actions/contacts"
import { toast } from "sonner"

interface Props { initialContacts: any[]; tags: any[] }

export function ContactsClient({ initialContacts, tags }: Props) {
    const { data: session } = useSession()
    const isViewer = session?.user?.role === "VIEWER"
    const [search, setSearch] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingContact, setEditingContact] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const contacts = initialContacts.filter((c) => {
        if (search) {
            const q = search.toLowerCase()
            return c.name.toLowerCase().includes(q) || (c.organization || "").toLowerCase().includes(q) || (c.phone || "").includes(q)
        }
        return true
    })

    function copyWA(wa: string) {
        navigator.clipboard.writeText(wa)
        toast.success("Nomor WA disalin!")
    }

    function exportCSV() {
        const headers = ["Nama", "Jabatan", "Organisasi", "Telepon", "WhatsApp", "Email"]
        const rows = initialContacts.map(c => [c.name, c.roleTitle || "", c.organization || "", c.phone || "", c.whatsapp || "", c.email || ""])
        const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n")
        const blob = new Blob([csv], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a"); a.href = url; a.download = "contacts.csv"; a.click()
        toast.success("CSV diunduh!")
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault(); setLoading(true)
        try {
            const fd = new FormData(e.currentTarget)
            if (editingContact) { await updateContact(editingContact.id, fd); toast.success("Kontak diubah") }
            else { await createContact(fd); toast.success("Kontak dibuat") }
            setDialogOpen(false); setEditingContact(null)
        } catch (err: any) { toast.error(err.message || "Gagal") }
        setLoading(false)
    }

    async function handleDelete(id: string) {
        if (!confirm("Hapus kontak ini?")) return
        try { await deleteContact(id); toast.success("Kontak dihapus") } catch { toast.error("Gagal") }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Contacts</h1>
                    <p className="text-sm text-muted-foreground">{contacts.length} kontak</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportCSV} size="sm"><Download className="h-3 w-3 mr-1" /> Export CSV</Button>
                    {!isViewer && (
                        <Button onClick={() => { setEditingContact(null); setDialogOpen(true) }} className="bg-gradient-to-r from-violet-600 to-indigo-600">
                            <Plus className="h-4 w-4 mr-1" /> Tambah Kontak
                        </Button>
                    )}
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Cari nama, organisasi, nomor..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>

            {contacts.length === 0 ? (
                <EmptyState icon={Users} title="Belum ada kontak" description="Simpan kontak penting untuk akses cepat" action={!isViewer ? <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Tambah</Button> : undefined} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {contacts.map((contact) => (
                        <Card key={contact.id} className="hover:shadow-lg transition-all duration-200">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold">{contact.name}</h3>
                                        {contact.roleTitle && <p className="text-xs text-muted-foreground">{contact.roleTitle}</p>}
                                        {contact.organization && <p className="text-xs text-violet-600 dark:text-violet-400 font-medium">{contact.organization}</p>}
                                    </div>
                                    {!isViewer && (
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingContact(contact); setDialogOpen(true) }}><Edit className="h-3 w-3" /></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(contact.id)}><Trash2 className="h-3 w-3" /></Button>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1.5 mb-3">
                                    {contact.phone && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                            <span>{contact.phone}</span>
                                        </div>
                                    )}
                                    {contact.email && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <Mail className="h-3 w-3 text-muted-foreground" />
                                            <span>{contact.email}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {contact.whatsapp && (
                                        <>
                                            <Button size="sm" variant="outline" className="h-7 text-[11px] text-green-600" onClick={() => copyWA(contact.whatsapp)}>
                                                <Copy className="h-3 w-3 mr-1" /> Copy WA
                                            </Button>
                                            <a href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                                                <Button size="sm" variant="outline" className="h-7 text-[11px] text-green-600">
                                                    <MessageCircle className="h-3 w-3 mr-1" /> Chat WA
                                                </Button>
                                            </a>
                                        </>
                                    )}
                                    {contact.email && (
                                        <a href={`mailto:${contact.email}`}>
                                            <Button size="sm" variant="outline" className="h-7 text-[11px]"><Mail className="h-3 w-3 mr-1" /> Email</Button>
                                        </a>
                                    )}
                                </div>
                                {contact.tags.length > 0 && (
                                    <div className="flex gap-1 mt-3">
                                        {contact.tags.map((tag: any) => (
                                            <span key={tag.id} style={{ backgroundColor: tag.color + "20", color: tag.color }} className="text-[10px] px-1.5 py-0.5 rounded-full font-medium">{tag.name}</span>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingContact(null) }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingContact ? "Edit Kontak" : "Tambah Kontak"}</DialogTitle>
                        <DialogDescription>{editingContact ? "Ubah detail kontak" : "Simpan kontak baru"}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Nama *</Label><Input name="name" defaultValue={editingContact?.name || ""} required /></div>
                            <div className="space-y-2"><Label>Jabatan</Label><Input name="roleTitle" defaultValue={editingContact?.roleTitle || ""} /></div>
                        </div>
                        <div className="space-y-2"><Label>Organisasi</Label><Input name="organization" defaultValue={editingContact?.organization || ""} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Telepon</Label><Input name="phone" defaultValue={editingContact?.phone || ""} /></div>
                            <div className="space-y-2"><Label>WhatsApp</Label><Input name="whatsapp" defaultValue={editingContact?.whatsapp || ""} /></div>
                        </div>
                        <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" defaultValue={editingContact?.email || ""} /></div>
                        <div className="space-y-2"><Label>Alamat</Label><Input name="address" defaultValue={editingContact?.address || ""} /></div>
                        <div className="space-y-2"><Label>Catatan</Label><Textarea name="notes" defaultValue={editingContact?.notes || ""} rows={2} /></div>
                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag: any) => (
                                    <label key={tag.id} className="flex items-center gap-1.5 text-xs cursor-pointer">
                                        <input type="checkbox" name="tags" value={tag.id} defaultChecked={editingContact?.tags?.some((t: any) => t.id === tag.id)} className="rounded" />
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

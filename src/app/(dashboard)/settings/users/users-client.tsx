"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Shield, Trash2, Edit, Key } from "lucide-react"
import { createUser, updateUser, deleteUser, resetPassword } from "@/lib/actions/users"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"

const roleColors: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    HUMAS: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    VIEWER: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
}

interface Props { initialUsers: any[] }

export function UsersClient({ initialUsers }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<any>(null)
    const [resetDialog, setResetDialog] = useState<any>(null)
    const [newPassword, setNewPassword] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault(); setLoading(true)
        try {
            const fd = new FormData(e.currentTarget)
            if (!editingUser) fd.set("active", "true")
            if (editingUser) {
                fd.set("active", editingUser.active ? "true" : "false")
                await updateUser(editingUser.id, fd); toast.success("User diubah")
            } else {
                await createUser(fd); toast.success("User dibuat")
            }
            setDialogOpen(false); setEditingUser(null)
        } catch (err: any) { toast.error(err.message || "Gagal") }
        setLoading(false)
    }

    async function handleDelete(id: string) {
        if (!confirm("Hapus user ini?")) return
        try { await deleteUser(id); toast.success("User dihapus") } catch (err: any) { toast.error(err.message) }
    }

    async function handleResetPassword() {
        if (!resetDialog || newPassword.length < 6) { toast.error("Password minimal 6 karakter"); return }
        try {
            await resetPassword(resetDialog.id, newPassword)
            toast.success("Password direset"); setResetDialog(null); setNewPassword("")
        } catch { toast.error("Gagal") }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Kelola User</h1>
                    <p className="text-sm text-muted-foreground">{initialUsers.length} user terdaftar</p>
                </div>
                <Button onClick={() => { setEditingUser(null); setDialogOpen(true) }} className="bg-gradient-to-r from-violet-600 to-indigo-600">
                    <Plus className="h-4 w-4 mr-1" /> Tambah User
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {initialUsers.map((user: any) => (
                    <Card key={user.id} className={`transition-all duration-200 ${!user.active ? "opacity-50" : ""}`}>
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold flex items-center gap-2">
                                        {user.name}
                                        {!user.active && <Badge variant="destructive" className="text-[10px]">Nonaktif</Badge>}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                                    {user.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
                                </div>
                                <Badge className={roleColors[user.role] + " border-0 text-[11px]"} variant="outline">
                                    <Shield className="h-3 w-3 mr-1" />{user.role}
                                </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground mb-3">Dibuat: {formatDate(user.createdAt)}</p>
                            <div className="flex gap-1.5">
                                <Button size="sm" variant="outline" className="text-xs" onClick={() => { setEditingUser(user); setDialogOpen(true) }}>
                                    <Edit className="h-3 w-3 mr-1" /> Edit
                                </Button>
                                <Button size="sm" variant="outline" className="text-xs" onClick={() => setResetDialog(user)}>
                                    <Key className="h-3 w-3 mr-1" /> Reset PW
                                </Button>
                                <Button size="sm" variant="outline" className="text-xs text-red-500" onClick={() => handleDelete(user.id)}>
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Create/Edit User Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingUser(null) }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingUser ? "Edit User" : "Tambah User"}</DialogTitle>
                        <DialogDescription>{editingUser ? "Ubah detail user" : "Buat user baru"}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Username *</Label><Input name="username" defaultValue={editingUser?.username || ""} required /></div>
                            <div className="space-y-2"><Label>Nama *</Label><Input name="name" defaultValue={editingUser?.name || ""} required /></div>
                        </div>
                        <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" defaultValue={editingUser?.email || ""} /></div>
                        {!editingUser && (
                            <div className="space-y-2"><Label>Password *</Label><Input name="password" type="password" required minLength={6} placeholder="Min 6 karakter" /></div>
                        )}
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select name="role" defaultValue={editingUser?.role || "HUMAS"}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="HUMAS">Humas</SelectItem>
                                    <SelectItem value="VIEWER">Viewer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Reset Password Dialog */}
            <Dialog open={!!resetDialog} onOpenChange={() => setResetDialog(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>Reset password untuk {resetDialog?.name}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Password Baru</Label>
                            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 karakter" />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setResetDialog(null)}>Batal</Button>
                            <Button onClick={handleResetPassword}>Reset Password</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

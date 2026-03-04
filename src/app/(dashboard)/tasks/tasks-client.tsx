"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { EmptyState } from "@/components/empty-state"
import { Plus, Search, CheckSquare, Trash2, MoreHorizontal, Calendar, Filter } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createTask, updateTask, deleteTask, updateTaskStatus, bulkUpdateTaskStatus, bulkDeleteTasks } from "@/lib/actions/tasks"
import { formatDate, isOverdue, statusConfig, priorityConfig } from "@/lib/utils"
import { toast } from "sonner"

interface Props {
    initialTasks: any[]
    tags: any[]
    users: any[]
}

export function TasksClient({ initialTasks, tags, users }: Props) {
    const { data: session } = useSession()
    const isViewer = session?.user?.role === "VIEWER"
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [priorityFilter, setPriorityFilter] = useState("ALL")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<any>(null)
    const [selected, setSelected] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    const tasks = initialTasks.filter((t) => {
        if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !(t.description || "").toLowerCase().includes(search.toLowerCase())) return false
        if (statusFilter !== "ALL" && t.status !== statusFilter) return false
        if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false
        return true
    })

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        try {
            const fd = new FormData(e.currentTarget)
            if (editingTask) {
                await updateTask(editingTask.id, fd)
                toast.success("Task berhasil diubah")
            } else {
                await createTask(fd)
                toast.success("Task berhasil dibuat")
            }
            setDialogOpen(false)
            setEditingTask(null)
        } catch (err: any) {
            toast.error(err.message || "Gagal menyimpan")
        }
        setLoading(false)
    }

    async function handleDelete(id: string) {
        if (!confirm("Hapus task ini?")) return
        try { await deleteTask(id); toast.success("Task dihapus") } catch { toast.error("Gagal menghapus") }
    }

    async function handleStatusChange(id: string, status: string) {
        try { await updateTaskStatus(id, status); toast.success("Status diubah") } catch { toast.error("Gagal") }
    }

    async function handleBulkDone() {
        if (selected.length === 0) return
        try { await bulkUpdateTaskStatus(selected, "DONE"); setSelected([]); toast.success("Tasks ditandai selesai") } catch { toast.error("Gagal") }
    }

    async function handleBulkDelete() {
        if (selected.length === 0 || !confirm(`Hapus ${selected.length} task?`)) return
        try { await bulkDeleteTasks(selected); setSelected([]); toast.success("Tasks dihapus") } catch { toast.error("Gagal") }
    }

    const toggleSelect = (id: string) => {
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }

    function openEdit(task: any) {
        setEditingTask(task)
        setDialogOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Tasks</h1>
                    <p className="text-sm text-muted-foreground">{tasks.length} task ditemukan</p>
                </div>
                {!isViewer && (
                    <Button onClick={() => { setEditingTask(null); setDialogOpen(true) }} className="bg-gradient-to-r from-violet-600 to-indigo-600">
                        <Plus className="h-4 w-4 mr-1" /> Tambah Task
                    </Button>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Cari task..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]"><Filter className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Semua Status</SelectItem>
                        <SelectItem value="TODO">To Do</SelectItem>
                        <SelectItem value="PROGRESS">In Progress</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Semua Prioritas</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Bulk actions */}
            {selected.length > 0 && !isViewer && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">{selected.length} dipilih</span>
                    <Button size="sm" variant="outline" onClick={handleBulkDone}>✓ Mark Done</Button>
                    <Button size="sm" variant="destructive" onClick={handleBulkDelete}><Trash2 className="h-3 w-3 mr-1" /> Hapus</Button>
                </div>
            )}

            {/* Task List */}
            {tasks.length === 0 ? (
                <EmptyState icon={CheckSquare} title="Belum ada task" description="Buat task pertama untuk mulai bekerja" action={!isViewer ? <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Buat Task</Button> : undefined} />
            ) : (
                <div className="space-y-2">
                    {tasks.map((task) => (
                        <Card key={task.id} className={`transition-all duration-200 hover:shadow-md ${task.status === "DONE" ? "opacity-60" : ""}`}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    {!isViewer && (
                                        <Checkbox
                                            checked={selected.includes(task.id)}
                                            onCheckedChange={() => toggleSelect(task.id)}
                                            className="mt-1"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className={`font-medium ${task.status === "DONE" ? "line-through text-muted-foreground" : ""}`}>{task.title}</h3>
                                                {task.description && <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>}
                                            </div>
                                            {!isViewer && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openEdit(task)}>Edit</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusChange(task.id, "TODO")}>→ To Do</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusChange(task.id, "PROGRESS")}>→ In Progress</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusChange(task.id, "DONE")}>→ Done</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-red-600">Hapus</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <Badge className={statusConfig[task.status as keyof typeof statusConfig].color + " border-0 text-[11px]"} variant="outline">
                                                {statusConfig[task.status as keyof typeof statusConfig].label}
                                            </Badge>
                                            <Badge className={priorityConfig[task.priority as keyof typeof priorityConfig].color + " border-0 text-[11px]"} variant="outline">
                                                {priorityConfig[task.priority as keyof typeof priorityConfig].label}
                                            </Badge>
                                            {task.dueDate && (
                                                <span className={`text-xs flex items-center gap-1 ${isOverdue(task.dueDate) && task.status !== "DONE" ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(task.dueDate)}
                                                    {isOverdue(task.dueDate) && task.status !== "DONE" && " (Overdue)"}
                                                </span>
                                            )}
                                            {task.assignee && <span className="text-xs text-muted-foreground">→ {task.assignee.name}</span>}
                                            {task.tags.map((tag: any) => (
                                                <span key={tag.id} style={{ backgroundColor: tag.color + "20", color: tag.color }} className="text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                                    {tag.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingTask(null) }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingTask ? "Edit Task" : "Tambah Task"}</DialogTitle>
                        <DialogDescription>
                            {editingTask ? "Ubah detail task" : "Buat task baru untuk tim"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Judul *</Label>
                            <Input name="title" defaultValue={editingTask?.title || ""} required placeholder="Judul task" />
                        </div>
                        <div className="space-y-2">
                            <Label>Deskripsi</Label>
                            <Textarea name="description" defaultValue={editingTask?.description || ""} placeholder="Deskripsi task (opsional)" rows={3} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select name="status" defaultValue={editingTask?.status || "TODO"}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TODO">To Do</SelectItem>
                                        <SelectItem value="PROGRESS">In Progress</SelectItem>
                                        <SelectItem value="DONE">Done</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Prioritas</Label>
                                <Select name="priority" defaultValue={editingTask?.priority || "MEDIUM"}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">Low</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HIGH">High</SelectItem>
                                        <SelectItem value="URGENT">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Deadline</Label>
                                <Input name="dueDate" type="date" defaultValue={editingTask?.dueDate ? new Date(editingTask.dueDate).toISOString().split("T")[0] : ""} />
                            </div>
                            <div className="space-y-2">
                                <Label>Assignee</Label>
                                <select name="assigneeId" defaultValue={editingTask?.assigneeId || ""} className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm">
                                    <option value="">-- Pilih --</option>
                                    {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag: any) => (
                                    <label key={tag.id} className="flex items-center gap-1.5 text-xs cursor-pointer">
                                        <input type="checkbox" name="tags" value={tag.id} defaultChecked={editingTask?.tags?.some((t: any) => t.id === tag.id)} className="rounded" />
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

import { Skeleton } from "@/components/ui/skeleton"

export default function NotesLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-28" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-9 w-36 rounded-lg" />
            </div>
            <Skeleton className="h-9 max-w-md rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-xl border p-5 space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-12 w-full" />
                        <div className="flex justify-between">
                            <div className="flex gap-1">
                                <Skeleton className="h-4 w-12 rounded-full" />
                                <Skeleton className="h-4 w-12 rounded-full" />
                            </div>
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

import { Skeleton } from "@/components/ui/skeleton"

export default function UsersLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-9 w-36 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-xl border p-5 space-y-3">
                        <div className="flex justify-between">
                            <div className="space-y-1">
                                <Skeleton className="h-5 w-28" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-3 w-32" />
                        <div className="flex gap-1.5">
                            <Skeleton className="h-7 w-16 rounded" />
                            <Skeleton className="h-7 w-20 rounded" />
                            <Skeleton className="h-7 w-7 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

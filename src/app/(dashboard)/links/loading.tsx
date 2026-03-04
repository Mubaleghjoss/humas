import { Skeleton } from "@/components/ui/skeleton"

export default function LinksLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-9 w-36 rounded-lg" />
            </div>
            <Skeleton className="h-9 max-w-md rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-xl border p-5 space-y-3">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-9 w-9 rounded-lg" />
                            <div className="space-y-1 flex-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-full" />
                            </div>
                        </div>
                        <Skeleton className="h-8 w-full" />
                    </div>
                ))}
            </div>
        </div>
    )
}

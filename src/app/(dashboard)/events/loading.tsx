import { Skeleton } from "@/components/ui/skeleton"

export default function EventsLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-28" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-9 w-36 rounded-lg" />
            </div>
            <div className="flex gap-3">
                <Skeleton className="h-9 flex-1 max-w-md rounded-lg" />
                <Skeleton className="h-9 w-36 rounded-lg" />
            </div>
            <div className="space-y-6">
                <div className="space-y-3">
                    <Skeleton className="h-4 w-32" />
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-xl border p-5 flex items-start gap-4">
                            <Skeleton className="h-14 w-14 rounded-xl" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-2/3" />
                                <Skeleton className="h-3 w-40" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                    <Skeleton className="h-5 w-24" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

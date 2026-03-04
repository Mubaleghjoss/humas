import { Skeleton } from "@/components/ui/skeleton"

export default function TasksLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-9 w-36 rounded-lg" />
            </div>

            <div className="flex gap-3">
                <Skeleton className="h-9 flex-1 max-w-md rounded-lg" />
                <Skeleton className="h-9 w-36 rounded-lg" />
                <Skeleton className="h-9 w-36 rounded-lg" />
            </div>

            <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-xl border p-4 flex items-start gap-3">
                        <Skeleton className="h-4 w-4 mt-1 rounded" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-2/3" />
                            <div className="flex gap-2">
                                <Skeleton className="h-5 w-16 rounded-full" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                                <Skeleton className="h-5 w-24" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

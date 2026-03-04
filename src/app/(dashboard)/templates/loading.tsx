import { Skeleton } from "@/components/ui/skeleton"

export default function TemplatesLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-9 w-40 rounded-lg" />
            </div>
            <div className="flex gap-3">
                <Skeleton className="h-9 flex-1 max-w-md rounded-lg" />
                <Skeleton className="h-9 w-40 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-xl border p-5 space-y-3">
                        <div className="flex justify-between">
                            <Skeleton className="h-5 w-2/3" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-20 w-full" />
                        <div className="flex gap-1">
                            <Skeleton className="h-5 w-14 rounded" />
                            <Skeleton className="h-5 w-14 rounded" />
                        </div>
                        <div className="flex gap-1.5">
                            <Skeleton className="h-7 w-24 rounded" />
                            <Skeleton className="h-7 w-7 rounded" />
                            <Skeleton className="h-7 w-7 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export const dynamic = 'force-dynamic'

import { getContentItems, getHashtags } from "@/lib/actions/content"
import { getTags } from "@/lib/actions/users"
import { ContentClient } from "./content-client"

export default async function ContentPage() {
    const [items, tags, hashtags] = await Promise.all([getContentItems(), getTags(), getHashtags()])
    return <ContentClient initialItems={items as any} tags={tags} hashtags={hashtags} />
}

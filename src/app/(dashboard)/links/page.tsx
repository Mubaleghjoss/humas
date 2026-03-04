export const dynamic = 'force-dynamic'

import { getLinks } from "@/lib/actions/links"
import { getTags } from "@/lib/actions/users"
import { LinksClient } from "./links-client"

export default async function LinksPage() {
    const [links, tags] = await Promise.all([getLinks(), getTags()])
    return <LinksClient initialLinks={links as any} tags={tags} />
}

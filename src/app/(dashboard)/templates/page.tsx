export const dynamic = 'force-dynamic'

import { getTemplates } from "@/lib/actions/templates"
import { TemplatesClient } from "./templates-client"

export default async function TemplatesPage() {
    const templates = await getTemplates()
    return <TemplatesClient initialTemplates={templates as any} />
}

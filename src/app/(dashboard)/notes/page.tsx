export const dynamic = 'force-dynamic'

import { getNotes } from "@/lib/actions/notes"
import { getTags } from "@/lib/actions/users"
import { NotesClient } from "./notes-client"

export default async function NotesPage() {
    const [notes, tags] = await Promise.all([getNotes(), getTags()])
    return <NotesClient initialNotes={notes} tags={tags} />
}

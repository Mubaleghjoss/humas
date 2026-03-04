export const dynamic = 'force-dynamic'

import { getContacts } from "@/lib/actions/contacts"
import { getTags } from "@/lib/actions/users"
import { ContactsClient } from "./contacts-client"

export default async function ContactsPage() {
    const [contacts, tags] = await Promise.all([getContacts(), getTags()])
    return <ContactsClient initialContacts={contacts as any} tags={tags} />
}

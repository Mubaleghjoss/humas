export const dynamic = 'force-dynamic'

import { getEvents } from "@/lib/actions/events"
import { getTags, getUsers } from "@/lib/actions/users"
import { EventsClient } from "./events-client"

export default async function EventsPage() {
    const [events, tags, users] = await Promise.all([getEvents(), getTags(), getUsers()])
    return <EventsClient initialEvents={events as any} tags={tags} users={users} />
}

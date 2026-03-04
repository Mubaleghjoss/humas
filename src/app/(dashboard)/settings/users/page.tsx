export const dynamic = 'force-dynamic'

import { getUsers } from "@/lib/actions/users"
import { UsersClient } from "./users-client"

export default async function UsersPage() {
    const users = await getUsers()
    return <UsersClient initialUsers={users} />
}

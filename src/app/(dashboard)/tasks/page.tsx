export const dynamic = 'force-dynamic'

import { getTasks } from "@/lib/actions/tasks"
import { getTags, getUsers } from "@/lib/actions/users"
import { TasksClient } from "./tasks-client"

export default async function TasksPage() {
    const [tasks, tags, users] = await Promise.all([
        getTasks(),
        getTags(),
        getUsers(),
    ])

    return <TasksClient initialTasks={tasks as any} tags={tags} users={users} />
}

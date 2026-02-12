import { Database } from "./database.types";
import { FromDb } from "./utils";

export type TaskStatus = Database['public']['Enums']['task_status'];

export type Task = FromDb<Database['public']['Tables']['tasks']['Row']>;

export type TaskWithSubtasks = Task & {
    subtasks: Task[];
};

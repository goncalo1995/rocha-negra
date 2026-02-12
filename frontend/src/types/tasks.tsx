import { Database } from "./database.types";
import { FromDb } from "./utils";

export type TaskStatus = Database['public']['Enums']['task_status'];

export type Task = FromDb<Database['public']['Tables']['tasks']['Row']>;

export type TaskWithSubtasks = Task & {
    subtasks: Task[];
};

export type TaskCreate = {
    title: string;
    description?: string | null;
    status?: TaskStatus;
    priority?: number;
    dueDate?: string | null; // ISO Date String
    nodeId?: string | null; // Optional: Link to a project/node
    parentId?: string | null; // Optional: For subtasks
};

export type TaskUpdate = {
    title?: string;
    description?: string | null;
    assignedTo?: string | null;
    status?: TaskStatus;
    priority?: number;
    position?: number;
    dueDate?: string | null;
    nodeId?: string | null;
    parentId?: string | null;
};

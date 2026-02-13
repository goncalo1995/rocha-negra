import { Database } from "./database.types";
import { Task } from "./tasks";
import { FromDb } from "./utils";

// Enums
export type NodeStatus = Database['public']['Enums']['node_status'];
export type NodeType = Database['public']['Enums']['node_type'];
export type NodeRole = Database['public']['Enums']['node_role'];

// --- DATABASE TYPES ---
export type Node = FromDb<Database['public']['Tables']['nodes']['Row']>;
export type NodeMember = FromDb<Database['public']['Tables']['node_members']['Row']>;
export type NodeLink = FromDb<Database['public']['Tables']['node_links']['Row']>;

// --- API CONTRACT (DTOs) ---
export interface NodeCreate {
    name: string;
    description?: string | null;
    type: NodeType;
    parentId?: string | null;
    dueDate?: string | null;
}

export interface NodeUpdate {
    name?: string;
    description?: string;
    content?: string;
    url?: string;
    storagePath?: string;
    status?: NodeStatus;
    dueDate?: string | null;
    parentId?: string | null;
}

export type FullNode = Node & {
    members: { userId: string; role: NodeRole }[];
    tasks: Task[];
    subNodes: Node[];
    incomingLinks: NodeLink[];
    outgoingLinks: NodeLink[];
};


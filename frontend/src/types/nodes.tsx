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

export interface NodeSummary {
    id: string;
    name: string;
    status: NodeStatus;
    type: NodeType;
    dueDate?: string | null;
    createdAt: string;
    updatedAt: string;
    memberCount: number;
    taskCount: number;
}

export interface ProjectDetails {
    nodeId: string;
    desiredOutcome?: string | null;
    mainRisk?: string | null;
    progress?: number | null;
    isAiEnabled?: boolean | null;
}

// --- API CONTRACT (DTOs) ---
export interface NodeCreate {
    name: string;
    description?: string | null;
    type: NodeType;
    status?: NodeStatus;
    parentId?: string | null;
    dueDate?: string | null;
    // Capability fields
    desiredOutcome?: string | null;
    mainRisk?: string | null;
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

export interface NodeLinkDto {
    id: string; // Target Node ID (was targetNodeId)
    name: string;
    type: NodeType;
    linkType: string; // NodeLinkType enum string
    createdBy: string;
    createdAt: string;
}

export type FullNode = Node & {
    members: { userId: string; role: NodeRole }[];
    tasks: Task[];
    subNodes: Node[];
    referencedBy: NodeLinkDto[];
    references: NodeLinkDto[];
    ancestors: NodeSummary[];
    projectDetails?: ProjectDetails | null;
};

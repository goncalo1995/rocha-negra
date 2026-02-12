import { Database } from "./database.types";
import { FromDb } from "./utils";

// Enums
export type NodeStatus = Database['public']['Enums']['node_status'];
export type NodeType = Database['public']['Enums']['node_type'];
export type NodeRole = Database['public']['Enums']['node_role'];

export type Node = FromDb<Database['public']['Tables']['nodes']['Row']>;

export type FullNode = Node & {
    members: { userId: string; role: NodeRole }[];
    subNodes: Node[];
};

export type NodeMember = FromDb<Database['public']['Tables']['node_members']['Row']>;

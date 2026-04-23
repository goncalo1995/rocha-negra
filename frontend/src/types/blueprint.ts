import { TaskStatus } from "./tasks";

export interface BlueprintStep {
    id: string;
    nodeId: string;
    parentId: string | null;
    position: number;
    title: string;
    description: string;
    status: TaskStatus;
    contextNodeIds: string[];
    details: string; // JSON string
    createdAt: string;
    updatedAt: string;
    children: BlueprintStep[];
}

export interface BlueprintStepCreate {
    parentId?: string | null;
    title: string;
    description?: string;
    status?: TaskStatus;
    contextNodeIds?: string[];
    details?: string;
}

export interface BlueprintStepUpdate {
    title?: string;
    description?: string;
    status?: TaskStatus;
    contextNodeIds?: string[];
    details?: string;
    position?: number;
}

export interface AiPlanGenerateRequest {
    goal: string;
    contextNodeIds: string[];
}

export interface PublicBlueprintStep {
    id: string;
    parentId: string | null;
    title: string;
    description: string | null;
    status: TaskStatus;
    position: number;
    children: PublicBlueprintStep[];
}

export interface PublicTask {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: number;
    dueDate: string | null;
}

export interface PublicNode {
    id: string;
    name: string;
    description: string | null;
    content: string | null;
    icon: string | null;
    type: string;
    tasks: PublicTask[];
    blueprint: PublicBlueprintStep[];
    lastUpdated: string;
}

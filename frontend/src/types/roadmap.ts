import { FromDb } from "./utils";
import { Database } from "./database.types";

export type RoadmapStepStatus = 'todo' | 'completed' | 'in_progress' | 'blocked';

export interface RoadmapStep {
    id: string;
    nodeId: string;
    title: string;
    status: RoadmapStepStatus;
    parentStepId: string | null;
    definitionOfDone: string;
    prompt: string;
    position: number;
    contextNodeIds: string[];
}

export interface RoadmapStepCreate {
    title: string;
    status?: RoadmapStepStatus;
    parentStepId?: string | null;
    definitionOfDone?: string;
    prompt?: string;
    position?: number;
    contextNodeIds?: string[];
}

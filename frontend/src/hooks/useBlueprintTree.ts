// hooks/useBlueprintTree.ts
import { TaskStatus } from '@/types/tasks';
import { useMemo } from 'react';

interface FlatBlueprintStep {
    id: string;
    nodeId: string;
    parentId: string | null;
    position: number;
    title: string;
    description: string | null;
    status: TaskStatus;
    contextNodeIds: string[];
    details: string | null;
    createdAt: string;
    updatedAt: string;
}

interface TreeBlueprintStep extends FlatBlueprintStep {
    children: TreeBlueprintStep[];
}

function buildBlueprintTree(flatSteps: FlatBlueprintStep[]): TreeBlueprintStep[] {
    const stepMap = new Map<string, TreeBlueprintStep>();
    const roots: TreeBlueprintStep[] = [];

    // Create map with empty children
    flatSteps.forEach(step => {
        stepMap.set(step.id, { ...step, children: [] });
    });

    // Build parent-child relationships
    flatSteps.forEach(step => {
        const stepWithChildren = stepMap.get(step.id)!;
        if (step.parentId && stepMap.has(step.parentId)) {
            stepMap.get(step.parentId)!.children.push(stepWithChildren);
        } else {
            roots.push(stepWithChildren);
        }
    });

    // Sort children by position
    const sortChildren = (step: TreeBlueprintStep) => {
        step.children.sort((a, b) => a.position - b.position);
        step.children.forEach(sortChildren);
    };
    roots.forEach(sortChildren);

    return roots;
}

export function useBlueprintTree(flatBlueprint: FlatBlueprintStep[]) {
    return useMemo(() => buildBlueprintTree(flatBlueprint), [flatBlueprint]);
}
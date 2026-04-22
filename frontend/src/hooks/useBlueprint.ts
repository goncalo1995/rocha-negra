import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BlueprintStepCreate, BlueprintStepUpdate, AiPlanGenerateRequest } from '../types/blueprint';
import { toast } from 'sonner';
import { useBlueprintTree } from './useBlueprintTree';
import api from '@/lib/api';
import { BlueprintStep } from '@/types/blueprint';

export function useBlueprint(nodeId: string) {
    const { data: flatBlueprint = [], ...rest } = useQuery({
        queryKey: ['blueprint', nodeId],
        queryFn: () => api.get<BlueprintStep[]>(`/nodes/${nodeId}/blueprint`).then(res => res.data),
        enabled: !!nodeId,
    });

    const blueprintTree = useBlueprintTree(flatBlueprint);

    return {
        blueprint: blueprintTree,
        flatBlueprint,
        ...rest
    };
}

export function useBlueprintMutations(nodeId: string) {
    const queryClient = useQueryClient();

    const createStep = useMutation({
        mutationFn: (step: BlueprintStepCreate) => api.post<BlueprintStep>(`/nodes/${nodeId}/blueprint/steps`, step),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blueprint', nodeId] });
            toast.success('Step created');
        },
        onError: (error: any) => {
            toast.error('Failed to create step: ' + (error.response?.data?.message || error.message));
        }
    });

    const updateStep = useMutation({
        mutationFn: ({ stepId, updates }: { stepId: string; updates: BlueprintStepUpdate }) => 
            api.patch<BlueprintStep>(`/blueprint/steps/${stepId}`, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blueprint', nodeId] });
        },
        onError: (error: any) => {
            toast.error('Failed to update step: ' + (error.response?.data?.message || error.message));
        }
    });

    const deleteStep = useMutation({
        mutationFn: (stepId: string) => api.delete(`/blueprint/steps/${stepId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blueprint', nodeId] });
            toast.success('Step deleted');
        },
        onError: (error: any) => {
            toast.error('Failed to delete step: ' + (error.response?.data?.message || error.message));
        }
    });

    const reorderSteps = useMutation({
        mutationFn: ({ parentId, orderedStepIds }: { parentId: string | null; orderedStepIds: string[] }) => 
            api.post(`/blueprint/steps/reorder`, { parentId, orderedStepIds }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blueprint', nodeId] });
        },
        onError: (error: any) => {
            toast.error('Failed to reorder steps: ' + (error.response?.data?.message || error.message));
        }
    });

    const generatePlan = useMutation({
        mutationFn: (request: AiPlanGenerateRequest) => api.post(`/nodes/${nodeId}/blueprint/generate-plan`, request, { timeout: 90000 }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blueprint', nodeId] });
            toast.success('AI plan generated successfully');
        },
        onError: (error: any) => {
            toast.error('Failed to generate plan: ' + (error.response?.data?.message || error.message));
        }
    });

    const analyzeStep = useMutation({
        mutationFn: (stepId: string) => api.post<{ analysis: string }>(`/blueprint/steps/${stepId}/analyze`).then(res => res.data),
        onError: (error: any) => {
            toast.error('Failed to analyze step: ' + (error.response?.data?.message || error.message));
        }
    });

    return {
        createStep,
        updateStep,
        deleteStep,
        reorderSteps,
        generatePlan,
        analyzeStep,
    };
}

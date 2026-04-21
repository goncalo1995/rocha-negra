import api from "@/lib/api";
import { RoadmapStep, RoadmapStepCreate } from "@/types/roadmap";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useRoadmap(nodeId?: string) {
    return useQuery<RoadmapStep[]>({
        queryKey: ['roadmap', nodeId],
        enabled: !!nodeId,
        queryFn: async () => (await api.get(`/roadmap/${nodeId}`)).data,
    });
}

export function useRoadmapMutations(nodeId?: string) {
    const queryClient = useQueryClient();

    const createStep = useMutation({
        mutationFn: (newStep: RoadmapStepCreate) => api.post(`/roadmap/${nodeId}/steps`, newStep),
        onSuccess: () => {
            toast.success("Step added.");
            queryClient.invalidateQueries({ queryKey: ['roadmap', nodeId] });
        },
        onError: (error: any) => {
            toast.error("Failed to add step: " + (error.response?.data?.message || error.message));
        }
    });

    const updateStep = useMutation({
        mutationFn: ({ stepId, updates }: { stepId: string; updates: RoadmapStepCreate }) => 
            api.patch(`/roadmap/steps/${stepId}`, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roadmap', nodeId] });
        },
        onError: (error: any) => {
            toast.error("Failed to update step: " + (error.response?.data?.message || error.message));
        }
    });

    const deleteStep = useMutation({
        mutationFn: (stepId: string) => api.delete(`/roadmap/steps/${stepId}`),
        onSuccess: () => {
            toast.success("Step deleted.");
            queryClient.invalidateQueries({ queryKey: ['roadmap', nodeId] });
        },
        onError: (error: any) => {
            toast.error("Failed to delete step: " + (error.response?.data?.message || error.message));
        }
    });

    return {
        createStep,
        updateStep,
        deleteStep
    };
}

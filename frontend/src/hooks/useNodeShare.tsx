import api from "@/lib/api";
import { PublicNode } from "@/types/nodes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface NodeShareState {
    token: string | null;
    enabled: boolean;
    url: string | null;
    lastViewedAt: string | null;
    viewCount: number;
}

export function useNodeShare(nodeId?: string) {
    return useQuery<NodeShareState>({
        queryKey: ['node-share', nodeId],
        enabled: !!nodeId,
        queryFn: async () => {
            const res = await api.get(`/nodes/${nodeId}`);
            const data = res.data;
            return {
                token: data.shareToken ?? null,
                enabled: data.shareEnabled ?? false,
                url: data.shareToken ? `${window.location.origin}/share/${data.shareToken}` : null,
                lastViewedAt: data.lastViewedAt ?? null,
                viewCount: data.viewCount ?? 0,
            };
        },
    });
}

export function useNodeShareMutations(nodeId?: string) {
    const queryClient = useQueryClient();

    const enableShare = useMutation({
        mutationFn: () => api.post(`/nodes/${nodeId}/share`),
        onSuccess: () => {
            toast.success("Share link enabled.");
            queryClient.invalidateQueries({ queryKey: ['node-share', nodeId] });
            queryClient.invalidateQueries({ queryKey: ['nodes', nodeId] });
        },
        onError: (error: any) => {
            toast.error("Failed to enable share: " + (error.response?.data?.message || error.message));
        },
    });

    const disableShare = useMutation({
        mutationFn: () => api.post(`/nodes/${nodeId}/share/disable`),
        onSuccess: () => {
            toast.success("Share link disabled.");
            queryClient.invalidateQueries({ queryKey: ['node-share', nodeId] });
            queryClient.invalidateQueries({ queryKey: ['nodes', nodeId] });
        },
        onError: (error: any) => {
            toast.error("Failed to disable share: " + (error.response?.data?.message || error.message));
        },
    });

    const regenerateShare = useMutation({
        mutationFn: () => api.post(`/nodes/${nodeId}/share/regenerate`),
        onSuccess: () => {
            toast.success("Share link regenerated.");
            queryClient.invalidateQueries({ queryKey: ['node-share', nodeId] });
            queryClient.invalidateQueries({ queryKey: ['nodes', nodeId] });
        },
        onError: (error: any) => {
            toast.error("Failed to regenerate share: " + (error.response?.data?.message || error.message));
        },
    });

    return { enableShare, disableShare, regenerateShare };
}

export function useSharedNode(token?: string) {
    return useQuery<PublicNode>({
        queryKey: ['shared-node', token],
        enabled: !!token,
        queryFn: async () => {
            // Use fetch directly (no auth required for public shares)
            const res = await fetch(`${import.meta.env.VITE_API_URL}/nodes/share/${token}`);
            if (!res.ok) throw new Error('Failed to load shared node');
            return res.json();
        },
    });
}

export function useNodeShareStats(nodeId?: string) {
    return useQuery({
        queryKey: ['node-share-stats', nodeId],
        enabled: !!nodeId,
        queryFn: async () => {
            const res = await api.get(`/nodes/${nodeId}/share/stats`);
            return res.data; // { viewCount, lastViewedAt }
        },
        refetchInterval: false, // Or set to 30000 if you want live updates
    });
}
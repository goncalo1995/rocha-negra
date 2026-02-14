import api from "@/lib/api";
import { FullNode, NodeCreate, NodeUpdate } from "@/types/nodes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Node } from "@/types/nodes";
import { toast } from "sonner";

export function useNodes(type?: string, query?: string) {
    return useQuery<Node[]>({
        queryKey: ['nodes', type, query],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (type) params.append('type', type);
            if (query) params.append('query', query);
            return (await api.get(`/nodes?${params.toString()}`)).data;
        },
    });
}

// Hook for fetching a single, detailed node
export function useNode(id?: string) {
    return useQuery<FullNode>({
        queryKey: ['nodes', id],
        enabled: !!id,
        queryFn: async () => (await api.get(`/nodes/${id}`)).data,
    });
}


// --- MUTATION HOOK (for actions) ---
// This single hook provides all the actions related to nodes.
export function useNodeMutations() {
    const queryClient = useQueryClient();

    const createNode = useMutation({
        mutationFn: (newNode: NodeCreate) => api.post('/nodes', newNode),
        onSuccess: () => {
            toast.success("Node created successfully!");
            queryClient.invalidateQueries({ queryKey: ['nodes'] });
            queryClient.invalidateQueries({ queryKey: ['nodes-tree'] });
        },
        onError: (error) => {
            toast.error("Failed to create node: " + error.message);
        }
    });

    const updateNode = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: NodeUpdate }) => api.patch(`/nodes/${id}`, updates),
        onSuccess: () => {
            toast.success("Node updated.");
            // Invalidate 'nodes' covers both list queries and detail queries for ANY node
            // because list queries use ['nodes', type, query] and details use ['nodes', id].
            // React Query default behavior with invalidateQueries is to match by prefix.
            queryClient.invalidateQueries({ queryKey: ['nodes'] });
            queryClient.invalidateQueries({ queryKey: ['nodes-tree'] });
        },
        onError: (error) => {
            toast.error("Failed to update node: " + error.message);
        }
    });

    const deleteNode = useMutation({
        mutationFn: (id: string) => api.delete(`/nodes/${id}`),
        onSuccess: () => {
            toast.success("Node deleted.");
            queryClient.invalidateQueries({ queryKey: ['nodes'] });
            queryClient.invalidateQueries({ queryKey: ['nodes-tree'] });
        },
        onError: (error) => {
            toast.error("Failed to delete node: " + error.message);
        }
    });

    const linkNode = useMutation({
        mutationFn: ({ sourceId, targetId, type }: { sourceId: string; targetId: string; type: string }) =>
            api.post(`/nodes/${sourceId}/links`, { targetNodeId: targetId, type }),
        onSuccess: (_, { sourceId }) => {
            toast.success("Link added.");
            queryClient.invalidateQueries({ queryKey: ['nodes', sourceId] });
        },
        onError: (error) => {
            toast.error("Failed to link node: " + error.message);
        }
    });

    const unlinkNode = useMutation({
        mutationFn: ({ sourceId, targetId }: { sourceId: string; targetId: string }) =>
            api.delete(`/nodes/${sourceId}/links/${targetId}`),
        onSuccess: (_, { sourceId }) => {
            toast.success("Link removed.");
            queryClient.invalidateQueries({ queryKey: ['nodes', sourceId] });
        },
        onError: (error) => {
            toast.error("Failed to remove link: " + error.message);
        }
    });

    return {
        createNode,
        updateNode,
        deleteNode,
        linkNode,
        unlinkNode,
    };
}
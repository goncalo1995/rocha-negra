import api from "@/lib/api";
import { FullNode, NodeCreate, NodeUpdate } from "@/types/nodes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Node } from "@/types/nodes";
import { toast } from "sonner";

export function useNodes() {
    return useQuery<Node[]>({
        queryKey: ['nodes'],
        queryFn: async () => (await api.get('/nodes')).data,
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
        },
        onError: (error) => {
            toast.error("Failed to create node: " + error.message);
        }
    });

    const updateNode = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: NodeUpdate }) => api.patch(`/nodes/${id}`, updates),
        onSuccess: (_, { id }) => {
            toast.success("Node updated.");
            // Invalidate both the list and the specific detail query
            queryClient.invalidateQueries({ queryKey: ['nodes'] });
            queryClient.invalidateQueries({ queryKey: ['nodes', id] });
        },
        onError: (error) => {
            toast.error("Failed to update node: " + error.message);
        }
    });

    const deleteNode = useMutation({
        mutationFn: (id: string) => api.delete(`/nodes/${id}`),
        onSuccess: (_, id) => {
            toast.success("Node deleted.");
            // Optimistically remove from the detail cache for an instant UI update
            queryClient.removeQueries({ queryKey: ['nodes', id] });
            // Refetch the main list
            queryClient.invalidateQueries({ queryKey: ['nodes'] });
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
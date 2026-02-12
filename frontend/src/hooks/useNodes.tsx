import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useCallback } from 'react';
import { Node, FullNode, NodeType } from '@/types/nodes';

export function useNode(id?: string) {
    const { data: node, isLoading, error } = useQuery({
        queryKey: ['node', id],
        enabled: !!id,
        queryFn: async () => {
            const res = await api.get<FullNode>(`/nodes/${id}`);
            return res.data;
        },
    });

    return { node, isLoading, error };
}

export function useNodes() {
    const queryClient = useQueryClient();

    const { data: nodes = [], isLoading, error } = useQuery({
        queryKey: ['nodes'],
        queryFn: async () => {
            const res = await api.get<Node[]>('/nodes');
            return res.data;
        },
    });

    const createNodeMutation = useMutation({
        mutationFn: (payload: { name: string; description?: string, type: NodeType }) =>
            api.post('/nodes', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nodes'] });
        },
    });

    const updateNodeMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Node> }) =>
            api.patch(`/nodes/${id}`, updates),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['nodes'] });
            queryClient.invalidateQueries({ queryKey: ['node', id] });
        },
    });

    const deleteNodeMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/nodes/${id}`),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['nodes'] });
            queryClient.invalidateQueries({ queryKey: ['node', id] });
        },
    });


    // Callbacks to maintain original API
    const createNode = useCallback(async (node: any) => createNodeMutation.mutateAsync(node), [createNodeMutation]);
    const updateNode = useCallback(async (id: string, updates: any) => updateNodeMutation.mutateAsync({ id, updates }), [updateNodeMutation]);
    const deleteNode = useCallback(async (id: string) => deleteNodeMutation.mutateAsync(id), [deleteNodeMutation]);


    return {
        nodes,
        isLoading,
        error,
        createNode,
        updateNode,
        deleteNode,
    };
}

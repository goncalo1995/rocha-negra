import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Task, TaskWithSubtasks } from '@/types/tasks';
import { useMemo, useCallback } from 'react';

export function useTask(id?: string) {
    const { data: task, isLoading, error } = useQuery({
        queryKey: ['task', id],
        enabled: !!id,
        queryFn: async () => {
            const res = await api.get<TaskWithSubtasks>(`/tasks/${id}`);
            return res.data;
        },
    });

    return { task, isLoading, error };
}

export function useTasks(projectId?: string) {
    const queryClient = useQueryClient();

    const { data: tasks = [], isLoading, error } = useQuery({
        queryKey: ['tasks', { projectId }],
        // If projectId is strictly undefined, we fetch all. If it's null, we might fetch inbox (if we changed logic, but here strict check).
        // Actually, we want to fetch if projectId is defined OR if we want global.
        // Let's just always enable it, but pass the param if it exists.
        queryFn: async () => {
            const res = await api.get<Task[]>('/tasks', {
                params: projectId ? { projectId } : undefined,
            });
            return res.data;
        },
    });

    const activeTasks = useMemo(
        () => tasks.filter(t => t.status !== 'DONE'),
        [tasks]
    );

    const createTaskMutation = useMutation({
        mutationFn: (payload: Partial<Task> & { nodeId: string }) =>
            api.post('/tasks', payload),
        onSuccess: (_, { nodeId }) => {
            queryClient.invalidateQueries({ queryKey: ['tasks', { nodeId }] });
        },
    });

    const createTaskInNodeMutation = useMutation({
        mutationFn: (payload: Partial<Task> & { nodeId: string }) =>
            api.post(`/nodes/${payload.nodeId}/tasks`, payload),
        onSuccess: (_, { nodeId }) => {
            queryClient.invalidateQueries({ queryKey: ['tasks', { nodeId }] });
        },
    });

    const updateTaskMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
            api.patch(`/tasks/${id}`, updates),
        onSuccess: (_, { updates }) => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            if (updates.nodeId) {
                queryClient.invalidateQueries({
                    queryKey: ['tasks', { nodeId: updates.nodeId }],
                });
            }
        },
    });

    const deleteTaskMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/tasks/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });

    // Callbacks to maintain original API
    const createTask = useCallback(async (t: Partial<Task> & { nodeId: string }) => createTaskMutation.mutateAsync(t), [createTaskMutation]);
    const createTaskInNode = useCallback(async (t: Partial<Task> & { nodeId: string }) => createTaskInNodeMutation.mutateAsync(t), [createTaskInNodeMutation]);
    const updateTask = useCallback(async (id: string, updates: Partial<Task>) => updateTaskMutation.mutateAsync({ id, updates }), [updateTaskMutation]);
    const deleteTask = useCallback(async (id: string) => deleteTaskMutation.mutateAsync(id), [deleteTaskMutation]);

    return {
        tasks,
        activeTasks,
        isLoading,
        error,
        createTask,
        createTaskInNode,
        updateTask,
        deleteTask,
    };
}

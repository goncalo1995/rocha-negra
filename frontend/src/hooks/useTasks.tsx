import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Task } from '@/types/tasks';
import { useMemo, useCallback } from 'react';

export function useTasks(projectId?: string) {
    const queryClient = useQueryClient();

    const { data: tasks = [], isLoading } = useQuery({
        queryKey: ['tasks', { projectId }],
        enabled: !!projectId,
        queryFn: async () => {
            const res = await api.get<Task[]>('/tasks', {
                params: { projectId },
            });
            return res.data;
        },
    });

    const activeTasks = useMemo(
        () => tasks.filter(t => t.status !== 'done'),
        [tasks]
    );

    const createTaskMutation = useMutation({
        mutationFn: (payload: Partial<Task> & { projectId: string }) =>
            api.post('/tasks', payload),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: ['tasks', { projectId }] });
        },
    });

    const updateTaskMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
            api.patch(`/tasks/${id}`, updates),
        onSuccess: (_, { updates }) => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            if (updates.projectId) {
                queryClient.invalidateQueries({
                    queryKey: ['tasks', { projectId: updates.projectId }],
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
    const createTask = useCallback(async (t: Partial<Task> & { projectId: string }) => createTaskMutation.mutateAsync(t), [createTaskMutation]);
    const updateTask = useCallback(async (id: string, updates: Partial<Task>) => updateTaskMutation.mutateAsync({ id, updates }), [updateTaskMutation]);
    const deleteTask = useCallback(async (id: string) => deleteTaskMutation.mutateAsync(id), [deleteTaskMutation]);

    return {
        tasks,
        activeTasks,
        isLoading,
        createTask,
        updateTask,
        deleteTask,
    };
}

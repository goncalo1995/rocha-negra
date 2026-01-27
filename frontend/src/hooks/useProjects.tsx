import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useCallback } from 'react';
import { Project } from '@/types/projects';

export function useProjects() {
    const queryClient = useQueryClient();

    const { data: projects = [], isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const res = await api.get<Project[]>('/projects');
            return res.data;
        },
    });

    const createProjectMutation = useMutation({
        mutationFn: (payload: { name: string; description?: string }) =>
            api.post('/projects', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });

    const updateProjectMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Project> }) =>
            api.patch(`/projects/${id}`, updates),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['project', id] });
        },
    });

    const deleteProjectMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/projects/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });


    // Callbacks to maintain original API
    const createProject = useCallback(async (project: any) => createProjectMutation.mutateAsync(project), [createProjectMutation]);
    const updateProject = useCallback(async (id: string, updates: any) => updateProjectMutation.mutateAsync({ id, updates }), [updateProjectMutation]);
    const deleteProject = useCallback(async (id: string) => deleteProjectMutation.mutateAsync(id), [deleteProjectMutation]);


    return {
        projects,
        isLoading,
        createProject,
        updateProject,
        deleteProject,
    };
}

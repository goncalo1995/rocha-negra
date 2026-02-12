import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Task, TaskCreate, TaskUpdate, TaskWithSubtasks } from '@/types/tasks';
import { toast } from 'sonner';

interface UseTasksProps {
    nodeId?: string | null; // For fetching tasks of a specific project/node
    scope?: 'inbox' | 'today' | 'upcoming' | 'active'; // For GTD views
}

/**
 * A flexible hook to fetch a list of tasks based on different scopes.
 */
export function useTasks({ nodeId, scope }: UseTasksProps = {}) {
    // The query key is crucial. It uniquely identifies the data being fetched.
    const queryKey = ['tasks', { nodeId, scope }];

    const queryFn = async () => {
        let endpoint = '/tasks';
        let params: Record<string, any> = {};

        if (nodeId) {
            // Fetch tasks for a specific node (project)
            endpoint = `/nodes/${nodeId}/tasks`;
        } else if (scope === 'inbox') {
            // Fetch personal tasks not assigned to any node
            endpoint = '/tasks/inbox';
        } else if (scope === 'active') {
            // Fetch personal tasks not assigned to any node
            endpoint = '/tasks/active';
        } else if (scope === 'today') {
            endpoint = '/tasks';
            params.dueDate = new Date().toISOString().split('T')[0];
        } else if (scope === 'upcoming') {
            const today = new Date();
            const nextWeek = new Date(today.setDate(today.getDate() + 7));
            endpoint = '/tasks';
            params.endDate = nextWeek.toISOString().split('T')[0];
        }

        const res = await api.get<Task[]>(endpoint, { params });
        return res.data;
    };

    return useQuery<Task[]>({ queryKey, queryFn });
}

/**
 * Hook for fetching a single, detailed task with its subtasks.
 */
export function useTask(id?: string) {
    return useQuery<TaskWithSubtasks>({
        queryKey: ['tasks', id],
        enabled: !!id,
        queryFn: async () => (await api.get(`/tasks/${id}`)).data,
    });
}


// =================================================================
// MUTATION HOOK (For Actions: Create, Update, Delete)
// =================================================================

export function useTaskMutations() {
    const queryClient = useQueryClient();

    // A single, unified 'create' mutation
    const createTask = useMutation({
        mutationFn: (newTask: TaskCreate) => {
            // The endpoint depends on whether a nodeId is provided
            const endpoint = newTask.nodeId ? `/nodes/${newTask.nodeId}/tasks` : '/tasks';
            return api.post(endpoint, newTask);
        },
        onSuccess: (_, variables) => {
            toast.success("Task created!");
            // Invalidate the list of tasks for the specific node it was added to
            if (variables.nodeId) {
                queryClient.invalidateQueries({ queryKey: ['tasks', { nodeId: variables.nodeId }] });
                queryClient.invalidateQueries({ queryKey: ['nodes', variables.nodeId] }); // Also invalidate the parent node detail
            } else {
                // Invalidate the inbox
                queryClient.invalidateQueries({ queryKey: ['tasks', 'inbox'] });
            }
        },
        onError: (error) => toast.error("Failed to create task: " + error.message),
    });

    const updateTask = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: TaskUpdate }) => api.patch(`/tasks/${id}`, updates),
        onSuccess: (_, { id }) => {
            toast.success("Task updated.");
            // Invalidate the specific task detail query and all task lists
            queryClient.invalidateQueries({ queryKey: ['tasks', id] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Broad invalidation for lists
        },
    });

    const deleteTask = useMutation({
        mutationFn: (id: string) => api.delete(`/tasks/${id}`),
        // OPTIMISTIC UPDATE: Make the UI feel instant
        onMutate: async (deletedTaskId: string) => {
            // Cancel any outgoing refetches so they don't overwrite our optimistic update
            await queryClient.cancelQueries({ queryKey: ['tasks'] });

            // Snapshot the previous value
            const previousTasks = queryClient.getQueryData(['tasks']); // You might need a more specific key

            // Optimistically remove the task from the cache
            queryClient.setQueryData(['tasks'], (old: Task[] | undefined) =>
                old ? old.filter(task => task.id !== deletedTaskId) : []
            );

            // Return a context object with the snapshotted value
            return { previousTasks };
        },
        // If the mutation fails, use the context we returned to roll back
        onError: (err, deletedTaskId, context) => {
            toast.error("Failed to delete task.");
            if (context?.previousTasks) {
                queryClient.setQueryData(['tasks'], context.previousTasks);
            }
        },
        // Always refetch after error or success to ensure data consistency
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
        onSuccess: () => {
            toast.success("Task deleted.");
        },
    });

    return {
        createTask,
        updateTask,
        deleteTask,
    };
}
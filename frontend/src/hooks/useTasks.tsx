import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Task, TaskCreate, TaskUpdate } from '@/types/tasks';
import { toast } from 'sonner';

interface UseTasksProps {
    nodeId?: string | null; // For fetching tasks of a specific project/node
    scope?: 'inbox' | 'today' | 'upcoming' | 'active' | 'waiting' | 'someday' | 'all'; // For GTD views
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
            endpoint = '/tasks/today';
        } else if (scope === 'upcoming') {
            endpoint = '/tasks/upcoming';
        } else if (scope === 'waiting') {
            endpoint = '/tasks/waiting';
        } else if (scope === 'someday') {
            endpoint = '/tasks/someday';
        } else if (scope === 'all') {
            endpoint = '/tasks';
        }

        const res = await api.get<any>(endpoint, { params });
        // Handle both List and Page responses (Page has 'content' field)
        return Array.isArray(res.data) ? res.data : res.data.content;
    };

    return useQuery<Task[]>({ queryKey, queryFn });
}

interface UseInfiniteTasksProps {
    query?: string;
    status?: string;
    priority?: number;
    size?: number;
}

export function useInfiniteTasks({ query, status, priority, size = 20 }: UseInfiniteTasksProps = {}) {
    return useInfiniteQuery({
        queryKey: ['tasks', 'infinite', { query, status, priority, size }],
        initialPageParam: 0,
        queryFn: async ({ pageParam = 0 }) => {
            const res = await api.get('/tasks', {
                params: {
                    q: query,
                    status,
                    priority,
                    page: pageParam,
                    size,
                    sort: 'createdAt,desc'
                }
            });
            return res.data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.last) return undefined;
            return lastPage.number + 1;
        },
    });
}

/**
 * Hook for fetching a single, detailed task with its subtasks.
 */
export function useTask(id?: string) {
    return useQuery<Task>({
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
            // Broad invalidation of 'tasks' covers nodeId lists, GTD views, and details
            queryClient.invalidateQueries({ queryKey: ['tasks'] });

            // If it belongs to a project, refresh the project too since it embeds tasks
            if (variables.nodeId) {
                queryClient.invalidateQueries({ queryKey: ['nodes', variables.nodeId] });
            }
        },
        onError: (error) => toast.error("Failed to create task: " + error.message),
    });

    const updateTask = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: TaskUpdate }) => api.patch(`/tasks/${id}`, updates),
        onSuccess: (_, { id }) => {
            toast.success("Task updated.");
            // Invalidate 'tasks' prefix refreshes the detail and all lists/GTD views
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            // Refresh parent nodes as they might embed task status/counts
            queryClient.invalidateQueries({ queryKey: ['nodes'] });
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
            queryClient.invalidateQueries({ queryKey: ['nodes'] });
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
import { useState, useEffect } from "react";
import {
    Search, LayoutGrid, List as ListIcon, Loader2, SlidersHorizontal,
} from "lucide-react";
import { useInfiniteTasks, useTaskMutations } from "@/hooks/useTasks";
import { TaskCard, TaskStatus } from "@/components/tasks/TaskCard";
import { Input } from "@/components/ui/input";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useInView } from "react-intersection-observer";

const AllTasksPage = () => {
    const [view, setView] = useState<'list' | 'kanban'>('list');
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

    const { ref, inView } = useInView();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        refetch
    } = useInfiniteTasks({
        query: search,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        priority: priorityFilter === "ALL" ? undefined : parseInt(priorityFilter),
    });

    const { updateTask } = useTaskMutations();

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    const handleToggleStatus = (id: string, newStatus: TaskStatus) => {
        updateTask.mutate({ id, updates: { status: newStatus } });
    };

    const tasks = data?.pages.flatMap(page => page.content) || [];

    return (
        <div className="space-y-8">
            {/* Header & Controls */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">All Tasks</h1>
                        <p className="text-muted-foreground mt-1">Manage and filter all your actions in one place.</p>
                    </div>

                    <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border/50">
                        <button
                            onClick={() => setView('list')}
                            className={cn(
                                "p-2 rounded-md transition-all",
                                view === 'list' ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                            )}
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setView('kanban')}
                            className={cn(
                                "p-2 rounded-md transition-all",
                                view === 'kanban' ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                            )}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tasks..."
                            className="pl-9 bg-card/50"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="bg-card/50">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Statuses</SelectItem>
                            <SelectItem value="TODO">To Do</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="WAITING">Waiting</SelectItem>
                            <SelectItem value="SOMEDAY">Someday</SelectItem>
                            <SelectItem value="DONE">Done</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="bg-card/50">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Priorities</SelectItem>
                            <SelectItem value="1">High</SelectItem>
                            <SelectItem value="2">Medium</SelectItem>
                            <SelectItem value="3">Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Content View */}
            <div className="min-h-[400px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
                        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
                        <p className="animate-pulse">Loading your tasks...</p>
                    </div>
                ) : tasks.length > 0 ? (
                    <div className={cn(
                        view === 'list' ? "grid gap-3" : "grid grid-cols-1 md:grid-cols-3 gap-6"
                    )}>
                        {tasks.map((task, i) => (
                            <TaskCard
                                key={task.id}
                                id={task.id}
                                title={task.title}
                                status={task.status as TaskStatus}
                                priority={task.priority}
                                dueDate={task.dueDate}
                                onToggleStatus={handleToggleStatus}
                                delay={Math.min(i * 0.02, 0.5)}
                                project={task.nodeName}
                                projectColor={task.nodeColor}
                                subtasksCount={task.subtasks?.length}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed rounded-3xl border-border/50 bg-card/10">
                        <SlidersHorizontal className="w-12 h-12 text-muted-foreground/20 mb-4" />
                        <p className="text-muted-foreground font-medium">No tasks found matching your filters.</p>
                        <button
                            onClick={() => { setSearch(""); setStatusFilter("ALL"); setPriorityFilter("ALL"); }}
                            className="mt-4 text-primary text-sm font-semibold hover:underline"
                        >
                            Reset filters
                        </button>
                    </div>
                )}

                {/* Infinite Scroll Trigger */}
                <div ref={ref} className="h-10 mt-10 flex items-center justify-center">
                    {isFetchingNextPage && <Loader2 className="w-6 h-6 animate-spin text-primary/50" />}
                </div>
            </div>
        </div>
    );
};

// Simple helper for class merging if not already available in this file scope
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default AllTasksPage;

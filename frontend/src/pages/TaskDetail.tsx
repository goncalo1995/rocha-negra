import { useParams, Link } from "react-router-dom";
import { useTask, useTaskMutations } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, CheckCircle2, Circle, Clock, MoreVertical, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { MarkdownPreview } from "@/components/ui/markdown-editor";

export default function TaskDetail() {
    const { taskId } = useParams<{ taskId: string }>();
    const { data: task, isLoading } = useTask(taskId);
    const { updateTask, deleteTask } = useTaskMutations();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isSubtaskOpen, setIsSubtaskOpen] = useState(false);

    const hasIncompleteSubtasks = task?.subtasks?.some(s => s.status !== 'DONE');

    if (isLoading) {
        return <div className="p-8">Loading task details...</div>;
    }

    if (!task) {
        return <div className="p-8">Task not found</div>;
    }

    const handleStatusToggle = async () => {
        if (!task) {
            toast.error("Task not found");
            return;
        }
        const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';

        if (newStatus === 'DONE' && hasIncompleteSubtasks) {
            toast.error("Cannot mark task as done because it has incomplete subtasks.");
            return;
        }

        updateTask.mutate(
            { id: task.id, updates: { status: newStatus } },
            {
                onSuccess: () => toast.success("Task status updated!"),
                onError: (error) => toast.error(error.message),
            }
        );
    };

    const getPriorityColor = (priority: number) => {
        switch (priority) {
            case 1: return 'bg-destructive/10 text-destructive border-destructive/20';
            case 2: return 'bg-warning/10 text-warning border-warning/20';
            default: return 'bg-muted text-muted-foreground border-border';
        }
    };

    const handleDelete = () => {
        // A simple browser confirmation
        if (window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
            deleteTask.mutate(task.id, {
                onSuccess: () => toast.success("Task deleted!"),
                onError: (error) => toast.error(error.message),
            });
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link to={task.nodeId ? `/nodes/${task.nodeId}` : "/tasks"} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to {task.nodeId ? 'Node' : 'Tasks'}
            </Link>

            <div className="flex items-start gap-4">
                <button onClick={handleStatusToggle} className="mt-1">
                    {task.status === 'DONE' ? (
                        <CheckCircle2 className="h-6 w-6 text-success" />
                    ) : task.status === 'IN_PROGRESS' ? (
                        <Clock className="h-6 w-6 text-warning" />
                    ) : (
                        <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                </button>
                <div className="flex-1 space-y-1">
                    <h1 className={cn(
                        "text-3xl font-bold text-foreground",
                        task.status === 'DONE' && "text-muted-foreground line-through"
                    )}>
                        {task.title}
                    </h1>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("capitalize rounded-md", getPriorityColor(task.priority))}>
                            {task.priority === 1 ? 'High' : task.priority === 2 ? 'Medium' : 'Low'} Priority
                        </Badge>
                        {task.dueDate && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Due {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                            </div>
                        )}
                    </div>
                </div>
                <TaskDialog
                    task={task}
                    open={isEditOpen}
                    onOpenChange={setIsEditOpen}
                    trigger={<></>}
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                            Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                            Delete Task
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {/* Description */}
                    <div className="space-y-2">
                        <Label className="text-lg font-semibold">Description</Label>
                        <div className="p-4 rounded-xl bg-card border border-border/50 min-h-[100px] text-sm text-foreground">
                            {task.description ? (
                                <MarkdownPreview source={task.description} />
                            ) : (
                                <span className="text-muted-foreground">No description provided.</span>
                            )}
                        </div>
                    </div>

                    {/* Subtasks */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold">Subtasks ({task?.subtasks?.length})</Label>
                            {/* We need a way to create a subtask knowing the parentId */}
                            {/* Reusing CreateTaskDialog might be tricky if it doesn't support parentId injestion explicitly or if it assumes top level. */}
                            {/* For MVP, let's just use a simple inline add or a modified dialog. 
                                 Actually, CreateTaskDialog doesn't support parentId yet. We should update it.
                             */}
                            <TaskDialog
                                open={isSubtaskOpen}
                                onOpenChange={setIsSubtaskOpen}
                                trigger={
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Plus className="h-3.5 w-3.5" />
                                        Add Subtask
                                    </Button>
                                }
                                defaultNodeId={task.nodeId || undefined}
                                defaultParentId={task.id}
                            />
                        </div>

                        <div className="space-y-2">
                            {task?.subtasks?.map(sub => (
                                <Link to={`/tasks/${sub.id}`} key={sub.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card hover:bg-accent/50 transition-colors">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        sub.status === 'DONE' ? "bg-success" : "bg-muted-foreground"
                                    )} />
                                    <span className={cn(
                                        "flex-1 text-sm font-medium",
                                        sub.status === 'DONE' && "text-muted-foreground line-through"
                                    )}>{sub.title}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {sub.assignedTo ? 'Assigned' : 'Unassigned'}
                                    </span>
                                </Link>
                            ))}
                            {task?.subtasks?.length === 0 && (
                                <p className="text-sm text-muted-foreground italic">No subtasks.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Sidebar Metadata */}
                    <div className="p-4 rounded-xl bg-card border border-border/50 space-y-4">
                        <h3 className="font-semibold text-sm text-foreground">Details</h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <span className="capitalize">{task.status.replace('_', ' ')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created</span>
                                <span>{format(new Date(task.createdAt), 'MMM d, yyyy')}</span>
                            </div>
                            {task.updatedAt && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Updated</span>
                                    <span>{format(new Date(task.updatedAt), 'MMM d, yyyy')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useParams, Link } from "react-router-dom";
import { useTask, useTasks } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, CheckCircle2, Circle, Clock, MoreVertical, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog"; // Reusing this if possible or need a new one for subtasks?
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EditTaskDialog } from "@/components/tasks/EditTaskDialog";
import { useState } from "react";
import { toast } from "sonner";

export default function TaskDetail() {
    const { taskId } = useParams<{ taskId: string }>();
    const { task, isLoading } = useTask(taskId);
    // Fetch all tasks to filter subtasks. Ideally backend should return subtasks or we filter from global.
    // Since we now have getAllTasks, we can use useTasks() and filter.
    const { tasks: allTasks, updateTask, deleteTask } = useTasks();
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Filter logic might change if backend returned tree, but currently returns flat list.
    const subtasks = allTasks.filter(t => t.parentId === taskId).sort((a, b) => (a.position || 0) - (b.position || 0));
    const hasIncompleteSubtasks = subtasks.some(s => s.status !== 'done');

    if (isLoading) {
        return <div className="p-8">Loading task details...</div>;
    }

    if (!task) {
        return <div className="p-8">Task not found</div>;
    }

    const handleStatusToggle = async () => {
        const newStatus = task.status === 'done' ? 'todo' : 'done';

        if (newStatus === 'done' && hasIncompleteSubtasks) {
            toast.error("Cannot mark task as done because it has incomplete subtasks.");
            return;
        }

        await updateTask(task.id, { status: newStatus });
    };

    const getPriorityColor = (priority: number) => {
        switch (priority) {
            case 1: return 'bg-destructive/10 text-destructive border-destructive/20';
            case 2: return 'bg-warning/10 text-warning border-warning/20';
            default: return 'bg-muted text-muted-foreground border-border';
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link to={task.projectId ? `/projects/${task.projectId}` : "/tasks"} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to {task.projectId ? 'Project' : 'Tasks'}
            </Link>

            <div className="flex items-start gap-4">
                <button onClick={handleStatusToggle} className="mt-1">
                    {task.status === 'done' ? (
                        <CheckCircle2 className="h-6 w-6 text-success" />
                    ) : task.status === 'in_progress' ? (
                        <Clock className="h-6 w-6 text-warning" />
                    ) : (
                        <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                </button>
                <div className="flex-1 space-y-1">
                    <h1 className={cn(
                        "text-3xl font-bold text-foreground",
                        task.status === 'done' && "text-muted-foreground line-through"
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
                        <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-destructive focus:text-destructive">
                            Delete Task
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <EditTaskDialog
                    task={task}
                    open={isEditOpen}
                    onOpenChange={setIsEditOpen}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {/* Description */}
                    <div className="space-y-2">
                        <Label className="text-lg font-semibold">Description</Label>
                        <div className="p-4 rounded-xl bg-card border border-border/50 min-h-[100px] whitespace-pre-wrap text-sm text-muted-foreground">
                            {task.description || "No description provided."}
                        </div>
                    </div>

                    {/* Subtasks */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold">Subtasks ({subtasks.length})</Label>
                            {/* We need a way to create a subtask knowing the parentId */}
                            {/* Reusing CreateTaskDialog might be tricky if it doesn't support parentId injestion explicitly or if it assumes top level. */}
                            {/* For MVP, let's just use a simple inline add or a modified dialog. 
                                 Actually, CreateTaskDialog doesn't support parentId yet. We should update it.
                             */}
                            <CreateTaskDialog
                                trigger={
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Plus className="h-3.5 w-3.5" />
                                        Add Subtask
                                    </Button>
                                }
                                defaultProjectId={task.projectId || undefined}
                                defaultParentId={task.id}
                            />
                        </div>

                        <div className="space-y-2">
                            {subtasks.map(sub => (
                                <Link to={`/tasks/${sub.id}`} key={sub.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card hover:bg-accent/50 transition-colors">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        sub.status === 'done' ? "bg-success" : "bg-muted-foreground"
                                    )} />
                                    <span className={cn(
                                        "flex-1 text-sm font-medium",
                                        sub.status === 'done' && "text-muted-foreground line-through"
                                    )}>{sub.title}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {sub.assignedTo ? 'Assigned' : 'Unassigned'}
                                    </span>
                                </Link>
                            ))}
                            {subtasks.length === 0 && (
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

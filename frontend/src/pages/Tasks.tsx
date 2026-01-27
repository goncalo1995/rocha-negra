import { Plus, Circle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";

export default function Tasks() {
    const { tasks } = useTasks();
    const { projects } = useProjects();

    const getProjectName = (id: string | null) => {
        if (!id) return null;
        return projects.find(p => p.id === id)?.name;
    };

    const getPriorityColor = (priority: number) => {
        switch (priority) {
            case 1: return 'bg-destructive/20 text-destructive border-destructive/30';
            case 2: return 'bg-warning/20 text-warning border-warning/30';
            case 3: return 'bg-primary/20 text-primary border-primary/30';
            default: return 'bg-muted text-muted-foreground border-border';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'done': return <CheckCircle2 className="h-5 w-5 text-success" />;
            case 'in_progress': return <Clock className="h-5 w-5 text-warning" />;
            default: return <Circle className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const todoTasks = tasks.filter(t => t.status === 'todo');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const doneTasks = tasks.filter(t => t.status === 'done');

    const TaskCard = ({ task }: { task: typeof tasks[0] }) => (
        <div className="p-4 rounded-xl bg-accent/30 hover:bg-accent transition-colors border border-transparent hover:border-zinc-700">
            <div className="flex items-start gap-3">
                {getStatusIcon(task.status)}
                <div className="flex-1 min-w-0">
                    <p className={cn(
                        "font-medium",
                        task.status === 'done' ? "text-muted-foreground line-through" : "text-foreground"
                    )}>
                        {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium border capitalize",
                            getPriorityColor(task.priority)
                        )}>
                            {task.priority}
                        </span>
                        {getProjectName(task.projectId) && (
                            <span className="text-xs text-muted-foreground">
                                {getProjectName(task.projectId)}
                            </span>
                        )}
                    </div>
                    {task.dueDate && (
                        <p className="text-xs text-muted-foreground mt-2">
                            Due {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
                    <p className="text-muted-foreground mt-1">Track your work across all projects</p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Task
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* To Do */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Circle className="h-4 w-4 text-muted-foreground" />
                        <h2 className="font-semibold text-foreground">To Do</h2>
                        <span className="text-sm text-muted-foreground">({todoTasks.length})</span>
                    </div>
                    <div className="space-y-3">
                        {todoTasks.map(task => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </div>
                </div>

                {/* In Progress */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-warning" />
                        <h2 className="font-semibold text-foreground">In Progress</h2>
                        <span className="text-sm text-muted-foreground">({inProgressTasks.length})</span>
                    </div>
                    <div className="space-y-3">
                        {inProgressTasks.map(task => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </div>
                </div>

                {/* Done */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <h2 className="font-semibold text-foreground">Done</h2>
                        <span className="text-sm text-muted-foreground">({doneTasks.length})</span>
                    </div>
                    <div className="space-y-3">
                        {doneTasks.map(task => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

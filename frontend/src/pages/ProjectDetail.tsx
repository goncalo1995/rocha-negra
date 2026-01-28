import { useParams, Link, useNavigate } from "react-router-dom";
import { useProject, useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, CheckCircle2, Circle, Clock, MoreVertical, Plus } from "lucide-react";
import { format } from "date-fns";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProjectDetail() {
    const { projectId } = useParams<{ projectId: string }>();
    const { project, isLoading: isLoadingProject } = useProject(projectId);
    const { tasks, isLoading: isLoadingTasks } = useTasks(projectId);
    const { deleteProject } = useProjects();
    const navigate = useNavigate();

    if (isLoadingProject || isLoadingTasks) {
        return <div className="p-8">Loading project details...</div>;
    }

    if (!project) {
        return <div className="p-8">Project not found</div>;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-primary bg-primary/10 border-primary/20';
            case 'completed': return 'text-success bg-success/10 border-success/20';
            case 'on_hold': return 'text-warning bg-warning/10 border-warning/20';
            default: return 'text-muted-foreground bg-muted border-border';
        }
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
            await deleteProject(project.id);
            navigate("/projects");
        }
    };

    const getPriorityColor = (priority: number) => {
        switch (priority) {
            case 1: return 'text-destructive';
            case 2: return 'text-warning';
            default: return 'text-muted-foreground';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Projects
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
                            <div className={cn(
                                "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border capitalize",
                                getStatusColor(project.status)
                            )}>
                                {project.status.replace('_', ' ')}
                            </div>
                        </div>
                        {project.description && (
                            <p className="text-muted-foreground max-w-2xl">{project.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                            {project.dueDate && (
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    <span>Due {format(new Date(project.dueDate), 'MMM d, yyyy')}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                <span>Created {format(new Date(project.createdAt || new Date()), 'MMM d, yyyy')}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                                    Delete Project
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <CreateTaskDialog
                            defaultProjectId={projectId}
                            trigger={
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Task
                                </Button>
                            }
                        />
                    </div>
                </div>
            </div>

            {/* Stats / Overview could go here (e.g. progress bar) */}

            {/* Members Section */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Members ({project.members?.length || 0})</h2>
                <div className="flex gap-4">
                    {project.members?.map((member: any) => (
                        <div key={member.userId} className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-card">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-xs">
                                {member.userId.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-medium">User {member.userId.substring(0, 4)}...</p>
                                <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                            </div>
                        </div>
                    ))}
                    {(!project.members || project.members.length === 0) && (
                        <p className="text-sm text-muted-foreground">No members yet.</p>
                    )}
                </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Tasks ({tasks.length})</h2>
                {tasks.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-muted-foreground/30 p-8 text-center text-muted-foreground">
                        No tasks yet. Create one to get started.
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {tasks.map(task => (
                            <div key={task.id} className="group flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-accent/50 transition-all">
                                <div className="flex items-center gap-4">
                                    {task.status === 'done' ? (
                                        <CheckCircle2 className="h-5 w-5 text-success" />
                                    ) : task.status === 'in_progress' ? (
                                        <Clock className="h-5 w-5 text-warning" />
                                    ) : (
                                        <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    )}
                                    <div>
                                        <p className={cn(
                                            "font-medium",
                                            task.status === 'done' && "text-muted-foreground line-through"
                                        )}>
                                            {task.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={cn(
                                                "text-xs font-medium px-1.5 py-0.5 rounded capitalize",
                                                getPriorityColor(task.priority)
                                            )}>
                                                {task.priority === 1 ? 'High' : task.priority === 2 ? 'Medium' : 'Low'} Priority
                                            </span>
                                            {task.dueDate && (
                                                <span className="text-xs text-muted-foreground">
                                                    Due {format(new Date(task.dueDate), 'MMM d')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* Actions could go here */}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

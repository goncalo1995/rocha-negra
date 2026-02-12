import { useNodes } from "@/hooks/useNodes";
import { CreateProjectDialog } from "@/components/nodes/CreateNodeDialog";
import { BentoCard } from "@/components/BentoCard";
import { Button } from "@/components/ui/button";
import { Briefcase, Calendar, CheckCircle2, Circle, Clock, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

export default function Projects() {
    const { nodes, isLoading, error, deleteNode } = useNodes();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-primary bg-primary/10 border-primary/20';
            case 'completed': return 'text-success bg-success/10 border-success/20';
            case 'on_hold': return 'text-warning bg-warning/10 border-warning/20';
            default: return 'text-muted-foreground bg-muted border-border';
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <p className="text-muted-foreground animate-pulse">Loading projects...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
                <div className="rounded-full bg-destructive/10 p-3">
                    <Briefcase className="h-6 w-6 text-destructive" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Failed to load projects</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        There was an error connecting to the server.
                    </p>
                </div>
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Projects</h1>
                    <p className="text-muted-foreground mt-1">Manage your initiatives and goals</p>
                </div>
                <CreateProjectDialog />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nodes.map((node) => (
                    <div
                        key={node.id}
                        className="group relative flex flex-col justify-between rounded-xl border border-border/50 bg-card/50 p-6 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
                    >
                        <div className="mb-4">
                            <div className="flex items-start justify-between mb-2">
                                <div className={cn(
                                    "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border capitalize",
                                    getStatusColor(node.nodeStatus)
                                )}>
                                    {node.nodeStatus.replace('_', ' ')}
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => deleteNode(node.id)} className="text-destructive focus:text-destructive">
                                            Delete Project
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <Link to={`/nodes/${node.id}`} className="block group-hover:text-primary transition-colors">
                                <h3 className="text-xl font-semibold mb-2">{node.name}</h3>
                            </Link>

                            {node.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                    {node.description}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-4 border-t border-border/30">
                            {node.dueDate ? (
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>Due {format(new Date(node.dueDate), 'MMM d, yyyy')}</span>
                                </div>
                            ) : (
                                <span>No due date</span>
                            )}
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                <span>Updated {format(new Date(node.updatedAt || node.createdAt), 'MMM d')}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Empty State / Add New Card */}
                <CreateProjectDialog
                    trigger={
                        <button className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-muted-foreground/30 bg-accent/10 p-6 transition-all hover:bg-accent/20 hover:border-primary/30 h-full min-h-[200px]">
                            <div className="rounded-full bg-background p-3 shadow-sm">
                                <Briefcase className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-foreground">Create New Project</p>
                                <p className="text-sm text-muted-foreground">Start working on something new</p>
                            </div>
                        </button>
                    }
                />
            </div>
        </div>
    );
}

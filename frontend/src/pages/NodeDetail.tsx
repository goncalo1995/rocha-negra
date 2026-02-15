import { useParams, Link, useNavigate } from "react-router-dom";
import { useNode, useNodeMutations } from "@/hooks/useNodes";
import { useTaskMutations } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Plus,
    Link as LinkIcon,
    Trash2,
    Users,
    Edit2,
    Calendar,
    MoreVertical
} from "lucide-react";
import { TaskCard, TaskStatus } from "@/components/tasks/TaskCard";
import { format } from "date-fns";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { ProjectDetailView } from "@/components/nodes/views/ProjectDetailView";
import { AreaDetailView } from "@/components/nodes/views/AreaDetailView";
import { ResourceDetailView } from "@/components/nodes/views/ResourceDetailView";
import { ShareNodeDialog } from "@/components/nodes/ShareNodeDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { NodeDialog } from "@/components/nodes/NodeDialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { MarkdownPreview } from "@/components/ui/markdown-editor";
import { LinkNodeDialog } from "@/components/nodes/LinkNodeDialog";
import { NodeStatus } from "@/types/nodes";

export default function NodeDetail() {
    const { nodeId } = useParams<{ nodeId: string }>();
    const navigate = useNavigate();
    // const queryClient = useQueryClient();

    // This single query gets the node AND its tasks list.
    const { data: node, isLoading: isLoadingNode } = useNode(nodeId);
    const { updateNode, deleteNode, unlinkNode } = useNodeMutations();
    const { updateTask } = useTaskMutations();

    const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [showShareDialog, setShowShareDialog] = useState(false);

    const handleUpdateStatus = (newStatus: any) => {
        updateNode.mutate({ id: node!.id, updates: { status: newStatus } });
    };

    const handleToggleTaskStatus = async (taskToToggle: any) => {
        const newStatus = taskToToggle.status === 'DONE' ? 'TODO' : 'DONE';

        // We just call the mutation and let the backend handle the logic.
        updateTask.mutateAsync({ id: taskToToggle.id, updates: { status: newStatus } }, {
            onSuccess: () => toast.success("Task status updated!"),
            onError: (error) => toast.error(error.message),
        });
    };

    const getStatusColor = (status: NodeStatus) => {
        switch (status) {
            case 'ACTIVE': return 'text-primary bg-primary/10 border-primary/20';
            case 'COMPLETED': return 'text-success bg-success/10 border-success/20';
            case 'ON_HOLD': return 'text-warning bg-warning/10 border-warning/20';
            case 'ARCHIVED': return 'text-muted-foreground bg-muted border-border';
            default: return 'text-muted-foreground bg-muted border-border';
        }
    };

    const handleDelete = () => {
        if (confirm("Are you sure? This action cannot be undone.")) {
            deleteNode.mutate(node!.id, {
                onSuccess: () => navigate("/nodes"), // Navigate away on success
            });
        }
    };

    const handleUnlink = (targetNodeId: string) => {
        unlinkNode.mutate({ sourceId: nodeId!, targetId: targetNodeId });
    };


    if (isLoadingNode) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                    <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-4">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-8 w-32" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <Skeleton className="h-32 rounded-xl" />
                    <Skeleton className="h-32 rounded-xl" />
                    <Skeleton className="h-32 rounded-xl" />
                </div>
                <div className="mt-8 space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    if (!node) {
        return (
            <div className="p-8 text-center border border-dashed rounded-xl">
                <p className="text-muted-foreground">Node not found</p>
                <Button variant="link" asChild className="mt-2">
                    <Link to="/nodes">Back to Dashboard</Link>
                </Button>
            </div>
        );
    }
    return (
        <div className="space-y-6">
            {/* Only show Back to Dashboard if no ancestors (root node) */}
            {(!node.ancestors || node.ancestors.length === 0) && (
                <Link to="/nodes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>
            )}

            <div>
                {/* Breadcrumbs - Now prominent at the top */}
                {node.ancestors && node.ancestors.length > 0 && (
                    <div className="mb-6 px-1">
                        <Breadcrumb className="text-base text-muted-foreground/80">
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/nodes" className="hover:text-primary transition-colors">Dashboard</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                {node.ancestors.filter(a => a.id !== node.id).reverse().map((ancestor) => (
                                    <div key={ancestor.id} className="flex items-center gap-1.5">
                                        <BreadcrumbItem>
                                            <BreadcrumbLink
                                                href={`/nodes/${ancestor.id}`}
                                                className="hover:text-primary transition-colors"
                                            >
                                                {ancestor.name}
                                            </BreadcrumbLink>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator />
                                    </div>
                                ))}
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="font-semibold text-foreground">{node.name}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                )}




                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                            <h1 className="text-3xl font-bold text-foreground truncate">{node.name}</h1>
                            {node.type !== 'RESOURCE' && (
                                <Select value={node.status} onValueChange={handleUpdateStatus}>
                                    <SelectTrigger className={cn(
                                        "w-fit h-7 px-2 text-xs font-semibold capitalize border-none bg-transparent hover:bg-accent/50 transition-colors",
                                        getStatusColor(node.status)
                                    )}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="ON_HOLD">On Hold</SelectItem>
                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                        {node.description && (
                            <div className="mt-2 text-muted-foreground max-w-2xl text-sm leading-relaxed">
                                <MarkdownPreview source={node.description} />
                            </div>
                        )}
                        <div className="flex items-center gap-8 mt-6 text-sm text-muted-foreground border-t border-border/40 pt-6">
                            {node.dueDate && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60">Deadline</span>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5 text-destructive/60" />
                                        <span className="text-xs font-semibold">{format(new Date(node.dueDate), 'MMM d, yyyy')}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60">Updated at</span>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span className="text-xs font-semibold">{format(new Date(node.updatedAt || node.createdAt || new Date()), 'MMM d, yyyy')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <LinkNodeDialog sourceNodeId={node.id} />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Edit {node.type.toLowerCase()}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
                                    <Users className="h-4 w-4 mr-2" />
                                    Share {node.type.toLowerCase()}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete {node.type.toLowerCase()}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <NodeDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                node={node}
            />

            <ShareNodeDialog
                open={showShareDialog}
                onOpenChange={setShowShareDialog}
                node={node}
            />

            {/* Adaptive Content based on Node Type */}
            <div className="mt-8">
                {node.type === 'PROJECT' && <ProjectDetailView node={node} />}
                {node.type === 'AREA' && <AreaDetailView node={node} />}
                {node.type === 'RESOURCE' && <ResourceDetailView node={node} />}
                {node.type === 'GOAL' && (
                    <div className="prose dark:prose-invert max-w-none">
                        <h3>Goal Details</h3>
                        <p>{node.description || "No description provided."}</p>
                    </div>
                )}
                {!['PROJECT', 'AREA', 'RESOURCE', 'GOAL'].includes(node.type) && (
                    <div className="prose dark:prose-invert max-w-none">
                        <h3>Description</h3>
                        <p>{node.description || "No description provided."}</p>
                    </div>
                )}
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Tasks ({node.tasks.length})</h2>
                    <TaskDialog
                        open={isNewTaskDialogOpen}
                        onOpenChange={setIsNewTaskDialogOpen}
                        defaultNodeId={node.id}
                        trigger={
                            <Button size="sm" variant="outline" className="gap-1.5 h-8">
                                <Plus className="h-3.5 w-3.5" />
                                Add Task
                            </Button>
                        }
                    />
                </div>
                {node.tasks.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-muted-foreground/30 p-8 text-center text-muted-foreground">
                        No tasks yet. Create one to get started.
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {node.tasks.map((task, i) => (
                            <TaskCard
                                key={task.id}
                                id={task.id}
                                title={task.title}
                                status={task.status as TaskStatus}
                                priority={task.priority}
                                dueDate={task.dueDate}
                                onToggleStatus={() => handleToggleTaskStatus(task)}
                                delay={i * 0.05}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Links / Resources Section */}
            {
                (node.references && node.references.length > 0) && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Linked Resources</h2>
                        <div className="space-y-1.5">
                            {node.references.map((link) => (
                                <div key={link.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all cursor-pointer group">
                                    <LinkIcon className="h-4 w-4 text-primary" />
                                    <Link to={`/nodes/${link.id}`} className="flex-1 text-sm text-foreground hover:underline">
                                        {link.name}
                                    </Link>
                                    <span className="text-[10px] text-muted-foreground uppercase px-2 py-0.5 rounded bg-muted">
                                        {link.linkType?.replace('_', ' ') || 'REFERENCE'}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleUnlink(link.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }

            {/* Referenced By Section */}
            {
                (node.referencedBy && node.referencedBy.length > 0) && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Referenced By</h2>
                        <div className="space-y-1.5">
                            {node.referencedBy.map((link) => (
                                <div key={link.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all cursor-pointer group">
                                    <LinkIcon className="h-4 w-4 text-muted-foreground scale-x-[-1]" />
                                    <Link to={`/nodes/${link.id}`} className="flex-1 text-sm text-foreground hover:underline">
                                        {link.name}
                                    </Link>
                                    <span className="text-[10px] text-muted-foreground uppercase px-2 py-0.5 rounded bg-muted">
                                        {link.linkType?.replace('_', ' ') || 'REFERENCE'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }

            {/* Stats / Overview could go here (e.g. progress bar) */}

            {/* Stats / Overview could go here (e.g. progress bar) */}
        </div >
    );
}

import { useNodeMutations, useNodes } from "@/hooks/useNodes";
import { NodeDialog } from "@/components/nodes/NodeDialog";
import { Button } from "@/components/ui/button";
import { Briefcase, Calendar, CheckCircle2, Circle, Clock, MoreVertical, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { Node, NodeStatus } from "@/types/nodes";

interface NodesProps {
    type: 'PROJECT' | 'AREA' | 'RESOURCE' | 'ARCHIVE' | 'GOAL';
}

export default function Nodes({ type }: NodesProps) {
    // Only pass type if it's not ARCHIVE (Archive needs special handling or status filter)
    // Actually our backend 'type' param filters by NodeType.
    // If type is 'ARCHIVE', we probably want all types but status=ARCHIVED? 
    // The current backend doesn't seem to have a 'status' filter param for the main list, only 'type' and 'query'.
    // Let's stick to client-side filtering for ARCHIVE for now, but server-side for others.

    // If filtering by ARCHIVE, fetch all (or maybe add metadata later). 
    // If normal type, fetch by type.
    const queryType = type === 'ARCHIVE' ? undefined : type;
    const { data: nodes = [], isLoading, error } = useNodes(queryType);
    const { deleteNode } = useNodeMutations();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingNode, setEditingNode] = useState<Node | null>(null);

    const filteredNodes = useMemo(() => {
        if (type === 'ARCHIVE') {
            return nodes.filter(node => node.status === 'ARCHIVED');
        }
        // If we fetched by type from server, we just need to filter out archived ones
        return nodes.filter(node => node.status !== 'ARCHIVED');
    }, [nodes, type]);

    const handleOpenCreateDialog = () => {
        setEditingNode(null);
        setIsDialogOpen(true);
    };

    const handleOpenEditDialog = (node: Node, e: React.MouseEvent) => {
        e.preventDefault();
        setEditingNode(node);
        setIsDialogOpen(true);
    };

    const handleOpenDeleteDialog = (node: Node, e: React.MouseEvent) => {
        e.preventDefault();
        deleteNode.mutate(node.id);
    };

    const getStatusColor = (status: NodeStatus) => {
        switch (status) {
            case 'ACTIVE': return 'text-primary bg-primary/10 border-primary/20';
            case 'COMPLETED': return 'text-success bg-success/10 border-success/20';
            case 'ON_HOLD': return 'text-warning bg-warning/10 border-warning/20';
            default: return 'text-muted-foreground bg-muted border-border';
        }
    };

    const getTitle = () => {
        switch (type) {
            case 'PROJECT': return 'Projects';
            case 'AREA': return 'Areas';
            case 'RESOURCE': return 'Resources';
            case 'GOAL': return 'Goals';
            case 'ARCHIVE': return 'Archive';
        }
    };

    const getDescription = () => {
        switch (type) {
            case 'PROJECT': return 'Manage your distinct initiatives with deadlines.';
            case 'AREA': return 'Ongoing responsibilities and spheres of activity.';
            case 'RESOURCE': return 'Topics or themes of ongoing interest.';
            case 'GOAL': return 'Specific objectives you want to achieve.';
            case 'ARCHIVE': return 'Completed or archived items.';
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <p className="text-muted-foreground animate-pulse">Loading {getTitle().toLowerCase()}...</p>
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
                    <h3 className="text-lg font-semibold">Failed to load {getTitle().toLowerCase()}</h3>
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
                    <h1 className="text-3xl font-bold text-foreground">{getTitle()}</h1>
                    <p className="text-muted-foreground mt-1">{getDescription()}</p>
                </div>
                {type !== 'ARCHIVE' && (
                    <Button onClick={handleOpenCreateDialog}><Plus /> New {type.charAt(0) + type.slice(1).toLowerCase()}</Button>
                )}
            </div>

            {filteredNodes.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[300px] rounded-xl border border-dashed border-muted-foreground/30 p-8 text-center text-muted-foreground">
                    <p>No {getTitle().toLowerCase()} found.</p>
                    {type !== 'ARCHIVE' && (
                        <Button variant="link" onClick={handleOpenCreateDialog}>Create your first one</Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNodes.map((node) => (
                        <Link to={`/nodes/${node.id}`} className="block group-hover:text-primary transition-colors" key={node.id}>
                            <div
                                className="group relative flex flex-col justify-between rounded-xl border border-border/50 bg-card/50 p-6 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 h-full"
                            >
                                <div className="mb-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className={cn(
                                            "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border capitalize",
                                            getStatusColor(node.status)
                                        )}>
                                            {node.status?.replace('_', ' ') || 'Unknown'}
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => handleOpenEditDialog(node, e)}>
                                                    Edit {type.charAt(0) + type.slice(1).toLowerCase()}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => handleOpenDeleteDialog(node, e)} className="text-destructive focus:text-destructive">
                                                    Delete {type.charAt(0) + type.slice(1).toLowerCase()}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <h3 className="text-xl font-semibold mb-2">{node.name}</h3>

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
                        </Link>
                    ))}
                </div>
            )}

            <NodeDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                node={editingNode}
                defaultType={type === 'ARCHIVE' ? 'PROJECT' : type}
            />
        </div>
    );
}

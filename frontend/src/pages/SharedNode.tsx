import { useParams, Link } from "react-router-dom";
import { useSharedNode } from "@/hooks/useNodeShare";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskCard, TaskStatus } from "@/components/tasks/TaskCard";
import { Calendar, Eye } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { MarkdownPreview } from "@/components/ui/markdown-editor";
import { useMemo } from "react";
import { buildTree } from "@/lib/treeUtils";
import { PublicBlueprintStepItem } from "@/components/blueprint/PublicBlueprintStepItem";

export default function SharedNode() {
    const { token } = useParams<{ token: string }>();
    const { data: node, isLoading, error } = useSharedNode(token);

    // Build tree from flat blueprint steps
    const blueprintTree = useMemo(() => {
        if (!node?.blueprint) return [];
        return buildTree(node.blueprint);
    }, [node?.blueprint]);

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <div className="mt-8 space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    if (error || !node) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
                <h1 className="text-2xl font-bold mb-2">Link not found</h1>
                <p className="text-muted-foreground mb-6">
                    This shared link may have expired, been disabled, or never existed.
                </p>
                <Button asChild variant="outline">
                    <Link to="/">Go to Home</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Banner */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900/30">
                <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-amber-800 dark:text-amber-200">
                        <Eye className="h-3.5 w-3.5" />
                        <span>
                            You're viewing a shared snapshot. Last updated{" "}
                            {node.lastUpdated
                                ? formatDistanceToNow(new Date(node.lastUpdated), { addSuffix: true })
                                : "N/A"}
                        </span>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                        <Link to="/">Sign in</Link>
                    </Button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                            <h1 className="text-3xl font-bold text-foreground truncate">{node.name}</h1>
                            <span className="text-[10px] font-bold bg-muted text-muted-foreground px-1.5 py-0.5 rounded uppercase">
                                {node.type}
                            </span>
                        </div>
                        {node.description && (
                            <div className="mt-2 text-muted-foreground max-w-2xl text-sm leading-relaxed">
                                <h3 className="text-lg font-bold mb-2">{node.description}</h3>
                            </div>
                        )}
                        <div className="flex items-center gap-8 mt-6 text-sm text-muted-foreground border-t border-border/40 pt-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60">Updated at</span>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span className="text-xs font-semibold">
                                        {node.lastUpdated ? format(new Date(node.lastUpdated), 'MMM d, yyyy') : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {node.content && (
                    <div className="mt-2 text-muted-foreground max-w-2xl text-sm leading-relaxed">
                        <h3 className="text-lg font-bold mb-2">Content</h3>
                        <MarkdownPreview source={node.content} />
                    </div>
                )}

                {/* Tasks List (read-only) */}
                {node.tasks && node.tasks.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Tasks ({node.tasks.length})</h2>
                        </div>
                        <div className="grid gap-3">
                            {node.tasks.map((task, i) => (
                                <TaskCard
                                    key={task.id}
                                    id={task.id}
                                    title={task.title}
                                    status={task.status as TaskStatus}
                                    priority={task.priority}
                                    dueDate={task.dueDate}
                                    delay={i * 0.05}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Blueprint Steps (for PROJECT nodes) */}
                {blueprintTree.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Blueprint ({blueprintTree.length} phases)</h2>
                        </div>
                        <div className="space-y-1">
                            {blueprintTree.map((step) => (
                                <PublicBlueprintStepItem key={step.id} step={step} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty state if no content */}
                {(!node.tasks || node.tasks.length === 0) && (!node.blueprint || node.blueprint.length === 0) && (
                    <div className="rounded-xl border border-dashed border-muted-foreground/30 p-8 text-center text-muted-foreground">
                        No tasks or blueprint steps in this {node.type.toLowerCase()}.
                    </div>
                )}
            </div>
        </div>
    );
}

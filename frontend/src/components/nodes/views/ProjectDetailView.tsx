import { Node as AppNode } from "@/types/nodes";
import { format } from "date-fns";
import { Calendar, CheckCircle2, Circle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks } from "@/hooks/useTasks";
import { NodeContentEditor } from "@/components/nodes/NodeContentEditor";
// If useTasks doesn't exist or is different, we might need to adjust.
// For now, let's assume we can pass tasks or fetch them.
// Actually, NodeDetail.tsx fetches the node, which might include tasks or we fetch them there.
// Let's assume NodeDetail passes the node and we might fetch tasks if not in node.

interface ProjectDetailViewProps {
    node: AppNode;
}

export function ProjectDetailView({ node }: ProjectDetailViewProps) {
    const { data: tasks, isLoading: isLoadingTasks } = useTasks({ nodeId: node.id });

    const completedTasks = tasks?.filter(t => t.status === 'DONE').length || 0;
    const totalTasks = tasks?.length || 0;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;


    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round(progress)}%</div>
                        <Progress value={progress} className="mt-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                            {completedTasks} of {totalTasks} tasks completed
                        </p>
                    </CardContent>
                </Card>

                {/* <Card className="relative overflow-hidden group/card">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Status & Deadline</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary capitalize">
                                {node.status?.replace('_', ' ').toLowerCase()}
                            </div>
                            {node.dueDate && (
                                <div className="flex items-center gap-1.5 text-sm font-semibold">
                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span>{format(new Date(node.dueDate), 'MMM d, yyyy')}</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60">Timeline</p>
                            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    <span>Updated {format(new Date(node.updatedAt || node.createdAt), 'MMM d, yyyy')}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card> */}
            </div>

            {/* Project Notes Editor */}
            <div className="prose dark:prose-invert max-w-none">
                <h3>Project Notes</h3>
                <NodeContentEditor
                    nodeId={node.id}
                    initialContent={node.content || ''}
                    placeholder="Add project notes, goals, and details here..."
                />
            </div>
        </div>
    );
}

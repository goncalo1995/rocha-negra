import { Node as AppNode } from "@/types/nodes";
import { format } from "date-fns";
import { BookOpen, Link as LinkIcon, FileText, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NodeContentEditor } from "@/components/nodes/NodeContentEditor";

interface ResourceDetailViewProps {
    node: AppNode;
}

export function ResourceDetailView({ node }: ResourceDetailViewProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>Resource</span>
                </div>
                <div>•</div>
                <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Captured {format(new Date(node.createdAt), 'MMM d, yyyy')}</span>
                </div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
                <NodeContentEditor
                    nodeId={node.id}
                    initialContent={node.content || ''}
                    placeholder="Capture knowledge, links, and summaries..."
                />
            </div>
        </div>
    );
}



import { Node as AppNode } from "@/types/nodes";
import { NodeContentEditor } from "@/components/nodes/NodeContentEditor";

interface AreaDetailViewProps {
    node: AppNode;
}

export function AreaDetailView({ node }: AreaDetailViewProps) {
    return (
        <div className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
                <h3>Content</h3>
                <NodeContentEditor
                    nodeId={node.id}
                    initialContent={node.content || ''}
                    placeholder="Define responsibilities and standard operating procedures..."
                />
            </div>
        </div>
    );
}

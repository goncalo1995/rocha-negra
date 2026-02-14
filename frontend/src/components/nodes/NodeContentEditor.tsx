import { useState, useEffect } from "react";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { useNodeMutations } from "@/hooks/useNodes";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface NodeContentEditorProps {
    nodeId: string;
    initialContent: string;
    placeholder?: string;
    minHeight?: number;
}

export function NodeContentEditor({ nodeId, initialContent, placeholder, minHeight = 200 }: NodeContentEditorProps) {
    const [content, setContent] = useState(initialContent);
    const [isDirty, setIsDirty] = useState(false);
    const { updateNode } = useNodeMutations();

    useEffect(() => {
        setContent(initialContent || "");
        setIsDirty(false);
    }, [initialContent]);

    const handleChange = (value?: string) => {
        setContent(value || "");
        setIsDirty(true);
    };

    const handleSave = () => {
        updateNode.mutate(
            { id: nodeId, updates: { content } },
            {
                onSuccess: () => {
                    toast.success("Content saved");
                    setIsDirty(false);
                },
                onError: (error) => {
                    toast.error("Failed to save content: " + error.message);
                }
            }
        );
    };

    return (
        <div className={cn("space-y-2 relative group", isDirty && "pb-10")}>
            {/* Added padding bottom to accommodate save button not overlapping content if we float it, 
               but here we just stack it. */}
            <MarkdownEditor
                value={content}
                onChange={handleChange}
                height={Math.max(minHeight, 200)}
            // We can't easily auto-grow this specific component without complex logic, 
            // but setting a reasonable default height helps.
            // If the user wants to expand, the editor usually has a fullscreen option or dragger.
            />
            {isDirty && (
                <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 sticky bottom-2 z-10">
                    <Button onClick={handleSave} size="sm" className="gap-2 shadow-lg">
                        <Save className="h-4 w-4" />
                        Save Changes
                    </Button>
                </div>
            )}
        </div>
    );
}

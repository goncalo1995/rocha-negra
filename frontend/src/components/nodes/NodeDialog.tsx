import { useEffect, useState } from "react";
import { useNodeMutations } from "@/hooks/useNodes";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Node, NodeCreate, NodeType, NodeUpdate } from "@/types/nodes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface NodeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    node?: Node | null; // Pass the node to edit
    defaultType?: NodeType; // To pre-select a type
    defaultParentId?: string | null;
    trigger?: React.ReactNode;
}

export function NodeDialog({ open, onOpenChange, node, defaultType, defaultParentId, trigger }: NodeDialogProps) {
    const { createNode, updateNode } = useNodeMutations();
    const [isLoading, setIsLoading] = useState(false);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<NodeType>(defaultType);
    const [dueDate, setDueDate] = useState("");

    const isEditing = !!node;

    // Effect to populate the form when a 'node' to edit is provided
    useEffect(() => {
        if (open) {
            if (isEditing) {
                setName(node.name);
                setDescription(node.description || "");
                setType(node.type);
                setDueDate(node.dueDate ? node.dueDate.split('T')[0] : "");
            } else {
                // Reset for a new node
                setName("");
                setDescription("");
                setType(defaultType);
                setDueDate("");
            }
        }
    }, [open, node, isEditing, defaultType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isEditing) {
                const updates: NodeUpdate = {
                    name,
                    description,
                    dueDate: dueDate || null,
                };
                updateNode({ id: node.id, updates });
            } else {
                const payload: NodeCreate = {
                    name,
                    description,
                    type,
                    parentId: defaultParentId,
                    dueDate: dueDate || null,
                };
                createNode(payload);
            }
        } catch (error) {
            console.error(error);
            toast.error(isEditing ? "Failed to update node" : "Failed to create node");
        } finally {
            setIsLoading(false);
        }

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Project
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>{isEditing ? 'Edit Node' : 'Create New Node'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? `Editing "${node.name}"` : `Creating a new ${type.toLowerCase()}.`}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                    <ScrollArea className="flex-1 p-6 pt-2">
                        <div className="space-y-4 py-2 px-1">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Node Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="What is this node about?"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dueDate">Due Date</Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>
                            {/* You could add a Select here to change the 'type' if you're NOT editing */}
                            {!isEditing && (
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select
                                        value={type}
                                        onValueChange={(value) => setType(value as NodeType)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PROJECT">Project</SelectItem>
                                            <SelectItem value="TASK">Task</SelectItem>
                                            <SelectItem value="NOTE">Note</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                        </div>
                    </ScrollArea>
                    <div className="flex justify-end gap-2 p-6 pt-2 border-t mt-auto">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && !isEditing ? "Creating..." :
                                isLoading && isEditing ? "Saving..." :
                                    isEditing ? "Save Changes" : "Create Project"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

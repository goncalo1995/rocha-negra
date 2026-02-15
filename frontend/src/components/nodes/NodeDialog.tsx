import { useEffect, useState } from "react";
import { useNodeMutations, useNodes } from "@/hooks/useNodes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Node, NodeCreate, NodeStatus, NodeType, NodeUpdate } from "@/types/nodes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface NodeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    node?: Node | null; // Pass the node to edit
    defaultType?: NodeType; // To pre-select a type
    defaultParentId?: string | null;
}

export function NodeDialog({ open, onOpenChange, node, defaultType, defaultParentId }: NodeDialogProps) {
    const { createNode, updateNode } = useNodeMutations();
    const [isLoading, setIsLoading] = useState(false);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<NodeType>(defaultType);
    const [status, setStatus] = useState<NodeStatus>("ACTIVE");
    const [dueDate, setDueDate] = useState("");
    const [parentId, setParentId] = useState<string | null>(defaultParentId || null);
    const [openCombobox, setOpenCombobox] = useState(false);

    // Fetch all nodes for the parent selector
    const { data: nodes } = useNodes();

    const isEditing = !!node;

    // Effect to populate the form when a 'node' to edit is provided
    useEffect(() => {
        if (open) {
            if (isEditing) {
                setName(node.name);
                setDescription(node.description || "");
                setType(node.type);
                setStatus(node.status);
                setDueDate(node.dueDate ? node.dueDate.split('T')[0] : "");
                setParentId(node.parentId || null);
            } else {
                // Reset for a new node
                setName("");
                setDescription("");
                setType(defaultType);
                setStatus("ACTIVE");
                setStatus("ACTIVE");
                setDueDate("");
                setParentId(defaultParentId || null);
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
                    status,
                    dueDate: dueDate || null,
                    parentId: parentId,
                };
                updateNode.mutate({ id: node.id, updates });
            } else {
                const payload: NodeCreate = {
                    name,
                    description,
                    type,
                    parentId: parentId, // Use state
                    dueDate: dueDate || null,
                    status,
                };
                createNode.mutate(payload);
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

                            {/* Parent Selection (Combobox) */}
                            <div className="space-y-2 flex flex-col">
                                <Label htmlFor="parent">Parent Node (Optional)</Label>
                                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openCombobox}
                                            className="w-full justify-between"
                                        >
                                            {parentId
                                                ? nodes?.find((n) => n.id === parentId)?.name || "Select parent..."
                                                : "Select parent..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search parent node..." />
                                            <CommandList>
                                                <CommandEmpty>No node found.</CommandEmpty>
                                                <CommandGroup>
                                                    <CommandItem
                                                        value="none"
                                                        onSelect={() => {
                                                            setParentId(null);
                                                            setOpenCombobox(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                parentId === null ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        None (Top Level)
                                                    </CommandItem>
                                                    {nodes
                                                        ?.filter(n => n.id !== node?.id) // Prevent self-parenting
                                                        .map((n) => (
                                                            <CommandItem
                                                                key={n.id}
                                                                value={n.name + " " + n.id} // Hack to search by name but key by ID effectively
                                                                onSelect={() => {
                                                                    setParentId(n.id === parentId ? null : n.id);
                                                                    setOpenCombobox(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        parentId === n.id ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                <span className="truncate flex-1">{n.name}</span>
                                                                <span className="ml-2 text-xs text-muted-foreground capitalize">{n.type.toLowerCase()}</span>
                                                            </CommandItem>
                                                        ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <p className="text-[0.8rem] text-muted-foreground">
                                    Assign this to a Project or Area to create a hierarchy.
                                </p>
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
                                            <SelectItem value="AREA">Area</SelectItem>
                                            <SelectItem value="RESOURCE">Resource</SelectItem>
                                            <SelectItem value="GOAL">Goal</SelectItem>
                                            <SelectItem value="TASK">Task</SelectItem>
                                            <SelectItem value="NOTE">Note</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={status}
                                    onValueChange={(value) => setStatus(value as NodeStatus)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                        <SelectItem value="ON_HOLD">On Hold</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
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

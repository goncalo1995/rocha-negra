import { useEffect, useState } from "react";
import { useTaskMutations } from "@/hooks/useTasks";
import { useNodes } from "@/hooks/useNodes";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Task, TaskCreate, TaskUpdate } from "@/types/tasks";
import { Plus } from "lucide-react";

interface TaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task?: Task | null; // Pass the task to edit
    defaultNodeId?: string | null;
    defaultParentId?: string | null;
    trigger?: React.ReactNode;
}

export function TaskDialog({ open, onOpenChange, task, defaultNodeId, defaultParentId, trigger }: TaskDialogProps) {
    const isEditing = !!task;
    const { createTask, updateTask } = useTaskMutations();
    const { data: nodes = [] } = useNodes();

    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "2", // Medium
        position: task?.position?.toString() || "0",
        nodeId: defaultNodeId || "inbox",
        dueDate: "",
    });

    useEffect(() => {
        if (open) {
            if (isEditing) {
                // Populate form for editing
                setFormData({
                    title: task?.title || "",
                    description: task?.description || "",
                    priority: task?.priority?.toString() || "2",
                    position: task?.position?.toString() || "0",
                    nodeId: task?.nodeId || "inbox",
                    dueDate: task?.dueDate || "",
                });
            } else {
                // Reset form for creating, using defaults
                setFormData(prev => ({ ...prev, nodeId: defaultNodeId || "inbox" }));
            }
        }
    }, [open, task, isEditing, defaultNodeId]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isEditing) {
                const updates: TaskUpdate = {
                    title: formData.title,
                    description: formData.description || undefined,
                    priority: parseInt(formData.priority),
                    nodeId: formData.nodeId !== "inbox" ? formData.nodeId : undefined,
                    parentId: defaultParentId,
                    dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
                    status: 'TODO',
                };
                updateTask.mutate({ id: task.id, updates });
            } else {
                const payload: TaskCreate = {
                    title: formData.title,
                    description: formData.description || undefined,
                    priority: parseInt(formData.priority),
                    nodeId: formData.nodeId !== "inbox" ? formData.nodeId : undefined,
                    parentId: defaultParentId,
                    dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
                    status: 'TODO',
                };
                createTask.mutate(payload);
            }
            onOpenChange(false);

            toast({
                title: isEditing ? "Task updated successfully" : "Task created successfully",
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Failed to create task",
                description: "Please try again.",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Task
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>{isEditing ? "Edit Task" : "Create New Task"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                    <ScrollArea className="flex-1 p-4 pt-2">
                        <div className="space-y-4 py-2 px-1">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    placeholder="Task title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="project">Project</Label>
                                    <Select
                                        value={formData.nodeId}
                                        onValueChange={(val) => setFormData({ ...formData, nodeId: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select project" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="inbox">Inbox (Personal)</SelectItem>
                                            {nodes.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select
                                        value={formData.priority}
                                        onValueChange={(val) => setFormData({ ...formData, priority: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">High</SelectItem>
                                            <SelectItem value="2">Medium</SelectItem>
                                            <SelectItem value="3">Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="position">Position (Order)</Label>
                                    <Input
                                        id="position"
                                        type="number"
                                        value={formData.position}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dueDate">Due Date</Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Additional details..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </ScrollArea>
                    <div className="flex justify-end gap-2 p-6 pt-2 border-t mt-auto">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createTask.isPending || updateTask.isPending}>
                            {isLoading ? "Creating..." : "Create Task"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

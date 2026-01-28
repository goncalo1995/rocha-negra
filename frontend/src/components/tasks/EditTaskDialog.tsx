import { useState, useEffect } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
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
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Task } from "@/types/tasks";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface EditTaskDialogProps {
    task: Task;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function EditTaskDialog({ task, trigger, open: controlledOpen, onOpenChange }: EditTaskDialogProps) {
    const { updateTask } = useTasks();
    const { projects } = useProjects();
    const [internalOpen, setInternalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? onOpenChange! : setInternalOpen;

    const [formData, setFormData] = useState({
        title: task.title,
        description: task.description || "",
        priority: task.priority.toString(),
        projectId: task.projectId || "inbox",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
        position: task.position?.toString() || "0",
    });

    // Update form data when task changes
    useEffect(() => {
        setFormData({
            title: task.title,
            description: task.description || "",
            priority: task.priority.toString(),
            projectId: task.projectId || "inbox",
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
            position: task.position?.toString() || "0",
        });
    }, [task]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await updateTask(task.id, {
                title: formData.title,
                description: formData.description || undefined,
                priority: parseInt(formData.priority),
                projectId: formData.projectId === "inbox" ? null : formData.projectId, // Handle clearing project
                dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
                position: parseInt(formData.position),
            });
            toast.success("Task updated successfully");
            setOpen(false);
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.message || "Failed to update task";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && (
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="project">Project</Label>
                            <Select
                                value={formData.projectId}
                                onValueChange={(val) => setFormData({ ...formData, projectId: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select project" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="inbox">Inbox (Personal)</SelectItem>
                                    {projects.map(p => (
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Additional details..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

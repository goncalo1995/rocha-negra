import { BentoCard } from "@/components/BentoCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DashboardResponseDto } from "@/types/dashboard";
import { Circle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface TasksWidgetProps {
    data: DashboardResponseDto['tasks'];
}

export function TasksWidget({ data }: TasksWidgetProps) {
    if (!data) return null;

    const activeTasks = data.recentTasks || [];

    const getPriorityColor = (priority: number) => {
        switch (priority) {
            case 1: return 'text-destructive'; // High
            case 2: return 'text-warning'; // Medium
            default: return 'text-muted-foreground'; // Low
        }
    };

    const getPriorityLabel = (priority: number) => {
        switch (priority) {
            case 1: return 'High';
            case 2: return 'Medium';
            case 3: return 'Low';
            default: return 'Normal';
        }
    }

    return (
        <BentoCard
            title="Active Tasks"
            subtitle={`${activeTasks.length} items need attention`}
            className="lg:col-span-2"
            headerAction={
                <Link to="/tasks">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        View all
                    </Button>
                </Link>
            }
        >
            <div className="space-y-3">
                {activeTasks.slice(0, 4).map((task) => (
                    <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                    >
                        {task.status === 'IN_PROGRESS' ? (
                            <Clock className="h-4 w-4 text-warning shrink-0" />
                        ) : (
                            <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                            <p className="text-xs text-muted-foreground">
                                {task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}
                            </p>
                        </div>
                        <span className={cn("text-xs font-medium capitalize", getPriorityColor(task.priority))}>
                            {getPriorityLabel(task.priority)}
                        </span>
                    </div>
                ))}
                {activeTasks.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No active tasks.</p>
                )}
            </div>
        </BentoCard>
    );
}

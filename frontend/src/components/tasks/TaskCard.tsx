import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, MoreVertical, Calendar, Hourglass, Cloud, Check } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'WAITING' | 'SOMEDAY';

interface TaskCardProps {
    id: string;
    title: string;
    status: TaskStatus;
    priority: number;
    dueDate?: string | Date;
    project?: string;
    projectColor?: string;
    onToggleStatus?: (id: string, nextStatus: TaskStatus) => void;
    delay?: number;
    subtasksCount?: number;
}

const getPriorityColor = (priority: number) => {
    switch (priority) {
        case 1: return "text-destructive bg-destructive/10 border-destructive/20";
        case 2: return "text-warning bg-warning/10 border-warning/20";
        case 3: return "text-primary bg-primary/10 border-primary/20";
        default: return "text-muted-foreground bg-muted border-border/50";
    }
};

const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
        case 'DONE': return <CheckCircle2 className="h-5 w-5 text-success" />;
        case 'IN_PROGRESS': return <Clock className="h-5 w-5 text-warning" />;
        case 'WAITING': return <Hourglass className="h-5 w-5 text-orange-500" />;
        case 'SOMEDAY': return <Cloud className="h-5 w-5 text-purple-500" />;
        default: return <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary" />;
    }
};

export const TaskCard = ({
    id,
    title,
    status,
    priority,
    dueDate,
    project,
    projectColor,
    onToggleStatus,
    delay = 0,
    subtasksCount
}: TaskCardProps) => {
    const isDone = status === 'DONE';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.3 }}
            className="group relative flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-accent/50 hover:border-border transition-all duration-300"
        >
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        const nextStatus = status === 'DONE' ? 'TODO' : 'DONE';
                        onToggleStatus?.(id, nextStatus as TaskStatus);
                    }}
                    className="focus:outline-none transition-transform active:scale-90"
                >
                    {getStatusIcon(status)}
                </button>

                <Link to={`/tasks/${id}`} className="flex-1 min-w-0">
                    <p className={cn(
                        "font-medium transition-all truncate",
                        isDone ? "text-muted-foreground line-through opacity-60" : "text-foreground group-hover:text-primary"
                    )}>
                        {title}
                    </p>

                    <div className="flex items-center gap-3 mt-1.5">
                        <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                            getPriorityColor(priority)
                        )}>
                            {priority === 1 ? 'High' : priority === 2 ? 'Medium' : 'Low'}
                        </span>

                        {dueDate && (
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(dueDate), 'MMM d')}
                            </span>
                        )}

                        {project && (
                            <span className="flex items-center gap-1.5">
                                <div className={cn("w-1.5 h-1.5 rounded-full", projectColor || "bg-primary")} />
                                <span className="text-[11px] text-muted-foreground font-medium truncate max-w-[120px]">
                                    {project}
                                </span>
                            </span>
                        )}

                        {subtasksCount !== undefined && subtasksCount > 0 && (
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                                <CheckCircle2 className="w-3 h-3" />
                                {subtasksCount} {subtasksCount === 1 ? 'subtask' : 'subtasks'}
                            </span>
                        )}
                    </div>
                </Link>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="p-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all rounded-lg hover:bg-white/5">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onToggleStatus?.(id, 'TODO')}>
                        <Circle className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Move to Todo</span>
                        {status === 'TODO' && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleStatus?.(id, 'IN_PROGRESS')}>
                        <Clock className="mr-2 h-4 w-4 text-warning" />
                        <span>Mark In Progress</span>
                        {status === 'IN_PROGRESS' && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleStatus?.(id, 'WAITING')}>
                        <Hourglass className="mr-2 h-4 w-4 text-orange-500" />
                        <span>Wait for...</span>
                        {status === 'WAITING' && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleStatus?.(id, 'SOMEDAY')}>
                        <Cloud className="mr-2 h-4 w-4 text-purple-500" />
                        <span>Someday/Maybe</span>
                        {status === 'SOMEDAY' && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleStatus?.(id, 'DONE')} className="text-success focus:text-success">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        <span>Complete Task</span>
                        {status === 'DONE' && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </motion.div>
    );
};

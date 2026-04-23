// components/PublicBlueprintStep.tsx
import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, Clock, Circle, AlertCircle, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskStatus } from "@/types/tasks";

interface PublicBlueprintStepItemProps {
    step: {
        id: string;
        title: string;
        description: string | null;
        status: string;
        position: number;
        children: PublicBlueprintStepItemProps["step"][];
    };
    depth?: number;
}

const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
        case 'DONE': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
        case 'IN_PROGRESS': return <Clock className="h-4 w-4 text-blue-400" />;
        case 'WAITING': return <AlertCircle className="h-4 w-4 text-red-400" />;
        case 'SOMEDAY': return <Circle className="h-4 w-4 text-yellow-400" />;
        default: return <Circle className="h-4 w-4 text-white/20" />;
    }
};

export function PublicBlueprintStepItem({ step, depth = 0 }: PublicBlueprintStepItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showDescription, setShowDescription] = useState(false);
    const hasChildren = step.children && step.children.length > 0;
    const hasDescription = step.description && step.description.trim().length > 0;

    // Toggle expansion - called when clicking the main row
    const toggleExpand = () => {
        if (hasChildren) {
            setIsExpanded(!isExpanded);
        }
    };
    
    // Stop propagation for description button so it doesn't trigger expansion
    const handleDescriptionClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDescription(!showDescription);
    };
    
    return (
        <div className="mb-2">
            {/* Main row */}
            <div 
                className={cn(
                    "group rounded-lg border transition-all duration-200",
                    "border-white/10 bg-white/[0.02]",
                    hasChildren && "cursor-pointer hover:border-white/20 hover:bg-white/[0.04]",
                    !hasChildren && "cursor-default"
                )}
                style={{ marginLeft: `${Math.min(depth * 20, 60)}px` }}
                onClick={hasChildren? toggleExpand : handleDescriptionClick}
            >
                {/* Header row */}
                <div className="flex items-center gap-2 p-3">
                    {/* Expand/collapse chevron */}
                    <div className={cn(
                        "flex items-center justify-center w-5 h-5 rounded transition-colors",
                        hasChildren && "group-hover:bg-white/10"
                    )}>
                        {hasChildren && (
                            isExpanded ? 
                                <ChevronDown className="h-3.5 w-3.5 text-white/50" /> : 
                                <ChevronRight className="h-3.5 w-3.5 text-white/50" />
                        )}
                    </div>

                    {/* Status icon */}
                    <div className="shrink-0">
                        {getStatusIcon(step.status as TaskStatus)}
                    </div>

                    {/* Title */}
                    <span className={cn(
                        "text-sm flex-1 font-medium break-words",
                        step.status === 'DONE' ? "text-white/40 line-through" : "text-white/80"
                    )}>
                        {step.title}
                    </span>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                        {hasDescription && (
                            <button
                                onClick={handleDescriptionClick}
                                className={cn(
                                    "p-1.5 rounded-md transition-all",
                                    showDescription 
                                        ? "bg-white/10 text-white/80" 
                                        : "hover:bg-white/5 text-white/40"
                                )}
                                title={showDescription ? "Hide details" : "Show details"}
                            >
                                {showDescription ? 
                                    <X className="h-3.5 w-3.5" /> : 
                                    <FileText className="h-3.5 w-3.5" />
                                }
                            </button>
                        )}
                    </div>
                </div>

                {/* Description section - slides in elegantly */}
                {hasDescription && showDescription && (
                    <div 
                        className="px-2 pb-3 pt-0 border-t border-white/5 mx-3"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mt-2 p-3 rounded-lg bg-white/[0.01] border border-white/5">
                            <div className="flex items-start gap-2">
                                <div className="w-0.5 h-4 bg-gradient-to-b from-white/40 to-transparent rounded-full mt-1" />
                                <div className="flex-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1 block">
                                        Details
                                    </span>
                                    <div className="text-xs text-white/60 leading-relaxed">
                                        {step.description}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Children section - nested with visual connection line */}
            {isExpanded && hasChildren && (
                <div className="relative mt-1">
                    {/* Vertical connection line for visual hierarchy */}
                    {depth < 3 && (
                        <div 
                            className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-white/10 to-transparent"
                            style={{ left: `${Math.min(depth * 20 + 10, 30)}px` }}
                        />
                    )}
                    <div className="space-y-1">
                        {step.children.map((child) => (
                            <PublicBlueprintStepItem 
                                key={child.id} 
                                step={child} 
                                depth={depth + 1} 
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
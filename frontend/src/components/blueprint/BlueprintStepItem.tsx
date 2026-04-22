import React from 'react';
import { useSortable } from '@dnd-kit/react/sortable';
import { BlueprintStep } from '../../types/blueprint';
import { cn } from '@/lib/utils';
import { 
    ChevronRight, 
    ChevronDown, 
    GripVertical, 
    Circle, 
    CheckCircle2, 
    Clock, 
    AlertCircle,
    Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskStatus } from '@/types/tasks';

interface BlueprintStepItemProps {
    step: BlueprintStep;
    depth: number;
    index: number;
    group?: string;
    isSelected: boolean;
    onSelect: (step: BlueprintStep) => void;
    onToggleExpand: (stepId: string) => void;
    isExpanded: boolean;
    expandedIds: Set<string>;
    selectedStepId: string | null;
    onAddChild: (parentId: string) => void;
}

export const BlueprintStepItem: React.FC<BlueprintStepItemProps> = ({ 
    step, 
    depth,
    index,
    group,
    isSelected, 
    onSelect, 
    onToggleExpand, 
    isExpanded,
    expandedIds,
    selectedStepId,
    onAddChild
}) => {
    const { ref, handleRef, isDragging } = useSortable({ 
        id: step.id,
        index,
        group,
    });

    const getStatusIcon = (status: TaskStatus) => {
        switch (status) {
            case 'DONE': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case 'IN_PROGRESS': return <Clock className="h-4 w-4 text-blue-400" />;
            case 'WAITING': return <AlertCircle className="h-4 w-4 text-red-400" />;
            case 'SOMEDAY': return <Circle className="h-4 w-4 text-yellow-400" />;
            default: return <Circle className="h-4 w-4 text-white/20" />;
        }
    };

    return (
        <div 
            ref={ref}
            style={{ marginLeft: `${depth * 20}px` }}
            className={cn(
                "group relative flex flex-col mb-1 transition-all rounded-lg",
                isDragging ? "opacity-30 z-10" : "opacity-100 z-[1]"
            )}
        >
            <div 
                onClick={() => onSelect(step)}
                className={cn(
                    "flex items-center gap-3 p-2 rounded-lg cursor-pointer border border-transparent group/row",
                    isSelected ? "bg-white/[0.08] border-white/10 shadow-lg" : "hover:bg-white/[0.03]"
                )}
            >
                <div 
                    ref={handleRef}
                    className="cursor-grab hover:text-white/60 text-white/20 p-1 rounded hover:bg-white/5"
                >
                    <GripVertical className="h-4 w-4" />
                </div>

                <div 
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleExpand(step.id);
                    }}
                    className={cn(
                        "p-1 rounded hover:bg-white/5 transition-colors",
                        step.children.length === 0 ? "opacity-0 pointer-events-none" : "opacity-100"
                    )}
                >
                    {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-white/40" /> : <ChevronRight className="h-3.5 w-3.5 text-white/40" />}
                </div>

                <div className="shrink-0">
                    {getStatusIcon(step.status)}
                </div>

                <span className={cn(
                    "text-sm flex-1 truncate font-medium",
                    step.status === 'DONE' ? "text-white/40 line-through" : "text-white/80"
                )}>
                    {step.title}
                </span>

                <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover/row:opacity-100 h-6 w-6 rounded-full hover:bg-white/10 transition-all"
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddChild(step.id);
                    }}
                >
                    <Plus className="h-3 w-3" />
                </Button>
            </div>

            {isExpanded && step.children.length > 0 && (
                <div className="mt-1">
                    {step.children.map((child, childIndex) => (
                        <BlueprintStepItem 
                            key={child.id}
                            step={child}
                            depth={depth + 1}
                            index={childIndex}
                            group={step.id}
                            isSelected={selectedStepId === child.id}
                            onSelect={onSelect}
                            onToggleExpand={onToggleExpand}
                            isExpanded={expandedIds.has(child.id)}
                            expandedIds={expandedIds}
                            selectedStepId={selectedStepId}
                            onAddChild={onAddChild}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

import React, { useState, useMemo, useCallback } from 'react';
import { DragDropProvider } from '@dnd-kit/react';

import { useBlueprint, useBlueprintMutations } from '@/hooks/useBlueprint';
import { useNodes } from '@/hooks/useNodes';
import { BlueprintStep } from '@/types/blueprint';
import { BlueprintStepItem } from './BlueprintStepItem';
import { StepInspectorPanel } from './StepInspectorPanel';
import { AiPlanGenerateModal } from './AiPlanGenerateModal';
import { 
    ResizableHandle, 
    ResizablePanel, 
    ResizablePanelGroup 
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
    Layers, 
    Plus, 
    Sparkles, 
    Search,
    Loader2
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { FullNode } from '@/types/nodes';

interface BlueprintEditorProps {
    nodeId: string;
    parentNode?: FullNode;
}

export const BlueprintEditor: React.FC<BlueprintEditorProps> = ({ nodeId, parentNode }) => {
    const { blueprint = [], isLoading } = useBlueprint(nodeId);
    const { 
        createStep, 
        updateStep, 
        deleteStep, 
        reorderSteps, 
        generatePlan,
        analyzeStep 
    } = useBlueprintMutations(nodeId);
    const { data: allNodes = [] } = useNodes();

    const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [analysisResults, setAnalysisResults] = useState<Record<string, string>>({});
    const [isAnalyzing, setIsAnalyzing] = useState<Record<string, boolean>>({});

    const selectedStep = useMemo(() => {
        // Now blueprint is already a tree, but we need to search recursively
        const findStep = (steps: BlueprintStep[]): BlueprintStep | undefined => {
            for (const s of steps) {
                if (s.id === selectedStepId) return s;
                if (s.children) {
                    const found = findStep(s.children);
                    if (found) return found;
                }
            }
            return undefined;
        };
        return findStep(blueprint);
    }, [blueprint, selectedStepId]);

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleDragEnd = useCallback((event: any) => {
        const { source, target } = event.operation;
        if (!source || !target || source.id === target.id) return;

        // Find the siblings array containing the dragged item
        const findSiblings = (steps: BlueprintStep[], targetId: string): BlueprintStep[] | null => {
            if (steps.some(s => s.id === targetId)) return steps;
            for (const s of steps) {
                if (s.children) {
                    const result = findSiblings(s.children, targetId);
                    if (result) return result;
                }
            }
            return null;
        };

        const siblings = findSiblings(blueprint, source.id as string);
        if (!siblings) return;

        const oldIndex = siblings.findIndex(s => s.id === source.id);
        const newIndex = siblings.findIndex(s => s.id === target.id);
        if (oldIndex === -1 || newIndex === -1) return;

        // Build new order
        const reordered = [...siblings];
        const [moved] = reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, moved);

        const parentId = reordered[0]?.parentId ?? null;

        reorderSteps.mutate({ 
            parentId, 
            orderedStepIds: reordered.map(s => s.id) 
        });
    }, [blueprint, reorderSteps]);

    const handleAnalyze = async (stepId: string) => {
        setIsAnalyzing(prev => ({ ...prev, [stepId]: true }));
        try {
            const result = await analyzeStep.mutateAsync(stepId);
            setAnalysisResults(prev => ({ ...prev, [stepId]: result.analysis }));
        } finally {
            setIsAnalyzing(prev => ({ ...prev, [stepId]: false }));
        }
    };

    if (isLoading) {
        return (
            <div className="h-full flex flex-col p-8 space-y-4">
                <Skeleton className="h-8 w-1/4 bg-white/5" />
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full bg-white/5" />
                    <Skeleton className="h-12 w-full bg-white/5" />
                    <Skeleton className="h-12 w-3/4 bg-white/5" />
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-200px)] border border-white/10 rounded-2xl overflow-hidden bg-[#0D0D0D] flex flex-col">
            <ResizablePanelGroup direction="horizontal" className="flex-1">
                <ResizablePanel defaultSize={60} minSize={40}>
                    <div className="h-full flex flex-col border-r border-white/10">
                        {/* Toolbar */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-2 text-white/40">
                                <Layers className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Blueprint Outliner</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setIsAiModalOpen(true)}
                                    className="h-8 rounded-full border-purple-500/30 bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 gap-2 px-4 transition-all"
                                >
                                    <Sparkles className="h-3.5 w-3.5" />
                                    <span className="text-[10px] font-bold uppercase">Generate with AI</span>
                                </Button>
                                <div className="w-px h-4 bg-white/10 mx-1" />
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-full hover:bg-white/10"
                                    onClick={() => createStep.mutate({ title: "New Phase", status: 'TODO' })}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <ScrollArea className="flex-1">
                            {generatePlan.isPending ? (
                                <div className="p-8 space-y-6">
                                     <div className="flex items-center gap-3 animate-pulse">
                                         <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                                         <span className="text-xs text-white/40 font-bold uppercase tracking-widest">AI is architecting your plan...</span>
                                     </div>
                                     {[1,2,3,4].map(i => (
                                         <div key={i} className="flex items-center gap-4">
                                             <Skeleton className="h-8 w-8 rounded-full bg-white/5" />
                                             <Skeleton className="h-8 flex-1 bg-white/5 rounded-lg" />
                                         </div>
                                     ))}
                                </div>
                            ) : blueprint.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4">
                                    <div className="h-16 w-16 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/10">
                                        <Layers className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white/60">No Plan Yet</h4>
                                        <p className="text-xs text-white/20 mt-1 max-w-[200px]">Start building your project blueprint manually or use AI to generate one.</p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => createStep.mutate({ title: "Phase 1: Initial Step", status: 'TODO' })}
                                        className="mt-4 border-white/10 bg-white/5 hover:bg-white/10"
                                    >
                                        Add First Step
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-4">
                                    <DragDropProvider onDragEnd={handleDragEnd}>
                                        {blueprint.map((step, index) => (
                                            <BlueprintStepItem 
                                                key={step.id} 
                                                step={step} 
                                                depth={0}
                                                index={index}
                                                group="root"
                                                isSelected={selectedStepId === step.id}
                                                onSelect={(s) => setSelectedStepId(s.id)}
                                                onToggleExpand={toggleExpand}
                                                isExpanded={expandedIds.has(step.id)}
                                                expandedIds={expandedIds}
                                                selectedStepId={selectedStepId}
                                                onAddChild={(parentId) => createStep.mutate({ title: "New Sub-step", parentId })}
                                            />
                                        ))}
                                    </DragDropProvider>
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle className="bg-white/5" />

                <ResizablePanel defaultSize={40} minSize={30}>
                    {selectedStep ? (
                        <StepInspectorPanel 
                            step={selectedStep}
                            onUpdate={(id, updates) => updateStep.mutate({ stepId: id, updates })}
                            onDelete={(id) => {
                                deleteStep.mutate(id);
                                setSelectedStepId(null);
                            }}
                            onAnalyze={handleAnalyze}
                            allNodes={allNodes}
                            analysisResult={analysisResults[selectedStep.id]}
                            isAnalyzing={isAnalyzing[selectedStep.id]}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-white/10 space-y-4">
                            <Search className="h-12 w-12" />
                            <p className="text-xs font-bold uppercase tracking-widest">Select a step to inspect</p>
                        </div>
                    )}
                </ResizablePanel>
            </ResizablePanelGroup>

            {/* AI Generator Modal */}
            <AiPlanGenerateModal 
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                onSubmit={(goal, contextNodeIds) => {
                    generatePlan.mutate({ goal, contextNodeIds });
                    setIsAiModalOpen(false);
                }}
                isLoading={generatePlan.isPending}
                parentNode={parentNode}
            />
        </div>
    );
};

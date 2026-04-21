import React, { useState, useEffect } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Link as LinkIcon,
  Layers,
  FileText,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRoadmap, useRoadmapMutations } from "@/hooks/useRoadmap";
import { RoadmapStep, RoadmapStepCreate } from "@/types/roadmap";
import { useNodes } from "@/hooks/useNodes";

interface RoadmapEditorProps {
  nodeId: string;
  isAiEnabled: boolean;
}

export function RoadmapEditor({ nodeId, isAiEnabled }: RoadmapEditorProps) {
  const { data: steps = [] } = useRoadmap(nodeId);
  const { createStep, updateStep, deleteStep } = useRoadmapMutations(nodeId);
  const { data: allNodes } = useNodes();

  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  // Set initial selected step
  useEffect(() => {
    if (steps.length > 0 && !selectedStepId) {
      setSelectedStepId(steps[0].id);
    }
  }, [steps, selectedStepId]);

  const selectedStep = steps.find(s => s.id === selectedStepId);

  const handleUpdateStep = (id: string, updates: Partial<RoadmapStepCreate>) => {
    updateStep.mutate({ stepId: id, updates: updates as RoadmapStepCreate });
  };

  const handleAddStep = (afterId?: string) => {
    const lastStep = steps[steps.length - 1];
    const position = lastStep ? lastStep.position + 1000 : 1000;
    
    createStep.mutate({
      title: "New Step",
      status: 'todo',
      position,
      contextNodeIds: [],
    }, {
      onSuccess: (res) => {
        const newStep = res.data;
        setSelectedStepId(newStep.id);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, stepId: string) => {
    const index = steps.findIndex(s => s.id === stepId);
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddStep();
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) {
        // Outdent: remove parent
        handleUpdateStep(stepId, { parentStepId: null });
      } else {
        // Indent: set previous step as parent (if possible)
        if (index > 0) {
          handleUpdateStep(stepId, { parentStepId: steps[index - 1].id });
        }
      }
    }
  };

  return (
    <div className="h-[calc(100vh-250px)] border border-white/10 rounded-2xl overflow-hidden bg-[#0D0D0D]">
      <ResizablePanelGroup direction="horizontal">
        {/* Outliner Panel */}
        <ResizablePanel defaultSize={40} minSize={30}>
          <div className="h-full flex flex-col border-r border-white/10">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2 text-white/40">
                <Layers className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Roadmap Outliner</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 rounded-full hover:bg-white/10"
                onClick={() => handleAddStep()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {steps.map((step) => {
                  let depth = 0;
                  let p = step.parentStepId;
                  while (p) {
                    depth++;
                    const parent = steps.find(s => s.id === p);
                    p = parent?.parentStepId || null;
                  }

                  return (
                    <div
                      key={step.id}
                      onClick={() => setSelectedStepId(step.id)}
                      style={{ paddingLeft: `${depth * 20 + 12}px` }}
                      className={cn(
                        "group flex items-center gap-3 py-2.5 pr-3 rounded-lg cursor-pointer transition-all border border-transparent",
                        selectedStepId === step.id 
                          ? "bg-white/[0.08] border-white/10 shadow-lg" 
                          : "hover:bg-white/[0.03]"
                      )}
                    >
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStep(step.id, { status: step.status === 'todo' ? 'completed' : 'todo' });
                        }}
                        className="shrink-0"
                      >
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        ) : (
                          <Circle className="h-4 w-4 text-white/20 group-hover:text-white/40" />
                        )}
                      </button>
                      <Input
                        value={step.title}
                        onChange={(e) => handleUpdateStep(step.id, { title: e.target.value })}
                        onKeyDown={(e) => handleKeyDown(e, step.id)}
                        placeholder="Step title..."
                        className="bg-transparent border-none h-auto p-0 text-sm focus-visible:ring-0 text-white placeholder:text-white/10"
                        autoFocus={selectedStepId === step.id && step.title === ""}
                      />
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-white/5" />

        {/* Detail Panel */}
        <ResizablePanel defaultSize={60}>
          <ScrollArea className="h-full">
            {selectedStep ? (
              <div className="p-8 space-y-8 max-w-2xl mx-auto">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-white/40 mb-1">
                    <FileText className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Definition of Done</span>
                  </div>
                  <Textarea
                    value={selectedStep.definitionOfDone || ""}
                    onChange={(e) => handleUpdateStep(selectedStep.id, { definitionOfDone: e.target.value })}
                    placeholder="What does success look like for this step?"
                    className="bg-white/[0.03] border-white/10 rounded-xl min-h-[100px] text-white resize-none focus:border-white/30"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/40 mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Agent Prompt</span>
                    </div>
                    {isAiEnabled && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 rounded-full border-white/10 bg-white/5 hover:bg-white/10 gap-2 px-4 shadow-[0_0_15px_-5px_rgba(255,255,255,0.2)]"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span className="text-[10px] font-bold">Refine with AI</span>
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={selectedStep.prompt || ""}
                    onChange={(e) => handleUpdateStep(selectedStep.id, { prompt: e.target.value })}
                    placeholder="Enter the prompt or instructions for this step..."
                    className="bg-white/[0.05] border-white/20 rounded-2xl min-h-[200px] text-lg font-medium leading-relaxed p-6 text-white resize-none focus:border-white/40"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-white/40 mb-1">
                    <LinkIcon className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Linked Context</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedStep.contextNodeIds?.map((id) => {
                      const node = allNodes?.find(n => n.id === id);
                      if (!node) return null;
                      return (
                        <div 
                          key={id}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-white/80"
                        >
                          <Layers className="h-3 w-3 text-white/40" />
                          {node.name}
                        </div>
                      );
                    })}
                    <Button variant="ghost" size="sm" className="h-7 rounded-full text-[10px] font-bold border border-dashed border-white/20 hover:border-white/40">
                      + Add Context
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-4">
                <Layers className="h-12 w-12" />
                <p className="text-sm font-medium">Select a step to view details</p>
              </div>
            )}
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

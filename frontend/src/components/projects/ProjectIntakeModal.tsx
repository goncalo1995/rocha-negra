import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Sparkles, X, Link as LinkIcon, Target, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNodes, useNodeMutations } from "@/hooks/useNodes";
import { NodeCreate, NodeUpdate, NodeSummary } from "@/types/nodes";
import { toast } from "sonner";

interface ProjectIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: ProjectIntakeData) => void;
  nodeId?: string; // Optional: if provided, we update an existing node
}

export interface ProjectIntakeData {
  name: string;
  outcome: string;
  risk: string;
  linkedContext: string[]; // Store IDs
  isAiEnabled: boolean;
}

const STEPS = [
  { id: "name", label: "What is this project called?", icon: Target },
  { id: "outcome", label: "What is the primary desired outcome?", icon: Sparkles },
  { id: "risk", label: "What is the biggest risk or blocker?", icon: AlertTriangle },
  { id: "context", label: "Which context nodes are relevant?", icon: LinkIcon },
  { id: "ai", label: "Enable AI assistance for refinement?", icon: Sparkles },
];

export function ProjectIntakeModal({ isOpen, onClose, onComplete, nodeId }: ProjectIntakeModalProps) {
  const { data: allNodes } = useNodes();
  const { createNode, updateNode, linkNode } = useNodeMutations();

  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<ProjectIntakeData>({
    name: "",
    outcome: "",
    risk: "",
    linkedContext: [],
    isAiEnabled: true,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setData({
        name: "",
        outcome: "",
        risk: "",
        linkedContext: [],
        isAiEnabled: true,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentStep, isOpen]);

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        if (nodeId) {
          // Update existing project
          await updateNode.mutateAsync({
            id: nodeId,
            updates: {
              name: data.name,
              desiredOutcome: data.outcome,
              mainRisk: data.risk,
              isAiEnabled: data.isAiEnabled
            } as any
          });

          // Link context nodes (simplified: link them all)
          for (const targetId of data.linkedContext) {
            await linkNode.mutateAsync({ sourceId: nodeId, targetId, type: 'ASSOCIATED' });
          }
        } else {
          // Create new project
          await createNode.mutateAsync({
            name: data.name,
            type: 'PROJECT',
            status: 'active',
            desiredOutcome: data.outcome,
            mainRisk: data.risk
          } as any);
          // Note: isAiEnabled and linkedContext handling could be more robust here
        }
        
        onComplete?.(data);
        onClose();
      } catch (err) {
        // Error toast already handled by hook
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (currentStep === 3 && data.linkedContext.length === 0) {
          // Allow skipping context if needed, or strictly enforce? Let's allow skip.
      }
      handleNext();
    }
  };

  const toggleContextNode = (id: string) => {
    setData((prev) => {
      const exists = prev.linkedContext.includes(id);
      if (exists) {
        return { ...prev, linkedContext: prev.linkedContext.filter((nid) => nid !== id) };
      }
      return { ...prev, linkedContext: [...prev.linkedContext, id] };
    });
  };

  const step = STEPS[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[600px] border-none bg-[#0B0B0B] text-white p-0 overflow-hidden shadow-2xl">
        <div className="absolute top-6 right-6 z-50">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10 text-white/40 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="h-full flex flex-col items-center justify-center relative p-12">
          {/* Progress Indicator */}
          <div className="absolute top-12 left-12 flex space-x-2">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 w-8 rounded-full transition-all duration-300",
                  i <= currentStep ? "bg-white" : "bg-white/20"
                )}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-2xl space-y-8"
            >
              <div className="flex items-center gap-4 text-white/60 mb-2">
                <step.icon className="h-6 w-6" />
                <span className="text-sm font-medium uppercase tracking-[0.2em]">{`Step ${currentStep + 1} of ${STEPS.length}`}</span>
              </div>

              <h2 className="text-4xl font-bold tracking-tight text-white leading-tight">
                {step.label}
              </h2>

              <div className="relative group">
                {currentStep < 3 ? (
                  <Input
                    ref={inputRef}
                    value={data[step.id as keyof ProjectIntakeData] as string}
                    onChange={(e) => setData({ ...data, [step.id]: e.target.value })}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your answer..."
                    className="bg-transparent border-none border-b-2 border-white/20 rounded-none h-16 text-2xl focus-visible:ring-0 focus-visible:border-white px-0 placeholder:text-white/10 transition-colors"
                  />
                ) : currentStep === 3 ? (
                  <div className="grid grid-cols-2 gap-3 mt-4 max-h-[300px] overflow-y-auto pr-2">
                    {allNodes?.filter(n => n.id !== nodeId).map((node) => {
                      const isSelected = data.linkedContext.includes(node.id);
                      return (
                        <button
                          key={node.id}
                          onClick={() => toggleContextNode(node.id)}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-xl border transition-all text-left group/btn",
                            isSelected 
                              ? "bg-white text-black border-white" 
                              : "bg-white/5 border-white/10 hover:border-white/30 text-white"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <LinkIcon className={cn("h-4 w-4", isSelected ? "text-black" : "text-white/40")} />
                            <span className="text-sm font-medium">{node.name}</span>
                          </div>
                          {isSelected && <Check className="h-4 w-4" />}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/10 mt-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-white/10">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">AI Copilot</p>
                        <p className="text-sm text-white/60">Suggest refinements and generate DOD proposals.</p>
                      </div>
                    </div>
                    <Switch
                      checked={data.isAiEnabled}
                      onCheckedChange={(val) => setData({ ...data, isAiEnabled: val })}
                      className="data-[state=checked]:bg-white data-[state=checked]:text-black"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-8">
                <p className="text-white/40 text-sm">
                  {currentStep === STEPS.length - 1 ? "Press Enter to finish" : "Press Enter to continue"}
                </p>
                <Button 
                  onClick={handleNext}
                  className="bg-white text-black hover:bg-white/90 rounded-full px-8 py-6 h-auto text-lg font-bold group"
                >
                  {currentStep === STEPS.length - 1 ? "Complete Setup" : "Next Step"}
                  <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

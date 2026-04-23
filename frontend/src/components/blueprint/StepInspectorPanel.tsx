// StepInspectorPanel.tsx - With Save Button
import React, { useState, useEffect } from 'react';
import { BlueprintStep, BlueprintStepUpdate } from '../../types/blueprint';
import { MarkdownEditor, MarkdownPreview } from '@/components/ui/markdown-editor';
import { Clock, Sparkles, LayoutGrid, Trash2, Info, Search, X, Check, Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Node } from '@/types/nodes';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface StepInspectorPanelProps {
    step: BlueprintStep;
    onUpdate: (id: string, updates: BlueprintStepUpdate) => void;
    onDelete: (id: string) => void;
    onAnalyze: (id: string) => void;
    allNodes: Node[];
    analysisResult?: string;
    isAnalyzing: boolean;
}

export const StepInspectorPanel: React.FC<StepInspectorPanelProps> = ({
    step,
    onUpdate,
    onDelete,
    onAnalyze,
    allNodes,
    analysisResult,
    isAnalyzing
}) => {
    // Local state for editable fields
    const [localTitle, setLocalTitle] = useState(step.title);
    const [localStatus, setLocalStatus] = useState(step.status);
    const [localDescription, setLocalDescription] = useState(step.description || "");
    const [localContextNodeIds, setLocalContextNodeIds] = useState<string[]>(step.contextNodeIds || []);
    const [hasChanges, setHasChanges] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Reset local state when step changes
    useEffect(() => {
        setLocalTitle(step.title);
        setLocalStatus(step.status);
        setLocalDescription(step.description || "");
        setLocalContextNodeIds(step.contextNodeIds || []);
        setHasChanges(false);
    }, [step.id, step.title, step.status, step.description, step.contextNodeIds]);

    // Track changes
    useEffect(() => {
        const hasTitleChange = localTitle !== step.title;
        const hasStatusChange = localStatus !== step.status;
        const hasDescriptionChange = localDescription !== (step.description || "");
        const hasContextChange = JSON.stringify(localContextNodeIds) !== JSON.stringify(step.contextNodeIds || []);
        setHasChanges(hasTitleChange || hasStatusChange || hasDescriptionChange || hasContextChange);
    }, [localTitle, localStatus, localDescription, localContextNodeIds, step]);

    const handleSave = () => {
        const updates: BlueprintStepUpdate = {};
        if (localTitle !== step.title) updates.title = localTitle;
        if (localStatus !== step.status) updates.status = localStatus;
        if (localDescription !== (step.description || "")) updates.description = localDescription;
        if (JSON.stringify(localContextNodeIds) !== JSON.stringify(step.contextNodeIds || [])) {
            updates.contextNodeIds = localContextNodeIds;
        }
        if (Object.keys(updates).length > 0) {
            onUpdate(step.id, updates);
        }
        setHasChanges(false);
    };

    const filteredNodes = allNodes
        .filter(n => n.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 5);

    const toggleContextNode = (nodeId: string) => {
        setLocalContextNodeIds(prev => 
            prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]
        );
    };

    return (
        <div className="h-full flex flex-col bg-[#0D0D0D] border-l border-white/10 overflow-hidden">
            {/* Header with Save Button */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{step.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                    {hasChanges && (
                        <Button 
                            size="sm"
                            onClick={handleSave}
                            className="h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 gap-2"
                        >
                            <Save className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-bold">Save Changes</span>
                        </Button>
                    )}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-white/20 hover:text-red-400 hover:bg-red-400/10"
                        onClick={() => onDelete(step.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6 space-y-8 pb-12">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Title</label>
                            <Input 
                                value={localTitle}
                                onChange={(e) => setLocalTitle(e.target.value)}
                                className={cn(
                                    "bg-white/[0.03] border-white/10 focus:border-white/20 text-white",
                                    hasChanges && localTitle !== step.title && "border-yellow-500/50"
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Status</label>
                            <Select 
                                value={localStatus} 
                                onValueChange={(val: any) => setLocalStatus(val)}
                            >
                                <SelectTrigger className={cn(
                                    "bg-white/[0.03] border-white/10 text-white",
                                    hasChanges && localStatus !== step.status && "border-yellow-500/50"
                                )}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                                    <SelectItem value="TODO">Todo</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="DONE">Completed</SelectItem>
                                    <SelectItem value="BLOCKED">Blocked</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Description / Definition of Done */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-white/40">
                            <Info className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Definition of Done</span>
                        </div>
                        <div className={cn(
                            "min-h-[200px] rounded-xl border overflow-hidden",
                            hasChanges && localDescription !== (step.description || "") && "border-yellow-500/50",
                            "border-white/10 bg-white/[0.02]"
                        )}>
                            <MarkdownEditor 
                                value={localDescription}
                                onChange={setLocalDescription}
                            />
                        </div>
                    </div>

                    {/* AI Analysis Section - No changes needed */}
                    <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-purple-300">
                                <Sparkles className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">AI Strategist</span>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => onAnalyze(step.id)}
                                disabled={isAnalyzing}
                                className="h-7 text-[10px] bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20 text-purple-200"
                            >
                                {isAnalyzing ? "Analyzing..." : "Analyze Step"}
                            </Button>
                        </div>

                        {analysisResult ? (
                            <div className="text-[11px] leading-relaxed text-purple-200/80 bg-black/40 p-3 rounded-xl border border-purple-500/5">
                                <MarkdownPreview source={analysisResult} />
                            </div>
                        ) : (
                            <p className="text-[11px] text-white/30 italic">
                                Use AI to check this step for clarity, potential risks, and missing requirements.
                            </p>
                        )}
                    </div>

                    {/* Context Management - Use local state */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-white/40">
                            <LayoutGrid className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Related PARA Context</span>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
                            <Input 
                                placeholder="Search nodes to link..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white/[0.03] border-white/10 pl-9 text-xs h-9"
                            />
                        </div>

                        {searchQuery && (
                            <div className="space-y-1 bg-white/[0.02] rounded-lg border border-white/5 p-1">
                                {filteredNodes.map(node => (
                                    <div 
                                        key={node.id}
                                        onClick={() => toggleContextNode(node.id)}
                                        className={cn(
                                            "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors text-[11px]",
                                            localContextNodeIds.includes(node.id) ? "bg-purple-500/10 text-purple-200" : "hover:bg-white/5 text-white/60"
                                        )}
                                    >
                                        <span>{node.name}</span>
                                        {localContextNodeIds.includes(node.id) ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3 opacity-20" />}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2 pt-2">
                            {localContextNodeIds.map(id => {
                                const node = allNodes.find(n => n.id === id);
                                return (
                                    <Badge key={id} variant="outline" className="bg-white/[0.03] border-white/10 text-white/60 hover:text-red-400 group transition-all">
                                        {node?.name}
                                        <button onClick={() => toggleContextNode(id)} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                );
                            })}
                        </div>
                    </div>

                    {/* Unsaved Changes Indicator */}
                    {hasChanges && (
                        <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase tracking-widest text-center">
                            You have unsaved changes. Click Save to apply.
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};
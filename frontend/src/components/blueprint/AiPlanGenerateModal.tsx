import React, { useState, useMemo } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Search, Check, X } from 'lucide-react';
import { useNodes } from '@/hooks/useNodes';
import { Node } from '@/types/nodes';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface AiPlanGenerateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (goal: string, contextNodeIds: string[]) => void;
    isLoading: boolean;
    parentNode?: Node; // The Project node we are in
}

export const AiPlanGenerateModal: React.FC<AiPlanGenerateModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    parentNode
}) => {
    const [goal, setGoal] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const { data: allNodes = [] } = useNodes();

    // Smart Suggestions: Nodes in the same parent Area as the current Project
    const suggestions = useMemo(() => {
        if (!parentNode?.parentId) return [];
        return allNodes.filter(n => n.parentId === parentNode.parentId && n.id !== parentNode.id);
    }, [allNodes, parentNode]);

    const filteredNodes = useMemo(() => {
        if (!searchQuery) return suggestions.slice(0, 10);
        
        const query = searchQuery.toLowerCase();
        return allNodes
            .filter(n => n.id !== parentNode?.id)
            .sort((a, b) => {
                // Exact match first
                const aName = a.name.toLowerCase();
                const bName = b.name.toLowerCase();
                if (aName === query && bName !== query) return -1;
                if (bName === query && aName !== query) return 1;

                // Same parent Area next
                const aSameArea = a.parentId === parentNode?.parentId;
                const bSameArea = b.parentId === parentNode?.parentId;
                if (aSameArea && !bSameArea) return -1;
                if (bSameArea && !aSameArea) return 1;

                return a.name.localeCompare(b.name);
            })
            .filter(n => n.name.toLowerCase().includes(query))
            .slice(0, 20);
    }, [allNodes, searchQuery, suggestions, parentNode]);

    const toggleNode = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleFormSubmit = () => {
        if (!goal) return;
        onSubmit(goal, selectedIds);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#0D0D0D] border-white/10 text-white max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-400" />
                        Generate Blueprint with AI
                    </DialogTitle>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Your Goal</label>
                        <Textarea 
                            placeholder="What do you want to accomplish? (e.g. 'Build a React component library')"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            className="bg-white/[0.03] border-white/10 resize-none h-24 focus:border-purple-500/50 transition-all"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Intelligence Context (Source Knowledge)</label>
                        
                        {selectedIds.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {selectedIds.map(id => {
                                    const node = allNodes.find(n => n.id === id);
                                    return (
                                        <Badge key={id} variant="secondary" className="bg-purple-500/20 text-purple-200 border-purple-500/30 gap-1 pr-1">
                                            {node?.name}
                                            <button onClick={() => toggleNode(id)} className="hover:bg-white/10 rounded">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    );
                                })}
                            </div>
                        )}

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                            <input 
                                type="text"
                                placeholder="Search PARA nodes for context..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500/50"
                            />
                        </div>

                        <ScrollArea className="h-[200px] border border-white/5 rounded-lg bg-white/[0.01]">
                            <div className="p-2 space-y-1">
                                {filteredNodes.map(node => (
                                    <div 
                                        key={node.id}
                                        onClick={() => toggleNode(node.id)}
                                        className={cn(
                                            "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors",
                                            selectedIds.includes(node.id) ? "bg-purple-500/10 text-purple-200" : "hover:bg-white/5 text-white/60"
                                        )}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium">{node.name}</span>
                                            <span className="text-[10px] opacity-40 uppercase tracking-tighter">{node.type}</span>
                                        </div>
                                        {selectedIds.includes(node.id) && <Check className="h-3.5 w-3.5" />}
                                    </div>
                                ))}
                                {filteredNodes.length === 0 && (
                                    <div className="p-4 text-center text-xs text-white/20 italic">
                                        No matching nodes found.
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                <DialogFooter className="border-t border-white/5 pt-6">
                    <Button variant="ghost" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button 
                        onClick={handleFormSubmit} 
                        disabled={!goal || isLoading}
                        className="bg-purple-600 hover:bg-purple-500 text-white gap-2 px-6"
                    >
                        {isLoading ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Orchestrating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4" />
                                Generate Plan
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

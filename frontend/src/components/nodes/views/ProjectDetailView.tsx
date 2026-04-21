import { Node as AppNode, FullNode } from "@/types/nodes";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, LayoutDashboard, Map as RoadmapIcon, Sparkles, Loader2 } from "lucide-react";
import { RoadmapEditor } from "@/components/projects/RoadmapEditor";
import { ProjectDashboardView } from "@/components/projects/ProjectDashboardView";
import { ProjectIntakeModal, ProjectIntakeData } from "@/components/projects/ProjectIntakeModal";
import { toast } from "sonner";
import { useNode } from "@/hooks/useNodes";

interface ProjectDetailViewProps {
    node: AppNode;
}

export function ProjectDetailView({ node: initialNode }: ProjectDetailViewProps) {
    const { data: fullNode, isLoading } = useNode(initialNode.id);
    const [isIntakeOpen, setIsIntakeOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("roadmap");

    const handleIntakeComplete = (data: ProjectIntakeData) => {
        setIsIntakeOpen(false);
        // useNode will be invalidated by the mutation in the modal
        toast.success("Project updated!");
    };

    if (isLoading || !fullNode) {
        return (
            <div className="h-64 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white/20" />
            </div>
        );
    }

    const isAiEnabled = fullNode.projectDetails?.isAiEnabled ?? true;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white/5 p-1 rounded-full border border-white/10">
                        <TabsList className="bg-transparent border-none">
                            <TabsTrigger 
                                value="roadmap" 
                                className="rounded-full data-[state=active]:bg-white data-[state=active]:text-black transition-all gap-2 px-4 py-1.5"
                            >
                                <RoadmapIcon className="h-3.5 w-3.5" />
                                <span className="text-xs font-bold uppercase tracking-widest">Roadmap</span>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="dashboard" 
                                className="rounded-full data-[state=active]:bg-white data-[state=active]:text-black transition-all gap-2 px-4 py-1.5"
                            >
                                <LayoutDashboard className="h-3.5 w-3.5" />
                                <span className="text-xs font-bold uppercase tracking-widest">Dashboard</span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="flex items-center gap-3">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsIntakeOpen(true)}
                        className="rounded-full border border-white/10 hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest gap-2"
                    >
                        <Plus className="h-3 w-3" />
                        Re-run Intake
                    </Button>
                    {isAiEnabled && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                            <Sparkles className="h-3 w-3" />
                            AI Opt-in
                        </div>
                    )}
                </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeTab === "roadmap" ? (
                    <RoadmapEditor nodeId={fullNode.id} isAiEnabled={isAiEnabled} />
                ) : (
                    <ProjectDashboardView node={fullNode} />
                )}
            </div>

            <ProjectIntakeModal 
                isOpen={isIntakeOpen} 
                onClose={() => setIsIntakeOpen(false)} 
                onComplete={handleIntakeComplete} 
                nodeId={fullNode.id}
            />
        </div>
    );
}

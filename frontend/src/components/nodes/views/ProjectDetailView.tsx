import { Node as AppNode } from "@/types/nodes";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Layers, Loader2 } from "lucide-react";
import { BlueprintEditor } from "@/components/blueprint/BlueprintEditor";
import { ProjectDashboardView } from "@/components/projects/ProjectDashboardView";
import { useNode } from "@/hooks/useNodes";

interface ProjectDetailViewProps {
    node: AppNode;
}

export function ProjectDetailView({ node: initialNode }: ProjectDetailViewProps) {
    const { data: fullNode, isLoading } = useNode(initialNode.id);
    const [activeTab, setActiveTab] = useState("blueprint");

    if (isLoading || !fullNode) {
        return (
            <div className="h-64 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white/20" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white/5 p-1 rounded-full border border-white/10">
                        <TabsList className="bg-transparent border-none">
                            <TabsTrigger 
                                value="blueprint" 
                                className="rounded-full data-[state=active]:bg-white data-[state=active]:text-black transition-all gap-2 px-4 py-1.5"
                            >
                                <Layers className="h-3.5 w-3.5" />
                                <span className="text-xs font-bold uppercase tracking-widest">Blueprint</span>
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
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeTab === "blueprint" ? (
                    <BlueprintEditor nodeId={fullNode.id} parentNode={fullNode} />
                ) : (
                    <ProjectDashboardView node={fullNode} />
                )}
            </div>
        </div>
    );
}

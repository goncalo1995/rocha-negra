import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FullNode } from "@/types/nodes";
import { BlueprintStep } from "@/types/blueprint";
import { useBlueprint } from "@/hooks/useBlueprint";
interface ProjectDashboardViewProps {
  node: FullNode;
}

// We need a way to get all steps from the blueprint tree as a flat list.
// This recursive function will traverse the tree and collect all steps.
const flattenBlueprint = (steps: BlueprintStep[]): BlueprintStep[] => {
  let allSteps: BlueprintStep[] = [];
  for (const step of steps) {
    allSteps.push(step);
    if (step.children && step.children.length > 0) {
      allSteps = [...allSteps, ...flattenBlueprint(step.children)];
    }
  }
  return allSteps;
};

export function ProjectDashboardView({ node }: ProjectDashboardViewProps) {
  const { blueprint = [], isLoading } = useBlueprint(node.id);

  const allSteps = useMemo(() => {
    return blueprint ? flattenBlueprint(blueprint) : [];
  }, [blueprint]);

  const completedSteps = allSteps.filter(s => s.status === 'DONE');
  const todoSteps = allSteps.filter(s => s.status === 'TODO');
  const progress = allSteps.length > 0 ? (completedSteps.length / allSteps.length) * 100 : 0;

  // Needs review = completed but maybe "prompt" or "DOD" needs checking (mock logic)
  const needsReview = completedSteps.slice(0, 2); 

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#0D0D0D] border-white/10 shadow-2xl">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Project Progress</CardTitle>
            <Activity className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold tracking-tight">{Math.round(progress)}%</div>
            <Progress value={progress} className="h-1 bg-white/10" />
            <p className="text-[10px] text-white/40 font-medium">
              {completedSteps.length} of {allSteps.length} steps completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0D0D0D] border-white/10 shadow-2xl">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Estimated Completion</CardTitle>
            <Clock className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">12 Days</div>
            <div className="flex items-center gap-1.5 mt-3 text-[10px] text-emerald-400 font-bold">
              <TrendingUp className="h-3 w-3" />
              On schedule
            </div>
          </CardContent>
        </Card>

        {/* The project_details table was removed. We can get this info from the node itself if needed,
            or just use placeholder logic for now. We'll use the node's description. */}
        <Card className="bg-[#0D0D0D] border-white/10 shadow-2xl">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Risks & Blockers</CardTitle>
            <AlertCircle className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {/* Mock logic for now. Could be driven by a custom field on the node later. */}
              Low
            </div>
            <p className="text-[10px] text-white/40 font-medium mt-3 leading-relaxed">
              No major blockers identified in the project plan.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Up Next Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-white" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Up Next</h3>
            </div>
          </div>
          <div className="space-y-3">
            {/* Display only the first 3-4 upcoming steps to keep the dashboard clean */}
            {todoSteps.slice(0, 4).map((step) => (
              <div 
                key={step.id} 
                className="group p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-md font-semibold mb-1 group-hover:text-white transition-colors">{step.title}</h4>
                    {/* Use the new 'description' field for the step */}
                    <p className="text-xs text-white/40 line-clamp-1">{step.description}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 rounded-full border border-white/10 hover:bg-white text-[10px] font-bold hover:text-black transition-all">
                    Start Step
                  </Button>
                </div>
              </div>
            ))}
             {todoSteps.length === 0 && (
                <div className="text-center py-8 text-sm text-white/40">No upcoming steps. Well done!</div>
            )}
          </div>
        </section>

        {/* Needs Review Section */}
        <section className="space-y-4">
           <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-white" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Needs Review</h3>
          </div>
          <div className="space-y-3">
            {needsReview.map((step) => (
              <div 
                key={step.id} 
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all border-l-2 border-l-white/20"
              >
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                    <h4 className="text-sm font-semibold">{step.title}</h4>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-white/10 text-white/60">Draft</span>
                </div>
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-xs text-white/60 italic leading-relaxed">
                  "The analysis shows a 15% reduction in churn rate after implementing the new onboarding flow..."
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-white/40 hover:text-white px-0">Approved</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-white/40 hover:text-white px-0">Edit Output</Button>
                </div>
              </div>
            ))}
            {needsReview.length === 0 && (
                <div className="text-center py-8 text-sm text-white/40">Nothing pending review right now.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

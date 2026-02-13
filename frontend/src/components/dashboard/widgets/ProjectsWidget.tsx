import { BentoCard } from "@/components/BentoCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DashboardResponseDto } from "@/types/dashboard";
import { Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

interface ProjectsWidgetProps {
    data: DashboardResponseDto['projects'];
}

export function ProjectsWidget({ data }: ProjectsWidgetProps) {
    if (!data) return null;

    const projects = data.items || [];
    const activeNodes = projects.filter(p => p.status === 'ACTIVE');

    return (
        <BentoCard
            title="Projects"
            subtitle={`${activeNodes.length} active`}
            headerAction={
                <Link to="/nodes">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <Briefcase className="h-4 w-4" />
                    </Button>
                </Link>
            }
        >
            <div className="space-y-3">
                {projects.slice(0, 3).map((node) => (
                    <div key={node.id} className="p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-foreground">{node.name}</p>
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                                node.status === 'ACTIVE' ? "bg-success/20 text-success" :
                                    node.status === 'ON_HOLD' ? "bg-warning/20 text-warning" :
                                        "bg-muted text-muted-foreground"
                            )}>
                                {node.status.replace('_', ' ')}
                            </span>
                        </div>
                        {node.dueDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Due {new Date(node.dueDate).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                ))}
                {projects.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No nodes.</p>
                )}
            </div>
        </BentoCard>
    );
}

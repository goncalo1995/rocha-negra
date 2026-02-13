import { useDashboardWidgets, widgetLabels } from "@/hooks/useDashboardWidgets";
import { DashboardWidget } from "@/types/dashboard";
import {
    ChevronUp,
    ChevronDown,
    Settings2,
} from "lucide-react";
import { FinancialWidget } from "@/components/dashboard/widgets/FinancialWidget";
import { TasksWidget } from "@/components/dashboard/widgets/TasksWidget";
import { ProjectsWidget } from "@/components/dashboard/widgets/ProjectsWidget";
import { TransactionsWidget } from "@/components/dashboard/widgets/TransactionsWidget";
import { ItWidget } from "@/components/dashboard/widgets/ItWidget";
import { VehiclesWidget } from "@/components/dashboard/widgets/VehiclesWidget";
import { NetworkWidget } from "@/components/dashboard/widgets/NetworkWidget";
import { DebtsWidget } from "@/components/dashboard/widgets/DebtsWidget";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { DashboardResponseDto } from "@/types/dashboard";

export default function Dashboard() {
    const { widgets, enabledWidgets, toggleWidget, moveWidget } = useDashboardWidgets();

    // Data Hooks
    const { data, isLoading } = useQuery<DashboardResponseDto>({
        queryKey: ['dashboard'],
        queryFn: () => api.get('/dashboard').then(r => r.data),
    });

    console.log("widgets", widgets)


    const renderWidget = (widget: DashboardWidget) => {
        switch (widget.key) {
            case 'financial':
                return <FinancialWidget key={widget.key} data={data?.financial} debts={data?.debts} />;
            case 'tasks':
                return <TasksWidget key={widget.key} data={data?.tasks} />;
            case 'projects':
                return <ProjectsWidget key={widget.key} data={data?.projects} />;
            case 'transactions':
                return <TransactionsWidget key={widget.key} data={data?.transactions} />;
            case 'it':
                return <ItWidget key={widget.key} data={data?.it} />;
            case 'vehicles':
                return <VehiclesWidget key={widget.key} data={data?.vehicles} />;
            case 'network':
                return <NetworkWidget key={widget.key} data={data?.network} />;
            case 'debts':
                return <DebtsWidget key={widget.key} data={data?.debts} />;
            default:
                return null;
        }
    };

    console.log("widgets", widgets)

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Welcome back. Here's your overview.</p>
                </div>

                {/* Widget Customization Dialog */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Settings2 className="h-4 w-4" />
                            Customize
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col bg-card border-border p-0 overflow-hidden">
                        <DialogHeader className="p-6 pb-0">
                            <DialogTitle>Customize Dashboard</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-[60vh]">
                            <div className="px-6 pt-2 space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Choose which widgets to show and use arrows to reorder.
                                </p>
                                <div className="space-y-3 pb-4">
                                    {[...widgets].sort((a, b) => a.order - b.order).map((widget) => (
                                        <div key={widget.key} className="flex items-center justify-between p-3 rounded-lg bg-accent/50 group">
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => moveWidget(widget.key, 'up')}
                                                    >
                                                        <ChevronUp className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => moveWidget(widget.key, 'down')}
                                                    >
                                                        <ChevronDown className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <Label htmlFor={`widgetswitch-${widget.key}`} className="cursor-pointer font-medium">
                                                    {widgetLabels[widget.key]}
                                                </Label>
                                            </div>
                                            <Switch
                                                id={`widgetswitch-${widget.key}`}
                                                checked={widget.enabled}
                                                onCheckedChange={() => toggleWidget(widget.key)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollArea>
                        {/* <div className="p-6 pt-0 mt-auto">
                            <Button variant="outline" size="sm" onClick={resetToDefault} className="w-full">
                                Reset to Default
                            </Button>
                        </div> */}
                    </DialogContent>
                </Dialog>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enabledWidgets.map(renderWidget)}
            </div>

            {!isLoading && enabledWidgets.length === 0 && (
                <div className="bento-card text-center py-12">
                    <p className="text-muted-foreground">No widgets enabled. Click "Customize" to add widgets to your dashboard.</p>
                </div>
            )}
        </div>
    );
}

import { Link } from "react-router-dom";
import { FolderKanban, Layers, BookOpen, Target, Archive, ArrowRight, LayoutDashboard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const cards = [
    {
        title: "Projects",
        description: "Active projects with a deadline",
        icon: FolderKanban,
        href: "/projects",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20"
    },
    {
        title: "Areas",
        description: "Ongoing responsibilities",
        icon: Layers,
        href: "/areas",
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20"
    },
    {
        title: "Resources",
        description: "Topics and themes of interest",
        icon: BookOpen,
        href: "/resources",
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20"
    },
    {
        title: "Goals",
        description: "High-level objectives",
        icon: Target,
        href: "/goals",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20"
    },
    {
        title: "Archive",
        description: "Completed or archived items.",
        icon: Archive,
        href: "/archive",
        color: "text-zinc-500",
        bg: "bg-zinc-500/10",
        border: "border-zinc-500/20"
    }
];

export default function ParaDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <LayoutDashboard className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">PARA Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Projects • Areas • Resources • Archives (+ Goals)
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) => (
                    <Link key={card.title} to={card.href} className="group">
                        <Card className={cn(
                            "h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm",
                            "hover:border-primary/20",
                            card.border
                        )}>
                            <CardHeader>
                                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300", card.bg, card.color)}>
                                    <card.icon className="h-6 w-6" />
                                </div>
                                <CardTitle className="flex items-center justify-between">
                                    {card.title}
                                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-muted-foreground" />
                                </CardTitle>
                                <CardDescription>{card.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* We could add quick stats here later, like "4 Active" */}
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Quick Actions or Recent Items could go here */}
            {/* <div className="mt-12">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                ...
            </div> */}
        </div>
    );
}

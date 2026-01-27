import { BentoCard } from "@/components/BentoCard";
import { CheckCircle2, Circle, Clock, ArrowUpRight, ArrowDownRight, TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/useProjects";

export default function Dashboard() {
    const { projects } = useProjects();

    const getPriorityColor = (priority: number) => {
        switch (priority) {
            case 1: return 'text-destructive';
            case 2: return 'text-warning';
            case 3: return 'text-primary';
            default: return 'text-muted-foreground';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Welcome back. Here's your overview.</p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* Active Tasks - Spans 2 columns on large screens */}
                {/* <BentoCard
                    title="Active Tasks"
                    //   subtitle={`${activeTasks.length} items need attention`}
                    className="lg:col-span-2"
                    headerAction={
                        <Link to="/tasks">
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                View all
                            </Button>
                        </Link>
                    }
                >
                    <div className="space-y-3">
                        {activeTasks.slice(0, 4).map((task) => (
                            <div
                                key={task.id}
                                className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                            >
                                {task.status === 'in_progress' ? (
                                    <Clock className="h-4 w-4 text-warning shrink-0" />
                                ) : (
                                    <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}
                                    </p>
                                </div>
                                <span className={cn("text-xs font-medium capitalize", getPriorityColor(task.priority))}>
                                    {task.priority}
                                </span>
                            </div>
                        ))}
                    </div>
                </BentoCard> */}

                {/* Financial Health */}
                {/* <BentoCard 
          title="Financial Health" 
          subtitle="Your wealth at a glance"
          headerAction={
            <Link to="/wallet">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Wallet className="h-4 w-4" />
              </Button>
            </Link>
          }
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border border-emerald-700/30">
              <p className="text-sm text-emerald-400 mb-1">Net Worth</p>
              <p className="text-2xl font-bold text-foreground">€{totalAssets.toLocaleString()}</p>
            </div>
            
            <div className="p-4 rounded-xl bg-accent">
              <p className="text-sm text-muted-foreground mb-1">Safe to Spend</p>
              <p className={cn(
                "text-xl font-bold",
                safeToSpend > 0 ? "text-success" : "text-destructive"
              )}>
                €{safeToSpend.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                After €{monthlyExpenses.toLocaleString()} monthly costs
              </p>
            </div>
          </div>
        </BentoCard> */}

                {/* Projects Overview */}
                <BentoCard
                    title="Projects"
                    subtitle={`${projects.filter(p => p.status === 'active').length} active`}
                    headerAction={
                        <Link to="/projects">
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                View all
                            </Button>
                        </Link>
                    }
                >
                    <div className="space-y-3">
                        {projects.slice(0, 3).map((project) => (
                            <div key={project.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-foreground">{project.name}</p>
                                    {/* <span className="text-xs text-muted-foreground">{project.progress}%</span> */}
                                </div>
                                {/* <div className="h-1.5 bg-accent rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                                        style={{ width: `${project.progress}%` }}
                                    />
                                </div> */}
                            </div>
                        ))}
                    </div>
                </BentoCard>

                {/* Recent Transactions */}
                {/* <BentoCard 
          title="Recent Transactions" 
          className="lg:col-span-2"
          headerAction={
            <Link to="/ledger">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                View all
              </Button>
            </Link>
          }
        >
          <div className="space-y-2">
            {recentTransactions.map((tx) => (
              <div 
                key={tx.id} 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  tx.type === 'income' ? "bg-success/20" : "bg-destructive/20"
                )}>
                  {tx.type === 'income' ? (
                    <ArrowUpRight className="h-5 w-5 text-success" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {tx.category}
                    {tx.linkedTo && (
                      <span className="text-primary"> · {tx.linkedTo.name}</span>
                    )}
                  </p>
                </div>
                <p className={cn(
                  "font-semibold",
                  tx.type === 'income' ? "text-success" : "text-foreground"
                )}>
                  {tx.type === 'income' ? '+' : '-'}€{tx.amount}
                </p>
              </div>
            ))}
          </div>
        </BentoCard> */}
            </div>
        </div>
    );
}

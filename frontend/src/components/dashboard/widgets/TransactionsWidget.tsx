import { BentoCard } from "@/components/BentoCard";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { DashboardResponseDto } from "@/types/dashboard";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

interface TransactionsWidgetProps {
    data: DashboardResponseDto['transactions'];
}

export function TransactionsWidget({ data }: TransactionsWidgetProps) {
    if (!data) return null;

    const recentTransactions = data.recent || [];

    return (
        <BentoCard
            title="Recent Transactions"
            className="lg:col-span-2"
            headerAction={
                <Link to="/finance">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        View all
                    </Button>
                </Link>
            }
        >
            <div className="space-y-2">
                {recentTransactions.map((tx) => {
                    // @ts-ignore
                    const amount = tx.amountBase || tx.amountOriginal || 0;
                    const isIncome = amount > 0; // Assuming positive is income, or check tx.type

                    return (
                        <div
                            key={tx.id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center",
                                isIncome ? "bg-success/20" : "bg-destructive/20"
                            )}>
                                {isIncome ? (
                                    <ArrowUpRight className="h-5 w-5 text-success" />
                                ) : (
                                    <ArrowDownRight className="h-5 w-5 text-destructive" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(tx.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <p className={cn(
                                "font-semibold",
                                isIncome ? "text-success" : "text-foreground"
                            )}>
                                {isIncome ? '+' : ''}{formatCurrency(amount)}
                            </p>
                        </div>
                    );
                })}
                {recentTransactions.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No recent transactions.</p>
                )}
            </div>
        </BentoCard>
    );
}

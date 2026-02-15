import { useParams, Link } from "react-router-dom";
import { useFinance } from "@/hooks/useFinance";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MoreVertical, Receipt, Tag, Wallet } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters";
import { EntityRelations } from "@/components/relations/EntityRelations";

export default function TransactionDetail() {
    const { id } = useParams<{ id: string }>();
    const { transactions, categories, assets, deleteTransaction } = useFinance();

    // In a real app we'd have a useTransaction(id) hook, for now search in loaded transactions
    const transaction = transactions.find(t => t.id === id);
    const category = categories.find(c => c.id === transaction?.categoryId);
    const asset = assets.find(a => a.id === transaction?.assetId);

    if (!transaction) {
        return <div className="p-8">Transaction not found</div>;
    }

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this transaction?")) {
            await deleteTransaction(transaction.id);
            // Redirect back to ledger
            window.history.back();
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link to="/ledger" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to Ledger
            </Link>

            <div className="flex items-start gap-4">
                <div className={cn(
                    "mt-1 p-3 rounded-2xl",
                    transaction.type === 'income' ? "bg-success/10 text-success" :
                        transaction.type === 'expense' ? "bg-destructive/10 text-destructive" :
                            "bg-muted text-muted-foreground"
                )}>
                    <Receipt className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-1">
                    <h1 className="text-3xl font-bold text-foreground">
                        {transaction.description}
                    </h1>
                    <div className="flex items-center gap-2">
                        <p className={cn(
                            "text-xl font-semibold",
                            transaction.type === 'income' ? "text-success" :
                                transaction.type === 'expense' ? "text-destructive" :
                                    "text-muted-foreground"
                        )}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amountOriginal, transaction.currencyOriginal)}
                        </p>
                        <Badge variant="outline" className="capitalize">
                            {transaction.type}
                        </Badge>
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                            Delete Transaction
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    {/* Details Card */}
                    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Date</Label>
                                <div className="flex items-center gap-2 font-medium">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    {format(new Date(transaction.date), 'MMMM d, yyyy')}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Category</Label>
                                <div className="flex items-center gap-2 font-medium">
                                    <Tag className="h-4 w-4 text-primary" />
                                    {category?.name || 'Uncategorized'}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Account</Label>
                                <div className="flex items-center gap-2 font-medium">
                                    <Wallet className="h-4 w-4 text-primary" />
                                    {asset?.name || 'Unknown Account'}
                                </div>
                            </div>
                            {transaction.generatorId && (
                                <div className="space-y-1.5">
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Source</Label>
                                    <div className="flex items-center gap-2 font-medium">
                                        <Badge variant="secondary">Recurring Rule</Badge>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes/Metadata if any */}
                    {transaction.customFields && Object.keys(transaction.customFields).length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-lg font-semibold">Additional Info</Label>
                            <div className="p-4 rounded-xl bg-card border border-border/50">
                                <dl className="grid grid-cols-1 gap-2">
                                    {Object.entries(transaction.customFields).map(([key, value]) => (
                                        <div key={key} className="flex justify-between text-sm">
                                            <dt className="text-muted-foreground capitalize">{key}:</dt>
                                            <dd className="font-medium">{value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Linking Section */}
                    {id && (
                        <EntityRelations
                            sourceId={id}
                            sourceType="transaction"
                            title="Linked Project/Asset"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

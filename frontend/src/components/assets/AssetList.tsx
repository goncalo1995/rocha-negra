import { Asset, AssetType } from "@/types/finance";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { Banknote, Pencil, Trash2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { formatDate } from "@/lib/formatters";
import { useState } from "react";
import { assetTypeConfig } from "./AssetManager";

interface AssetListProps {
    assets: Asset[];
    onEdit: (asset: Asset) => void;
    onDelete: (assetId: string) => void;
    baseCurrency: string;
}

const AssetList = ({ assets, onEdit, onDelete, baseCurrency }: AssetListProps) => {

    // A helper function to get the display value of an asset
    const getAssetDisplayValue = (asset: Asset, baseCurrency: string) => {
        if (asset.balance !== null) {
            // It's a currency-based asset, just format the balance.
            return formatCurrency(asset.balance, asset.currency);
        }
        if (asset.quantity !== null) {
            // It's a unit-based asset. For V1, we don't have live prices,
            // so we can't show a monetary value. We should show the quantity.
            // In V2, you would call getLatestPrice(asset.currency) here.
            return `${asset.quantity.toLocaleString()} ${asset.currency}`;
        }
        return formatCurrency(0, baseCurrency); // Fallback for assets with no value
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">All Assets</CardTitle>
            </CardHeader>
            <CardContent>
                {assets.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        <Banknote className="mx-auto mb-2 h-8 w-8 opacity-50" />
                        <p className="text-sm">No assets yet. Add your first asset to get started.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {assets.map((asset) => {
                            const config = assetTypeConfig[asset.type];
                            const Icon = config.icon;
                            return (
                                <div
                                    key={asset.id}
                                    className="flex items-center gap-4 rounded-lg border border-border/50 p-3 transition-colors hover:bg-secondary/30"
                                >
                                    <div className={cn('rounded-lg bg-secondary p-2', config.color)}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{asset.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Updated {formatDate(asset.updated_at)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className={'font-semibold text-foreground'}>
                                            {getAssetDisplayValue(asset, "EUR")}
                                        </p>
                                        <Badge variant="outline" className="text-xs">
                                            {config.label}
                                        </Badge>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(asset)}>
                                            <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => onDelete(asset.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AssetList;
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Loader2, Link as LinkIcon, Plus } from 'lucide-react';
import { useFinance } from '@/hooks/useFinance';
import { useNodes } from '@/hooks/useNodes';
import { useVehicles } from '@/hooks/useVehicles';
import { EntityType, RelationType } from '@/types/relations';
import { cn } from '@/lib/utils';

interface RelationSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (entityId: string, entityType: EntityType, name: string) => void;
    excludeIds?: string[];
}

export function RelationSearchModal({ isOpen, onClose, onSelect, excludeIds = [] }: RelationSearchModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<EntityType | 'all'>('all');

    const { assets, categories, transactions } = useFinance();
    const { data: nodes } = useNodes();
    const { vehicles } = useVehicles();

    const allEntities = useMemo(() => {
        const items: { id: string; name: string; type: EntityType; detail?: string }[] = [];

        // Projects (Nodes)
        nodes?.filter(n => n.type === 'PROJECT').forEach(node => {
            items.push({ id: node.id, name: node.name, type: 'project', detail: 'Project' });
        });

        // Assets
        assets?.forEach(asset => {
            items.push({ id: asset.id, name: asset.name, type: 'asset', detail: asset.institution });
        });

        // Vehicles
        vehicles?.forEach(vehicle => {
            items.push({ id: vehicle.id, name: `${vehicle.make} ${vehicle.model}`, type: 'vehicle', detail: vehicle.licensePlate });
        });

        return items.filter(item => !excludeIds.includes(item.id));
    }, [nodes, assets, vehicles, excludeIds]);

    const filteredEntities = useMemo(() => {
        return allEntities.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.detail?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = selectedType === 'all' || item.type === selectedType;
            return matchesSearch && matchesType;
        });
    }, [allEntities, searchQuery, selectedType]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden border-primary/20 bg-card/95 backdrop-blur-xl">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                        <LinkIcon className="h-5 w-5 text-primary" />
                        Link to Entity
                    </DialogTitle>
                    <DialogDescription>
                        Search for a project, asset, or vehicle to create a relationship.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 py-4 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or detail..."
                            className="pl-9 bg-secondary/50 border-border/50 focus-visible:ring-primary/30"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {(['all', 'project', 'asset', 'vehicle'] as const).map((type) => (
                            <Badge
                                key={type}
                                variant={selectedType === type ? 'default' : 'outline'}
                                className={cn(
                                    "cursor-pointer capitalize px-3 py-1 transition-all",
                                    selectedType === type ? "shadow-md shadow-primary/20" : "hover:bg-secondary"
                                )}
                                onClick={() => setSelectedType(type)}
                            >
                                {type}
                            </Badge>
                        ))}
                    </div>

                    <ScrollArea className="h-[300px] pr-4 -mr-4 border-t border-border/10 pt-4">
                        <div className="space-y-2">
                            {filteredEntities.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">
                                    <p className="text-sm">No entities found</p>
                                </div>
                            ) : (
                                filteredEntities.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => onSelect(item.id, item.type, item.name)}
                                        className="w-full flex items-center justify-between p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
                                    >
                                        <div>
                                            <p className="font-medium group-hover:text-primary transition-colors">{item.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="secondary" className="text-[10px] uppercase tracking-wider py-0 px-1.5 h-4">
                                                    {item.type}
                                                </Badge>
                                                {item.detail && (
                                                    <span className="text-xs text-muted-foreground">{item.detail}</span>
                                                )}
                                            </div>
                                        </div>
                                        <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </button>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}

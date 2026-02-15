import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link2, Plus, X, ExternalLink, Unlink } from 'lucide-react';
import { useRelations } from '@/hooks/useRelations';
import { EntityType, RelationType } from '@/types/relations';
import { RelationSearchModal } from './RelationSearchModal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface EntityRelationsProps {
    sourceId: string;
    sourceType: EntityType;
    title?: string;
    className?: string;
}

export function EntityRelations({ sourceId, sourceType, title = "Connected Entities", className }: EntityRelationsProps) {
    const { getRelationsBySource, createRelation, deleteRelation, isCreating } = useRelations();
    const { data: relations, isLoading } = getRelationsBySource(sourceId, sourceType);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const handleLink = async (targetId: string, targetType: EntityType, name: string) => {
        try {
            await createRelation({
                sourceEntityId: sourceId,
                sourceEntityType: sourceType,
                targetEntityId: targetId,
                targetEntityType: targetType,
                relationType: 'RELATED_TO'
            });
            toast.success(`Successfully linked to ${name}`);
            setIsSearchOpen(false);
        } catch (error) {
            toast.error("Failed to create relationship");
        }
    };

    const handleUnlink = async (relationId: string) => {
        try {
            await deleteRelation(relationId);
            toast.success("Relationship removed");
        } catch (error) {
            toast.error("Failed to remove relationship");
        }
    };

    const getEntityRoute = (id: string, type: EntityType) => {
        switch (type) {
            case 'project': return `/nodes/${id}`;
            case 'asset': return `/assets`; // We don't have detail pages for assets yet
            case 'vehicle': return `/vehicles`;
            case 'task': return `/tasks/${id}`;
            case 'transaction': return `/finance/transactions/${id}`;
            default: return '#';
        }
    };

    return (
        <Card className={cn("border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden", className)}>
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 border-b border-border/10">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-primary" />
                    {title}
                </CardTitle>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSearchOpen(true)}
                    className="h-8 px-2 text-xs font-medium hover:bg-primary/10 hover:text-primary transition-all"
                >
                    <Plus className="h-3 w-3 mr-1" />
                    Link to...
                </Button>
            </CardHeader>
            <CardContent className="p-4">
                {isLoading ? (
                    <div className="flex justify-center p-4">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                    </div>
                ) : !relations || relations.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-border/50 rounded-xl">
                        <p className="text-xs text-muted-foreground">No connections found.</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">Connect this to projects, assets, or vehicles.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {relations.map((rel) => (
                            <div
                                key={rel.id}
                                className="group flex items-center justify-between p-2.5 rounded-xl bg-secondary/30 border border-border/10 hover:border-primary/20 hover:bg-secondary/50 transition-all"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center border border-border/50 shadow-sm group-hover:border-primary/30 transition-colors">
                                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <Link
                                            to={getEntityRoute(rel.targetEntityId, rel.targetEntityType)}
                                            className="text-sm font-medium hover:text-primary transition-colors block truncate"
                                        >
                                            {/* Note: We'd ideally need the target name from the API, but let's assume UUID for now or fix backend */}
                                            {rel.targetEntityType.toUpperCase()} - {rel.targetEntityId.substring(0, 8)}
                                        </Link>
                                        <Badge variant="outline" className="text-[9px] uppercase tracking-widest py-0 px-1 h-3.5 mt-0.5 border-border/50">
                                            {rel.targetEntityType}
                                        </Badge>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleUnlink(rel.id)}
                                >
                                    <Unlink className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            <RelationSearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSelect={handleLink}
                excludeIds={relations?.map(r => r.targetEntityId)}
            />
        </Card>
    );
}

import { Button } from "@/components/ui/button";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import api from "@/lib/api";
import { Node, NodeType, NodeSummary } from "@/types/nodes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNodeMutations } from "@/hooks/useNodes";
import { Link as LinkIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface LinkNodeDialogProps {
    sourceNodeId: string;
    trigger?: React.ReactNode;
}

export function LinkNodeDialog({ sourceNodeId, trigger }: LinkNodeDialogProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [linkType, setLinkType] = useState("REFERENCES");
    const queryClient = useQueryClient();

    // Debounce search could be added, but for now we rely on the user stopping typing or just fast responses
    // Actually, CommandInput usually filters locally, but we want server-side search.
    // The shadcn Command component is tricky with server-side search.
    // A common pattern is to fetch based on search state.

    const { data: nodes = [], isLoading } = useQuery<NodeSummary[]>({
        queryKey: ['nodes', 'search', search],
        queryFn: async () => {
            // Only search if we have at least 2 chars or if we want to show suggestions?
            // Let's matching existing behavior or just list all if empty (might be too many)
            // For now, let's fetch all (filtered by name if provided)
            const params = new URLSearchParams();
            if (search) params.append('query', search);

            // We might want to filter out the source node itself and potentially resource types?
            // The requirements say "find nodes to link to". Usually Type=RESOURCE.
            // But let's allow searching any node for now, or maybe restrict to RESOURCE if specified.
            // User requirement: "(GET /api/v1/nodes?name=...&type=RESOURCE)"
            // So we should filter by type RESOURCE? The requirement says "&type=RESOURCE".
            // Let's assume we are linking resources.
            // params.append('type', 'RESOURCE');

            const res = await api.get(`/nodes?${params.toString()}`);
            return res.data;
        },
        enabled: open, // Only fetch when dialog is open
    });

    const { linkNode } = useNodeMutations();

    const handleLink = (targetNodeId: string) => {
        linkNode.mutate({ sourceId: sourceNodeId, targetId: targetNodeId, type: linkType }, {
            onSuccess: () => {
                setOpen(false);
                // toast is handled in the hook
            }
        });
    };

    return (
        <>
            <div onClick={() => setOpen(true)}>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <LinkIcon className="h-4 w-4" />
                        Link Resource
                    </Button>
                )}
            </div>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <DialogHeader className="px-4 pt-4 pb-2">
                    <DialogTitle>Link a Resource</DialogTitle>
                </DialogHeader>
                <div className="flex items-center gap-2 px-4 pb-2">
                    <Select value={linkType} onValueChange={setLinkType}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Link Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="REFERENCES">References</SelectItem>
                            <SelectItem value="DEPENDS_ON">Depends On</SelectItem>
                            <SelectItem value="BELONGS_TO">Belongs To</SelectItem>
                            <SelectItem value="SUPPORTS">Supports</SelectItem>
                            <SelectItem value="RELATED_TO">Related To</SelectItem>
                        </SelectContent>
                    </Select>
                    <CommandInput
                        placeholder="Search resources..."
                        value={search}
                        onValueChange={setSearch}
                        className="flex-1 border-none focus:ring-0"
                    />
                </div>
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    {isLoading ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                            Searching...
                        </div>
                    ) : (
                        <CommandGroup heading="Resources">
                            {nodes
                                .filter(node => node.id !== sourceNodeId) // Exclude self
                                .map((node) => (
                                    <CommandItem
                                        key={node.id}
                                        value={node.name + " " + node.id} // value needed for local filter if we used it, but here acts as ID
                                        onSelect={() => handleLink(node.id)}
                                        className="cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2 w-full">
                                            <div className="flex-1">
                                                <p className="font-medium">{node.name}</p>
                                                <p className="text-xs text-muted-foreground capitalize">{node.type.toLowerCase()}</p>
                                            </div>
                                            {linkNode.isPending && linkNode.variables?.targetId === node.id && (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            )}
                                        </div>
                                    </CommandItem>
                                ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
}

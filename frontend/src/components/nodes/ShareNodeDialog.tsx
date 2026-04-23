import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, Link as LinkIcon, Shield, ShieldCheck, Info, Users, Eye, Copy, RotateCcw, PowerOff } from "lucide-react";
import { FullNode } from "@/types/nodes";
import { useNodeShare, useNodeShareMutations, useNodeShareStats } from "@/hooks/useNodeShare";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface ShareNodeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    node: FullNode;
}

export function ShareNodeDialog({ open, onOpenChange, node }: ShareNodeDialogProps) {
    const [email, setEmail] = useState("");
    const { data: share, isLoading: shareLoading } = useNodeShare(node.id);
    const { data: stats, isLoading: statsLoading } = useNodeShareStats(node.id);
    const { enableShare, disableShare, regenerateShare } = useNodeShareMutations(node.id);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Link copied to clipboard!");
    };

    // Combine share data with stats
    const viewCount = stats?.viewCount ?? share?.viewCount ?? 0;
    const lastViewedAt = stats?.lastViewedAt ?? share?.lastViewedAt ?? null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Manage Access
                    </DialogTitle>
                    <DialogDescription>
                        Manage who has access to this node and their permission levels.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Invite Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 space-y-1.5">
                                <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
                                    Invite by Email (Not yet implemented)
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="email"
                                        placeholder="user@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-9"
                                        disabled
                                    />
                                    <Button size="sm" className="h-9 gap-2" disabled>
                                        <UserPlus className="h-4 w-4" />
                                        Invite
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Members List */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Members
                        </h4>
                        <div className="space-y-2">
                            {node.members?.map((member: any) => (
                                <div key={member.userId} className="flex items-center justify-between p-2 rounded-lg border border-border/50 bg-accent/5">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                {member.userId.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                User {member.userId.substring(0, 8)}...
                                            </p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                {member.role === 'OWNER' ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                                                {member.role}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-[10px] h-7 px-2">
                                        Manage
                                    </Button>
                                </div>
                            ))}
                            {(!node.members || node.members.length === 0) && (
                                <p className="text-sm text-muted-foreground italic text-center py-2">
                                    No members yet.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Share Link - Moved stats to only show when link is enabled */}
                    <div className="pt-4 border-t space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <LinkIcon className="h-3 w-3" />
                                Share Link
                            </h4>
                            {share?.enabled ? (
                                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                                    Active
                                </span>
                            ) : (
                                <span className="text-[10px] font-bold bg-muted text-muted-foreground px-1.5 py-0.5 rounded uppercase">
                                    Disabled
                                </span>
                            )}
                        </div>

                        {!share?.enabled ? (
                            <Button
                                size="sm"
                                className="w-full h-9 gap-2"
                                onClick={() => enableShare.mutate()}
                                disabled={enableShare.isPending || shareLoading}
                            >
                                <LinkIcon className="h-4 w-4" />
                                Generate Share Link
                            </Button>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <Input
                                        value={share.url || ""}
                                        readOnly
                                        className="h-9 text-xs font-mono"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 px-2 shrink-0"
                                        onClick={() => share.url && handleCopy(share.url)}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                
                                {/* Stats section - only shown when link is active */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
                                        <div className="flex items-center gap-1.5">
                                            <Eye className="h-3.5 w-3.5" />
                                            <span className="font-medium">{viewCount}</span>
                                            <span>{viewCount === 1 ? 'view' : 'views'}</span>
                                        </div>
                                        {lastViewedAt && (
                                            <>
                                                <div className="w-px h-3 bg-border" />
                                                <div className="flex items-center gap-1.5">
                                                    <span>Last viewed {formatDistanceToNow(new Date(lastViewedAt), { addSuffix: true })}</span>
                                                </div>
                                            </>
                                        )}
                                        {viewCount === 0 && (
                                            <span className="text-muted-foreground/60 italic">No views yet</span>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs gap-1 flex-1"
                                            onClick={() => disableShare.mutate()}
                                            disabled={disableShare.isPending}
                                        >
                                            <PowerOff className="h-3 w-3" />
                                            Disable Link
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs gap-1 flex-1"
                                            onClick={() => regenerateShare.mutate()}
                                            disabled={regenerateShare.isPending}
                                        >
                                            <RotateCcw className="h-3 w-3" />
                                            New Link
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-start gap-2 text-[10px] text-muted-foreground bg-muted/30 p-2 rounded-lg">
                            <Info className="h-3 w-3 shrink-0 mt-0.5" />
                            <p>
                                {share?.enabled 
                                    ? "Anyone with this link can view this content. You can disable or regenerate the link at any time."
                                    : "Once enabled, anyone with the link will be able to view this content without signing in."}
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-start">
                    <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
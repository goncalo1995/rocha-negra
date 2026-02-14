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
import { UserPlus, Link as LinkIcon, Shield, ShieldCheck, Mail, Info, Users } from "lucide-react";
import { FullNode } from "@/types/nodes";

interface ShareNodeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    node: FullNode;
}

export function ShareNodeDialog({ open, onOpenChange, node }: ShareNodeDialogProps) {
    const [email, setEmail] = useState("");

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
                                <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">Invite by Email</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="email"
                                        placeholder="user@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-9"
                                    />
                                    <Button size="sm" className="h-9 gap-2">
                                        <UserPlus className="h-4 w-4" />
                                        Invite
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Members List */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Members</h4>
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
                                            <p className="text-sm font-medium truncate">User {member.userId.substring(0, 8)}...</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                {member.role === 'OWNER' ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                                                {member.role}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-[10px] h-7 px-2">Manage</Button>
                                </div>
                            ))}
                            {(!node.members || node.members.length === 0) && (
                                <p className="text-sm text-muted-foreground italic text-center py-2">No members yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Share Link - Coming Soon */}
                    <div className="pt-4 border-t space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <LinkIcon className="h-3 w-3" />
                                Share Link
                            </h4>
                            <span className="text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase">Coming Soon</span>
                        </div>
                        <div className="flex gap-2 opacity-50 pointer-events-none">
                            <Input value="https://rochanegra.app/share/..." readOnly className="h-9 text-xs" />
                            <Button variant="outline" size="sm" className="h-9">Copy</Button>
                        </div>
                        <div className="flex items-start gap-2 text-[10px] text-muted-foreground bg-muted/50 p-2 rounded-lg">
                            <Info className="h-3 w-3 shrink-0 mt-0.5" />
                            <p>Once enabled, anyone with the link will be able to view this {node.type.toLowerCase()} and its contents.</p>
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

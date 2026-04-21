import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Target, Layers, BookOpen, CircleDot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { NodeTreeItem, useNodesTree } from "@/hooks/useNodesTree";
import {
    SidebarMenuItem,
    SidebarMenuButton,
    useSidebar,
} from "@/components/ui/sidebar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SidebarTreeItemProps {
    item: NodeTreeItem;
    depth?: number;
}

export function SidebarTreeItem({ item, depth = 0 }: SidebarTreeItemProps) {
    const location = useLocation();
    const { state: sidebarState, setOpenMobile } = useSidebar();
    const isCollapsed = sidebarState === "collapsed";
    const [isExpanded, setIsExpanded] = useState(false);
    const { moveNode } = useNodesTree();

    // Check if it's a virtual node (root category)
    const isVirtual = item.id.startsWith('root-');

    // State for confirmation dialog
    const [pendingMove, setPendingMove] = useState<{ nodeId: string, parentId: string | null } | null>(null);

    const isActive = (path: string) => location.pathname === path;

    const getIcon = (type: string) => {
        switch (type) {
            case "PROJECT": return <Target className="w-4 h-4 text-node-project" />;
            case "AREA": return <Layers className="w-4 h-4 text-node-area" />;
            case "RESOURCE": return <BookOpen className="w-4 h-4 text-node-resource" />;
            case "GOAL": return <CircleDot className="w-4 h-4 text-node-goal" />;
            default: return <CircleDot className="w-4 h-4" />;
        }
    };

    const handleConfirmMove = () => {
        if (pendingMove) {
            moveNode.mutate({ id: pendingMove.nodeId, parentId: pendingMove.parentId });
            setPendingMove(null);
        }
    };

    return (
        <div className="space-y-0.5 group/item">
            <SidebarMenuItem>
                <div
                    className={cn(
                        "group relative flex items-center gap-1 py-0.5",
                    )}
                >
                    {/* Expand/Collapse Toggle - Hidden when collapsed */}
                    {!isCollapsed && item.count > 0 && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={cn(
                                "p-1 hover:bg-accent rounded-sm transition-transform",
                                isExpanded && "rotate-90",
                                (item.children?.length === 0 && !isVirtual) && "invisible"
                            )}
                        >
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                    )}

                    <div className="flex items-center flex-1 min-w-0 pr-1">
                        <SidebarMenuButton
                            asChild
                            isActive={isActive(`/nodes/${item.id}`)}
                            tooltip={item.name}
                            className="flex-1"
                            onClick={() => setOpenMobile(false)}
                        >
                            {isVirtual ? (
                                <Link
                                    to={`${item.href || '/nodes'}`}
                                    className="flex items-center gap-2 cursor-pointer w-full"
                                >
                                    {getIcon(item.type)}
                                    {!isCollapsed && (
                                        <>
                                            <span className="truncate flex-1 font-medium">{item.name}</span>
                                            {item.count > 0 && !isExpanded && (
                                                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full opacity-70">
                                                    {item.count}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </Link>
                            ) : (
                                <Link
                                    to={`/nodes/${item.id}`}
                                    className="flex items-center gap-2"
                                >
                                    {getIcon(item.type)}
                                    {!isCollapsed && (
                                        <>
                                            <span className="truncate flex-1">{item.name}</span>
                                            {item.count > 0 && !isExpanded && (
                                                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full opacity-70">
                                                    {item.count}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </Link>
                            )}
                        </SidebarMenuButton>
                    </div>
                </div>
            </SidebarMenuItem>

            {/* Move Confirmation Dialog */}
            <AlertDialog open={!!pendingMove} onOpenChange={(open) => !open && setPendingMove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Move</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to move this item? This will update its position in your Second Brain hierarchy.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmMove}>Move Item</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Sub-items - Only shown when expanded AND NOT collapsed */}
            <AnimatePresence initial={false}>
                {isExpanded && !isCollapsed && item.children && item.children.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden ml-4 border-l border-border/40"
                    >
                        <div className="pl-2 py-1 space-y-0.5">
                            {item.children.map((child) => (
                                <SidebarTreeItem key={child.id} item={child} depth={depth + 1} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

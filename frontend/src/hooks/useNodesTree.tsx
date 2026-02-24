import api from "@/lib/api";
import { NodeType, NodeStatus } from "@/types/nodes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface NodeTreeItem {
    id: string;
    name: string;
    type: NodeType;
    href?: string;
    children: NodeTreeItem[];
    count: number;
}

export function useNodesTree() {
    const queryClient = useQueryClient();

    const treeQuery = useQuery<NodeTreeItem[]>({
        queryKey: ['nodes-tree'],
        queryFn: async () => (await api.get('/nodes/tree')).data,
    });

    const moveNode = useMutation({
        mutationFn: ({ id, parentId }: { id: string; parentId: string | null }) =>
            api.patch(`/nodes/${id}`, { parentId }),
        onSuccess: () => {
            toast.success("Node moved successfully.");
            queryClient.invalidateQueries({ queryKey: ['nodes-tree'] });
            queryClient.invalidateQueries({ queryKey: ['nodes'] });
        },
        onError: (error: any) => {
            toast.error("Failed to move node: " + (error.response?.data?.message || error.message));
        }
    });

    return {
        ...treeQuery,
        moveNode
    };
}

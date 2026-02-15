import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { EntityRelation, RelationCreateDto, EntityType } from '@/types/relations';

export function useRelations() {
    const queryClient = useQueryClient();

    const getRelationsByTarget = (targetId: string, targetType: string) => {
        return useQuery({
            queryKey: ['relations', 'target', targetId, targetType],
            queryFn: async () => {
                const response = await api.get<EntityRelation[]>(`/relations?targetId=${targetId}&targetType=${targetType}`);
                return response.data;
            },
            enabled: !!targetId,
        });
    };

    const getRelationsBySource = (sourceId: string, sourceType?: string) => {
        return useQuery({
            queryKey: ['relations', 'source', sourceId, sourceType],
            queryFn: async () => {
                const url = sourceType
                    ? `/relations/source/${sourceId}?sourceType=${sourceType}`
                    : `/relations/source/${sourceId}`;
                const response = await api.get<EntityRelation[]>(url);
                return response.data;
            },
            enabled: !!sourceId,
        });
    };

    const createRelationMutation = useMutation({
        mutationFn: (newRelation: RelationCreateDto) => api.post('/relations', newRelation),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['relations', 'source', variables.sourceEntityId] });
            queryClient.invalidateQueries({ queryKey: ['relations', 'target', variables.targetEntityId] });
        },
    });

    const deleteRelationMutation = useMutation({
        mutationFn: (relationId: string) => api.delete(`/relations/${relationId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['relations'] });
        },
    });

    return {
        getRelationsByTarget,
        getRelationsBySource,
        createRelation: createRelationMutation.mutateAsync,
        deleteRelation: deleteRelationMutation.mutateAsync,
        isCreating: createRelationMutation.isPending,
        isDeleting: deleteRelationMutation.isPending,
    };
}

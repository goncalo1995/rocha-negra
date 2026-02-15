export type EntityType =
    | 'transaction'
    | 'task'
    | 'recurring_generator'
    | 'asset'
    | 'liability'
    | 'vehicle'
    | 'domain'
    | 'project'
    | 'property'; // Added for housing

export type RelationType = 'RELATED_TO' | 'AFFECTS' | 'PART_OF' | 'FOR';

export interface EntityRelation {
    id: string;
    sourceEntityId: string;
    sourceEntityType: EntityType;
    targetEntityId: string;
    targetEntityType: EntityType;
    relationType: RelationType;
    createdAt?: string;
}

export interface RelationCreateDto {
    sourceEntityId: string;
    sourceEntityType: EntityType;
    targetEntityId: string;
    targetEntityType: EntityType;
    relationType: RelationType;
}

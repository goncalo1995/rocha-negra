export interface TreeNode {
    id: string;
    parentId: string | null;
    position?: number;
    children?: TreeNode[];
}

export function buildTree<T extends TreeNode>(flatItems: T[]): T[] {
    const itemMap = new Map<string, T & { children: T[] }>();
    const roots: T[] = [];

    // First pass: create map with empty children
    flatItems.forEach(item => {
        itemMap.set(item.id, { ...item, children: [] });
    });

    // Second pass: build parent-child relationships
    flatItems.forEach(item => {
        const itemWithChildren = itemMap.get(item.id)!;
        if (item.parentId && itemMap.has(item.parentId)) {
            itemMap.get(item.parentId)!.children.push(itemWithChildren);
        } else {
            roots.push(itemWithChildren);
        }
    });

    // Sort children by position
    const sortByPosition = (items: T[]) => {
        items.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        items.forEach(item => {
            if (item.children) sortByPosition(item.children as T[]);
        });
    };
    sortByPosition(roots);

    return roots;
}

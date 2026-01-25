import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Lock } from 'lucide-react';
import * as Icons from 'lucide-react';
import { AddEditCategoryDialog } from './AddEditCategoryDialog';
import { Category, CategoryCreateDto, CategoryUpdateDto } from '@/types/finance';

interface CategoryManagerProps {
    categories: Category[];
    onAddCategory: (category: CategoryCreateDto) => void;
    onUpdateCategory: (id: string, updates: Partial<CategoryUpdateDto>) => void;
    onDeleteCategory: (id: string) => void;
}

export function CategoryManager({ categories, onAddCategory, onUpdateCategory, onDeleteCategory }: CategoryManagerProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const handleAddClick = () => {
        setEditingCategory(null);
        setIsDialogOpen(true);
    };

    const handleEditClick = (category: Category) => {
        if (category.systemKey) return; // Prevent editing system categories
        setEditingCategory(category);
        setIsDialogOpen(true);
    };

    // Group categories by Type and Nature
    const groupedCategories = categories.reduce((acc, cat) => {
        if (!acc[cat.type]) acc[cat.type] = {};
        if (!acc[cat.type][cat.nature]) acc[cat.type][cat.nature] = [];
        acc[cat.type][cat.nature].push(cat);
        return acc;
    }, {} as Record<string, Record<string, Category[]>>);

    const renderCategoryCard = (category: Category) => {
        const Icon = (Icons as any)[category.iconSlug || 'Circle'] || Icons.Circle;
        console.log(category.iconSlug, Icon);
        const isSystem = !!category.systemKey;

        return (
            <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md" style={{ backgroundColor: `${category.color || '#84cc16'}20` }}>
                        <Icon className="h-5 w-5" style={{ color: category.color || '#84cc16' }} />
                    </div>
                    <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex items-center">
                    {isSystem ? (
                        <Lock className="h-4 w-4 text-muted-foreground mr-2" />
                    ) : (
                        <>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(category)}>
                                <Pencil className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDeleteCategory(category.id)}>
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Categories</h2>
                <Button onClick={handleAddClick} size="sm"><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
            </div>

            <Tabs defaultValue="expense" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="expense">Expenses</TabsTrigger>
                    <TabsTrigger value="income">Income</TabsTrigger>
                </TabsList>

                {['expense', 'income'].map(type => (
                    <TabsContent key={type} value={type} className="space-y-6 pt-4">
                        {Object.entries(groupedCategories[type] || {}).map(([nature, cats]) => (
                            <div key={nature}>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                                    {nature}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {cats.map(renderCategoryCard)}
                                </div>
                            </div>
                        ))}
                    </TabsContent>
                ))}
            </Tabs>

            <AddEditCategoryDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                editingCategory={editingCategory}
                onAddCategory={onAddCategory}
                onUpdateCategory={onUpdateCategory}
            />
        </div>
    );
}
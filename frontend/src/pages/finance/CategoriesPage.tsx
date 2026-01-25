import React from 'react';
import { CategoryManager } from '@/components/categories/CategoryManager';
import { useFinance } from '@/hooks/useFinance'; // Make sure this hook exposes category mutations
import { Spinner } from '@/components/ui/spinner';

export function CategoriesPage() {
    const { categories, isLoading, addCategory, updateCategory, deleteCategory } = useFinance();

    if (isLoading) return <Spinner />;

    return (
        <div className="min-h-screen bg-background">
            <main className="container py-8">
                <CategoryManager
                    categories={categories}
                    onAddCategory={addCategory}
                    onUpdateCategory={updateCategory}
                    onDeleteCategory={deleteCategory}
                />
            </main>
        </div>
    );
}
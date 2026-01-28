import { useFinance } from '@/hooks/useFinance';
import { CategoryManager } from '@/components/categories/CategoryManager';
import { Spinner } from '@/components/ui/spinner';

export default function CategoriesPage() {
    const {
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        isLoading
    } = useFinance();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Categories</h1>
                    <p className="text-muted-foreground mt-1">Configure your income and expense labels</p>
                </div>
            </div>

            <CategoryManager
                categories={categories}
                onAddCategory={addCategory}
                onUpdateCategory={updateCategory}
                onDeleteCategory={deleteCategory}
            />
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category, CategoryCreateDto, CategoryNature, CategoryUpdateDto, TransactionType } from '@/types/finance';
import * as Icons from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddEditCategoryDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    editingCategory: Category | null;
    onAddCategory: (category: CategoryCreateDto) => void;
    onUpdateCategory: (id: string, updates: Partial<CategoryUpdateDto>) => void;
}

// A curated list of good category icons
const ICONS = ['Circle', 'ShoppingBag', 'Home', 'Car', 'Briefcase', 'HeartPulse', 'Tv', 'Utensils', 'Shield', 'TrendingUp', 'Wallet', 'PiggyBank', 'Zap', 'ShoppingCart', 'Users', 'Coffee'];
const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e'];

export function AddEditCategoryDialog({ isOpen, onOpenChange, editingCategory, onAddCategory, onUpdateCategory }: AddEditCategoryDialogProps) {
    const [name, setName] = useState('');
    const [type, setType] = useState<TransactionType>('expense');
    const [nature, setNature] = useState<CategoryNature>('variable');
    const [iconSlug, setIconSlug] = useState('Circle');
    const [color, setColor] = useState('#84cc16');

    useEffect(() => {
        if (isOpen) {
            if (editingCategory) {
                setName(editingCategory.name);
                setNature(editingCategory.nature);
                setIconSlug(editingCategory.iconSlug || 'Circle');
                setColor(editingCategory.color || '#84cc16');
            } else {
                setName('');
                setType('expense');
                setNature('variable');
                setIconSlug('Circle');
                setColor('#84cc16');
            }
        }
    }, [isOpen, editingCategory]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            onUpdateCategory(editingCategory.id, { name, iconSlug, color });
        } else {
            onAddCategory({ name, type, nature, iconSlug, color });
        }
        onOpenChange(false);
    };

    const SelectedIcon = (Icons as any)[iconSlug] || Icons.Circle;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                    <ScrollArea className="flex-1 p-6 pt-2">
                        <div className="space-y-4 py-2">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full shrink-0" style={{ backgroundColor: `${color}20` }}>
                                    <SelectedIcon className="h-6 w-6" style={{ color }} />
                                </div>
                                <Input placeholder="Category Name" value={name} onChange={e => setName(e.target.value)} required />
                            </div>

                            {!editingCategory && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <Select value={type} onValueChange={(v) => setType(v as TransactionType)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="expense">Expense</SelectItem>
                                                <SelectItem value="income">Income</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Nature</Label>
                                        <Select value={nature} onValueChange={(v) => setNature(v as CategoryNature)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="fixed">Fixed</SelectItem>
                                                <SelectItem value="variable">Variable</SelectItem>
                                                <SelectItem value="savings">Savings</SelectItem>
                                                <SelectItem value="investment">Investment</SelectItem>
                                                <SelectItem value="emergency">Emergency</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Color</Label>
                                <div className="flex flex-wrap gap-2">
                                    {COLORS.map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setColor(c)}
                                            className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-primary' : 'border-transparent'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Icon</Label>
                                <div className="flex flex-wrap gap-2 h-40 overflow-y-auto p-2 border rounded-md">
                                    {ICONS.map(iconName => {
                                        const IconComponent = (Icons as any)[iconName];
                                        return (
                                            <Button
                                                key={iconName}
                                                type="button"
                                                variant={iconSlug === iconName ? 'default' : 'ghost'}
                                                size="icon"
                                                onClick={() => setIconSlug(iconName)}
                                            >
                                                <IconComponent className="h-4 w-4" />
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <div className="flex justify-end gap-2 p-6 pt-2 border-t mt-auto">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit">{editingCategory ? 'Save Changes' : 'Add Category'}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
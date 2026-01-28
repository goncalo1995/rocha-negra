import { useEffect, useState } from 'react';
import { Asset, AssetCreateDto, AssetType } from '@/types/finance';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { assetTypeConfig } from './AssetManager';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';

interface AddAssetDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    editingAsset: Asset | null;
    onAddAsset: (asset: AssetCreateDto) => void;
    onUpdateAsset: (assetId: string, updatedAsset: Partial<Asset>) => void;
    baseCurrency: string;
}

const AddAssetDialog = ({ isOpen, onOpenChange, editingAsset, onAddAsset, onUpdateAsset, baseCurrency }: AddAssetDialogProps) => {
    const { toast } = useToast();

    // Form state
    const [name, setName] = useState('');
    const [type, setType] = useState<AssetType>('bank_account');
    const [currentValue, setCurrentValue] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (editingAsset) {
                // We are editing: populate the form with the asset's data
                setName(editingAsset.name);
                setType(editingAsset.type);
                // Use the correct fields based on your final Asset type
                setCurrentValue(String(editingAsset.balance ?? editingAsset.quantity ?? ''));
                setDescription(editingAsset.description || '');
            } else {
                // We are adding: reset the form to its initial state
                resetForm();
            }
        }
    }, [isOpen, editingAsset]); // This effect runs whenever the dialog opens or the asset to edit changes

    const onClose = () => {
        onOpenChange(false);
        // No need to call resetForm here, the useEffect handles it when the dialog re-opens
    };

    const resetForm = () => {
        setName('');
        setType('bank_account');
        setCurrentValue('');
        setDescription('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const value = parseFloat(currentValue);
        if (isNaN(value)) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Invalid value',
            });
            return;
        }

        if (editingAsset) {
            onUpdateAsset(editingAsset.id, {
                name,
                type,
                description,
            });
        } else {
            onAddAsset({
                name,
                type,
                initialValue: value,
                currency: baseCurrency,
                description,
                institution: '',
                customFields: {},
            });
        }

        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Asset
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
                    <DialogDescription>
                        {editingAsset ? 'Update the details of your asset.' : 'Add a new asset to track your wealth.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                    <ScrollArea className="flex-1 p-6 pt-2">
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Main Bank Account"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select value={type} onValueChange={(v) => setType(v as AssetType)} disabled={editingAsset !== null}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(Object.entries(assetTypeConfig) as [AssetType, typeof assetTypeConfig.cash][]).map(
                                            ([key, config]) => (
                                                <SelectItem key={key} value={key}>
                                                    <div className="flex items-center gap-2">
                                                        <config.icon className={cn('h-4 w-4', config.color)} />
                                                        {config.label}
                                                    </div>
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="value">
                                    {editingAsset ? 'Current Value (€)' : 'Initial Value (€)'}
                                </Label>
                                <Input
                                    id="value"
                                    type="number"
                                    step="0.01"
                                    placeholder="1000.00"
                                    value={currentValue}
                                    onChange={(e) => setCurrentValue(e.target.value)}
                                    disabled={editingAsset !== null}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (optional)</Label>
                                <Input
                                    id="description"
                                    placeholder="Any notes about this asset"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div>
                    </ScrollArea>
                    <div className="flex justify-end gap-2 p-6 pt-2 border-t mt-auto">
                        <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
                        <Button type="submit">{editingAsset ? 'Save Changes' : 'Add Asset'}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddAssetDialog;

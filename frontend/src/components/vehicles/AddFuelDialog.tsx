import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Vehicle } from '@/types/vehicles';
import { Asset } from '@/types/finance';

interface AddFuelDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    vehicles: Vehicle[];
    assets: Asset[];
    //   onAddFuelLog: (logData: FuelLogCreateDto) => void;
}

const initialFormState = {
    vehicleId: '',
    date: new Date().toISOString().split('T')[0],
    mileageAtFill: '',
    quantity: '',
    quantityUnit: 'liters',
    pricePerUnit: '',
    totalCost: '',
    fullTank: false,
    station: '',
    syncToFinance: true,
    assetId: '',
};

export function AddFuelDialog({ isOpen, onOpenChange, vehicles, assets }: AddFuelDialogProps) {
    const [form, setForm] = useState(initialFormState);
    const [lastEdited, setLastEdited] = useState<'price' | 'total'>('price');

    // Effect to handle the smart calculation
    useEffect(() => {
        const q = parseFloat(form.quantity) || 0;
        const p = parseFloat(form.pricePerUnit) || 0;
        const t = parseFloat(form.totalCost) || 0;

        if (lastEdited === 'price') {
            // If user edited quantity or price, calculate total
            if (q > 0 && p > 0) {
                setForm(prev => ({ ...prev, totalCost: (q * p).toFixed(2) }));
            }
        } else { // lastEdited === 'total'
            // If user edited total cost, calculate price per unit
            if (q > 0 && t > 0) {
                setForm(prev => ({ ...prev, pricePerUnit: (t / q).toFixed(3) }));
            }
        }
    }, [form.quantity, form.pricePerUnit, form.totalCost, lastEdited]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validate required fields...
        if (!form.vehicleId || (form.syncToFinance && !form.assetId)) {
            alert("Please fill all required fields.");
            return;
        }

        // Convert string inputs to the correct types for the DTO
        const logData = {
            ...form,
            quantity: parseFloat(form.quantity),
            totalCost: parseFloat(form.totalCost),
            mileageAtFill: parseFloat(form.mileageAtFill),
        };

        // We don't send pricePerUnit to the backend
        delete (logData as any).pricePerUnit;

        // onAddFuelLog(logData);
        onOpenChange(false);
        setForm(initialFormState); // Reset form after submission
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Log Fuel</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Vehicle Select */}
                    {/* Date and Mileage Inputs */}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Quantity</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="number" step="0.01" value={form.quantity}
                                    onChange={(e) => {
                                        setForm(prev => ({ ...prev, quantity: e.target.value }));
                                        setLastEdited('price'); // Recalculate total cost
                                    }}
                                    required
                                />
                                <Select value={form.quantityUnit} onValueChange={(value) => setForm(prev => ({ ...prev, quantityUnit: value as any }))}>
                                    {/* ... Select options ... */}
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>Price per Unit</Label>
                            <Input
                                type="number" step="0.001" value={form.pricePerUnit}
                                // When this is edited, totalCost will be auto-calculated
                                onChange={(e) => {
                                    setForm(prev => ({ ...prev, pricePerUnit: e.target.value }));
                                    setLastEdited('price');
                                }}
                                disabled={lastEdited === 'total'} // Disable if user is editing total cost
                            />
                        </div>
                        <div>
                            <Label>Total Cost</Label>
                            <Input
                                type="number" step="0.01" value={form.totalCost}
                                // When this is edited, pricePerUnit will be auto-calculated
                                onChange={(e) => {
                                    setForm(prev => ({ ...prev, totalCost: e.target.value }));
                                    setLastEdited('total');
                                }}
                                disabled={lastEdited === 'price'} // Disable if user is editing price/qty
                                required
                            />
                        </div>
                    </div>

                    {/* ... other fields like Full Tank, Station, Sync to Finance ... */}

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit">Log Fuel</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckedState } from '@radix-ui/react-checkbox';

// Form for a single domain (can be its own component)
const SingleDomainForm = ({ onSubmit, baseCurrency }) => {
    const [name, setName] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [currentPrice, setCurrentPrice] = useState('');
    const [registrar, setRegistrar] = useState('');
    const [registrationDate, setRegistrationDate] = useState('');
    const [autoRenew, setAutoRenew] = useState(true);
    const [notes, setNotes] = useState('');

    const handleSubmit = () => {
        onSubmit({
            name,
            expirationDate,
            currentPrice: parseFloat(currentPrice),
            registrar,
            registrationDate,
            autoRenew,
            notes,
        });
    };

    return (
        <div className="space-y-4">
            <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Domain Name"
            />
            <Input
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                type="date"
                placeholder="Expiration Date"
            />
            <Input
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                placeholder="Current Price"
            />
            <Input
                value={registrar}
                onChange={(e) => setRegistrar(e.target.value)}
                placeholder="Registrar"
            />
            <Input
                value={registrationDate}
                onChange={(e) => setRegistrationDate(e.target.value)}
                type="date"
                placeholder="Registration Date"
            />
            <Checkbox
                checked={autoRenew}
                onCheckedChange={(checked: CheckedState) => setAutoRenew(Boolean(checked))}
            >Auto-Renew</Checkbox>
            <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes"
            />
            <Button onClick={handleSubmit}>Add Domain</Button>
        </div>
    );
};

// Form for bulk import
const BulkImportForm = ({ onSubmit }) => {
    const [text, setText] = useState('');

    const handleBulkSubmit = () => {
        // Parse the text area content into an array of DomainCreate objects
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const domainsToCreate = lines.map(line => {
            const [name, expirationDate, currentPrice] = line.split(/\s+/);
            // Basic validation
            if (!name || !expirationDate || !currentPrice) return null;
            return {
                name,
                expirationDate,
                currentPrice: parseFloat(currentPrice),
                // Provide defaults for other required fields
                registrar: 'Unknown',
                registrationDate: new Date().toISOString().split('T')[0],
                currency: 'EUR', // Or from user prefs
                autoRenew: true,
                notes: 'Bulk Imported',
            };
        }).filter(Boolean); // Filter out any invalid lines

        if (domainsToCreate.length === 0) {
            toast.error("No valid domains found to import. Format: name.com YYYY-MM-DD price");
            return;
        }

        // Call the bulk submission function
        onSubmit(domainsToCreate);
    };

    return (
        <div className="space-y-4">
            <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste domains here, one per line.&#10;Format: example.com 2027-01-20 12.99"
                rows={10}
            />
            <Button onClick={handleBulkSubmit} className="w-full">Import {text.split('\n').filter(l => l.trim()).length} Domains</Button>
        </div>
    );
};

export function AddDomainDialog({ isOpen, onOpenChange, onAddDomain, onAddDomainsBulk, baseCurrency }) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader><DialogTitle>Add Domain(s)</DialogTitle></DialogHeader>
                <Tabs defaultValue="single">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="single">Single Domain</TabsTrigger>
                        <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
                    </TabsList>
                    <TabsContent value="single" className="pt-4">
                        <SingleDomainForm onSubmit={onAddDomain} baseCurrency={baseCurrency} />
                    </TabsContent>
                    <TabsContent value="bulk" className="pt-4">
                        <BulkImportForm onSubmit={onAddDomainsBulk} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
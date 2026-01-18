import React, { useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Category, Asset, TransactionType } from '@/types/finance';
import { Upload, FileText, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { parse, format, isValid } from 'date-fns';

interface BankImportDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    categories: Category[];
    assets: Asset[];
    onImport: (transactions: any[]) => Promise<void>;
}

type ColumnMapping = {
    date: string;
    description: string;
    amount: string;
    debit?: string;
    credit?: string;
    category?: string;
};

export function BankImportDialog({
    isOpen,
    onOpenChange,
    categories,
    assets,
    onImport,
}: BankImportDialogProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [fileData, setFileData] = useState<string[][]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<ColumnMapping>({
        date: '',
        description: '',
        amount: '',
    });
    const [selectedAssetId, setSelectedAssetId] = useState<string>('');
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                // Detect separator (semicolon or comma)
                const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
                if (lines.length === 0) throw new Error('File is empty');

                let separator = ';';
                if (lines[0].includes(',') && !lines[0].includes(';')) separator = ',';

                // Find header row (the one with most columns)
                // or just take the first line that looks like a header (contains "Data" or "Date")
                let headerIndex = lines.findIndex(l => l.toLowerCase().includes('data') || l.toLowerCase().includes('date') || l.toLowerCase().includes('descri'));
                if (headerIndex === -1) headerIndex = 0;

                const parsedData = lines.slice(headerIndex).map(line => line.split(separator).map(col => col.trim().replace(/^"|"$/g, '')));
                const headers = parsedData[0];
                const dataRows = parsedData.slice(1);

                setHeaders(headers);
                setFileData(dataRows);
                setStep(2);
            } catch (error) {
                toast.error('Failed to parse file. Please check the format.');
            }
        };
        reader.readAsText(file);
    };

    const parseNumber = (val: string): number => {
        if (!val) return 0;
        // Handle European format (comma as decimal separator)
        const normalized = val.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
        return parseFloat(normalized) || 0;
    };

    const parseDate = (val: string): string => {
        // Try common formats: DD-MM-YYYY, YYYY-MM-DD, DD/MM/YYYY
        const formats = ['dd-MM-yyyy', 'yyyy-MM-dd', 'dd/MM/yyyy', 'MM/dd/yyyy'];
        for (const f of formats) {
            const d = parse(val, f, new Date());
            if (isValid(d)) return format(d, 'yyyy-MM-dd');
        }
        return val; // Fallback to raw string
    };

    const handleImportClick = async () => {
        if (!selectedAssetId) {
            toast.error('Please select an account');
            return;
        }

        setIsImporting(true);
        try {
            const transactions = fileData.map(row => {
                const dateIdx = headers.indexOf(mapping.date);
                const descIdx = headers.indexOf(mapping.description);
                const amountIdx = mapping.amount ? headers.indexOf(mapping.amount) : -1;
                const debitIdx = mapping.debit ? headers.indexOf(mapping.debit) : -1;
                const creditIdx = mapping.credit ? headers.indexOf(mapping.credit) : -1;

                let amount = 0;
                if (amountIdx !== -1) {
                    amount = parseNumber(row[amountIdx]);
                } else {
                    const debit = parseNumber(row[debitIdx]);
                    const credit = parseNumber(row[creditIdx]);
                    amount = credit !== 0 ? credit : -debit;
                }

                const type: TransactionType = amount >= 0 ? 'income' : 'expense';

                // Auto-assign category if possible (mapping later or just Misc)
                const category = categories.find(c => c.name.toLowerCase() === 'diversos' || c.name.toLowerCase() === 'miscellaneous') || categories[0];

                return {
                    description: row[descIdx] || 'Bank Transaction',
                    amount: Math.abs(amount),
                    date: parseDate(row[dateIdx]),
                    type,
                    categoryId: category?.id,
                    assetId: selectedAssetId,
                    isRecurring: false,
                };
            }).filter(t => t.amount !== 0);

            await onImport(transactions);
            toast.success(`Imported ${transactions.length} transactions successfully!`);
            onOpenChange(false);
            setStep(1);
        } catch (error) {
            toast.error('Import failed. Please verify your mappings.');
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Import Bank Statement</DialogTitle>
                    <DialogDescription>
                        Upload a CSV or Excel export from your bank to import transactions.
                    </DialogDescription>
                </DialogHeader>

                {step === 1 && (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4 border-2 border-dashed rounded-lg">
                        <Upload className="w-12 h-12 text-muted-foreground opacity-50" />
                        <div className="text-center">
                            <p className="text-sm font-medium">Click to upload or drag and drop</p>
                            <p className="text-xs text-muted-foreground">CSV files supported</p>
                        </div>
                        <Input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                        <Button onClick={() => fileInputRef.current?.click()}>Select File</Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <Alert>
                            <FileText className="h-4 w-4" />
                            <AlertDescription>
                                We found {fileData.length} rows. Please map the columns below.
                            </AlertDescription>
                        </Alert>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date Column</Label>
                                <Select value={mapping.date} onValueChange={(v) => setMapping(prev => ({ ...prev, date: v }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select column" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Description Column</Label>
                                <Select value={mapping.description} onValueChange={(v) => setMapping(prev => ({ ...prev, description: v }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select column" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Amount Type</Label>
                                <Select
                                    value={mapping.amount ? 'single' : 'debit_credit'}
                                    onValueChange={(v) => {
                                        if (v === 'single') setMapping(prev => ({ ...prev, debit: undefined, credit: undefined, amount: headers[0] }));
                                        else setMapping(prev => ({ ...prev, amount: '', debit: headers[0], credit: headers[0] }));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="single">Single Amount Column</SelectItem>
                                        <SelectItem value="debit_credit">Separate Debit/Credit Columns</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {mapping.amount !== '' ? (
                                <div className="space-y-2">
                                    <Label>Amount Column</Label>
                                    <Select value={mapping.amount} onValueChange={(v) => setMapping(prev => ({ ...prev, amount: v }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select column" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label>Debit Column</Label>
                                        <Select value={mapping.debit} onValueChange={(v) => setMapping(prev => ({ ...prev, debit: v }))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select column" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Credit Column</Label>
                                        <Select value={mapping.credit} onValueChange={(v) => setMapping(prev => ({ ...prev, credit: v }))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select column" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}

                            <div className="space-y-2 col-span-2">
                                <Label>Target Account</Label>
                                <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select the bank account for these transactions" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {assets.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="border rounded-md overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Preview</TableHead>
                                        {headers.slice(0, 3).map(h => <TableHead key={h}>{h}</TableHead>)}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fileData.slice(0, 3).map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="text-xs text-muted-foreground">Row {i + 1}</TableCell>
                                            {row.slice(0, 3).map((col, j) => <TableCell key={j} className="text-xs">{col}</TableCell>)}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                            <Button
                                onClick={handleImportClick}
                                disabled={!mapping.date || !mapping.description || (!mapping.amount && (!mapping.debit || !mapping.credit)) || !selectedAssetId || isImporting}
                            >
                                {isImporting ? 'Importing...' : 'Import Transactions'}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

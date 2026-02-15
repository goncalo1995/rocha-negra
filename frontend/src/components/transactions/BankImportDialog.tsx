import React, { useState, useRef, useMemo } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Category, Asset, TransactionType } from '@/types/finance';
import { Upload, FileText, CheckCircle2, ChevronRight, AlertCircle, Search, SlidersHorizontal, Check, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';
import { parse, format, isValid } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    debit: string;
    credit: string;
};

interface PendingTransaction {
    id: string;
    date: string;
    description: string;
    amountOriginal: number;
    type: TransactionType;
    categoryId: string;
    destinationAssetId: string;
    selected: boolean;
}

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
        debit: '',
        credit: '',
    });
    const [selectedAssetId, setSelectedAssetId] = useState<string>('');
    const [isImporting, setIsImporting] = useState(false);
    const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filtered headers for Select components (no empty strings)
    const validHeaders = useMemo(() => headers.filter(h => h && h.trim() !== ""), [headers]);

    const suggestCategory = (description: string, type: TransactionType): string => {
        const desc = description.toLowerCase();

        // Basic keywords
        const keywordMap: Record<string, string[]> = {
            'Communication': ['nos', 'vodafone', 'meo', 'telecom'],
            'Shopping': ['compra', 'market', 'amazon', 'continente', 'pingo doce', 'auchan', 'lidl'],
            'Dining': ['restaurante', 'bar', 'cafe', 'uber eats', 'bolt food'],
            'Transport': ['uber', 'bolt', 'galp', 'repsol', 'prio', 'shell', 'bp', 'cp', 'carris', 'via verde'],
            'Housing': ['renda', 'condominio', 'edp', 'aguas', 'gas'],
            'Leisure': ['netflix', 'spotify', 'disney+', 'playstation', 'cinema'],
            'Health': ['farmacia', 'hospital', 'clinica', 'saude'],
            'Salary': ['vencimento', 'remuneracao', 'salary', 'ordenado'],
            'Transfers': ['transferencia', 'transfer', 'TFI', 'MBWAY'],
        };

        // Filter categories by type first
        const eligibleCategories = categories.filter(c => c.type === type);

        for (const [catName, keywords] of Object.entries(keywordMap)) {
            if (keywords.some(kw => desc.includes(kw))) {
                const found = eligibleCategories.find(c => c.name.toLowerCase().includes(catName.toLowerCase()));
                if (found) return found.id;
            }
        }

        // Default or first eligible
        const defaultCat = eligibleCategories.find(c => c.name.toLowerCase() === 'diversos' || c.name.toLowerCase() === 'miscellaneous');
        return defaultCat?.id || eligibleCategories[0]?.id || '';
    };

    const parseNumber = (val: string): number => {
        if (!val || val.trim() === '') return 0;
        const normalized = val.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
        return parseFloat(normalized) || 0;
    };

    const parseDate = (val: string): string => {
        const formats = ['dd-MM-yyyy', 'yyyy-MM-dd', 'dd/MM/yyyy', 'MM/dd/yyyy'];
        for (const f of formats) {
            const d = parse(val, f, new Date());
            if (isValid(d)) return format(d, 'yyyy-MM-dd');
        }
        return val;
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const allLines = text.split(/\r?\n/).filter(l => l.trim() !== '');

                let headerIndex = allLines.findIndex(l =>
                    l.toLowerCase().includes('data mov') ||
                    l.toLowerCase().includes('data valor') ||
                    l.toLowerCase().includes('date') ||
                    l.toLowerCase().includes('descri')
                );

                if (headerIndex === -1) headerIndex = 0;

                const lines = allLines.slice(headerIndex);
                let separator = ';';
                if (lines[0].includes(',') && !lines[0].includes(';')) separator = ',';

                const parsedData = lines.map(line => line.split(separator).map(col => col.trim().replace(/^"|"$/g, '')));
                const rawHeaders = parsedData[0];
                const dataRows = parsedData.slice(1).filter(row => row.length > 1);

                setHeaders(rawHeaders);
                setFileData(dataRows);

                const newMapping: ColumnMapping = { date: '', description: '', amount: '', debit: '', credit: '' };
                rawHeaders.forEach(h => {
                    const low = h.toLowerCase();
                    if (low.includes('data mov') || (low.includes('data') && !low.includes('valor'))) newMapping.date = h;
                    if (low.includes('descri') || low.includes('detalhe')) newMapping.description = h;
                    if (low.includes('valor') || low.includes('montante') || low.includes('amount')) newMapping.amount = h;
                    if (low.includes('dbito') || low.includes('debito') || low.includes('debit') || low.includes('DÈbito')) newMapping.debit = h;
                    if (low.includes('crdito') || low.includes('credito') || low.includes('credit') || low.includes('CrÈdito')) newMapping.credit = h;
                });

                setMapping(newMapping);
                setStep(2);
            } catch (error) {
                toast.error('Failed to parse file.');
            }
        };
        reader.readAsText(file);
    };

    const processToReview = () => {
        if (!selectedAssetId) return toast.error('Please select an account');
        if (!mapping.date || !mapping.description) return toast.error('Check Date and Description mappings');

        const isDebitCredit = mapping.debit && mapping.credit;
        if (!mapping.amount && !isDebitCredit) return toast.error('Map either Amount or Debit/Credit columns');

        const transactions: PendingTransaction[] = fileData.map((row, idx) => {
            const dateIdx = headers.indexOf(mapping.date);
            const descIdx = headers.indexOf(mapping.description);
            const amountIdx = mapping.amount ? headers.indexOf(mapping.amount) : -1;
            const debitIdx = mapping.debit ? headers.indexOf(mapping.debit) : -1;
            const creditIdx = mapping.credit ? headers.indexOf(mapping.credit) : -1;

            let amount = 0;
            if (amountIdx !== -1 && row[amountIdx]) {
                amount = parseNumber(row[amountIdx]);
            } else {
                const debit = debitIdx !== -1 ? parseNumber(row[debitIdx]) : 0;
                const credit = creditIdx !== -1 ? parseNumber(row[creditIdx]) : 0;
                amount = (credit !== 0) ? credit : -debit;
            }

            const description = row[descIdx] || 'Bank Transaction';
            const type = (amount >= 0 ? 'income' : 'expense') as TransactionType;
            return {
                id: `pending-${idx}`,
                date: parseDate(row[dateIdx]),
                description,
                amountOriginal: Math.abs(amount),
                type,
                categoryId: suggestCategory(description, type),
                destinationAssetId: '',
                selected: true,
            };
        }).filter(t => t.amountOriginal !== 0);

        setPendingTransactions(transactions);
        setStep(3);
    };

    const handleImportFinal = async () => {
        const toImport = pendingTransactions
            .filter(t => t.selected)
            .map(t => ({
                description: t.description,
                amountOriginal: t.amountOriginal,
                date: t.date,
                type: t.type,
                categoryId: t.categoryId,
                assetId: selectedAssetId,
                currencyOriginal: "EUR",
                destinationAssetId: t.type === 'transfer' ? t.destinationAssetId : null,
                isRecurring: false,
            }));

        if (toImport.length === 0) return toast.error('No transactions selected');

        // Validate transfers
        if (toImport.some(t => t.type === 'transfer' && !t.destinationAssetId)) {
            return toast.error('Please select a destination for all transfers');
        }

        setIsImporting(true);
        try {
            await onImport(toImport);
            toast.success(`Imported ${toImport.length} transactions!`);
            onOpenChange(false);
            setStep(1);
        } catch (error) {
            toast.error('Import failed.');
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className={step === 3 ? "sm:max-w-5xl max-h-[90vh]" : "sm:max-w-[700px] max-h-[90vh]"}>
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant={step >= 1 ? "default" : "outline"} className="h-6 w-6 rounded-full p-0 flex items-center justify-center">1</Badge>
                        <div className={`h-px w-8 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                        <Badge variant={step >= 2 ? "default" : "outline"} className="h-6 w-6 rounded-full p-0 flex items-center justify-center">2</Badge>
                        <div className={`h-px w-8 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
                        <Badge variant={step >= 3 ? "default" : "outline"} className="h-6 w-6 rounded-full p-0 flex items-center justify-center">3</Badge>
                    </div>
                    <DialogTitle>
                        {step === 1 && "Step 1: Upload Bank Statement"}
                        {step === 2 && "Step 2: Map Columns & Account"}
                        {step === 3 && "Step 3: Review & Categorize"}
                    </DialogTitle>
                </DialogHeader>

                {step === 1 && (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4 border-2 border-dashed rounded-lg bg-accent/10">
                        <Upload className="w-12 h-12 text-muted-foreground opacity-50" />
                        <div className="text-center">
                            <p className="text-sm font-medium">Click to upload or drag and drop</p>
                            <p className="text-xs text-muted-foreground">CSV files supported</p>
                        </div>
                        <Input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                        <Button onClick={() => fileInputRef.current?.click()}>Select File</Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date Column</Label>
                                <Select value={mapping.date} onValueChange={(v) => setMapping(prev => ({ ...prev, date: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select column" /></SelectTrigger>
                                    <SelectContent>{validHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Description Column</Label>
                                <Select value={mapping.description} onValueChange={(v) => setMapping(prev => ({ ...prev, description: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select column" /></SelectTrigger>
                                    <SelectContent>{validHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 col-span-2">
                                <Label>Target Account</Label>
                                <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                                    <SelectTrigger><SelectValue placeholder="Select target account" /></SelectTrigger>
                                    <SelectContent>{assets.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Amount Type</Label>
                                <Select
                                    value={mapping.amount ? 'single' : 'debit_credit'}
                                    onValueChange={(v) => {
                                        if (v === 'single') setMapping(prev => ({ ...prev, amount: validHeaders[0] || '', debit: '', credit: '' }));
                                        else setMapping(prev => ({ ...prev, amount: '', debit: validHeaders.find(h => h.toLowerCase().includes('dbit')) || validHeaders[0] || '', credit: validHeaders.find(h => h.toLowerCase().includes('crdit')) || validHeaders[1] || '' }));
                                    }}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                                        <SelectTrigger><SelectValue placeholder="Select column" /></SelectTrigger>
                                        <SelectContent>{validHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label>Debit Column</Label>
                                        <Select value={mapping.debit || undefined} onValueChange={(v) => setMapping(prev => ({ ...prev, debit: v }))}>
                                            <SelectTrigger><SelectValue placeholder="Select column" /></SelectTrigger>
                                            <SelectContent>{validHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Credit Column</Label>
                                        <Select value={mapping.credit || undefined} onValueChange={(v) => setMapping(prev => ({ ...prev, credit: v }))}>
                                            <SelectTrigger><SelectValue placeholder="Select column" /></SelectTrigger>
                                            <SelectContent>{validHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                            <Button onClick={processToReview}>Review Transactions <ChevronRight className="ml-2 h-4 w-4" /></Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="flex flex-col h-full max-h-[60vh] space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <div className="text-sm font-medium">{pendingTransactions.filter(t => t.selected).length} selected / {pendingTransactions.length} total</div>
                            <Button variant="ghost" size="sm" onClick={() => {
                                const allSelected = pendingTransactions.every(t => t.selected);
                                setPendingTransactions(prev => prev.map(t => ({ ...t, selected: !allSelected })));
                            }}>{pendingTransactions.every(t => t.selected) ? "Deselect All" : "Select All"}</Button>
                        </div>
                        <ScrollArea className="flex-1 border rounded-md">
                            <Table>
                                <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                                    <TableRow>
                                        <TableHead className="w-[40px]"></TableHead>
                                        <TableHead className="w-[80px]">Type</TableHead>
                                        <TableHead className="w-[100px]">Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="w-[150px]">Category/Asset</TableHead>
                                        <TableHead className="text-right w-[100px]">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingTransactions.map((tx) => (
                                        <TableRow key={tx.id} className={tx.selected ? "" : "opacity-40"}>
                                            <TableCell><Checkbox checked={tx.selected} onCheckedChange={(checked) => setPendingTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, selected: !!checked } : t))} /></TableCell>
                                            <TableCell>
                                                <Select value={tx.type} onValueChange={(v: TransactionType) => {
                                                    setPendingTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, type: v, categoryId: suggestCategory(t.description, v) } : t));
                                                }}>
                                                    <SelectTrigger className="h-8 border-transparent hover:bg-accent px-1 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="expense">Expense</SelectItem>
                                                        <SelectItem value="income">Income</SelectItem>
                                                        <SelectItem value="transfer">Transfer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-xs">{format(new Date(tx.date), 'dd/MM/yy')}</TableCell>
                                            <TableCell><Input className="h-8 text-xs border-transparent hover:border-input focus:border-input bg-transparent px-2" value={tx.description} onChange={(e) => setPendingTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, description: e.target.value } : t))} /></TableCell>
                                            <TableCell>
                                                {tx.type === 'transfer' ? (
                                                    <Select value={tx.destinationAssetId} onValueChange={(v) => setPendingTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, destinationAssetId: v } : t))}>
                                                        <SelectTrigger className="h-8 text-xs px-2 border-orange-200 bg-orange-50/30">
                                                            <SelectValue placeholder="To asset..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {assets.filter(a => a.id !== selectedAssetId).map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <Select value={tx.categoryId} onValueChange={(v) => setPendingTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, categoryId: v } : t))}>
                                                        <SelectTrigger className="h-8 text-xs px-2"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            {categories.filter(c => c.type === tx.type).map(c => <SelectItem key={c.id} value={c.id} className="text-xs"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />{c.name}</div></SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </TableCell>
                                            <TableCell className={`text-right font-medium text-xs ${tx.type === 'income' ? 'text-green-500' : tx.type === 'transfer' ? 'text-orange-500' : ''}`}>
                                                {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}{tx.amountOriginal.toFixed(2)}€
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                        <div className="flex justify-between pt-2">
                            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                            <Button onClick={handleImportFinal} disabled={isImporting || pendingTransactions.filter(t => t.selected).length === 0}>{isImporting ? 'Importing...' : `Import ${pendingTransactions.filter(t => t.selected).length} Transactions`}</Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

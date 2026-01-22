import React, { useState } from 'react';
import { Plus, Globe, Calendar, DollarSign, Trash2, Edit2, ExternalLink, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Domain, DomainCreate, DomainUpdate } from '@/types/it';
import { formatCurrency } from '@/lib/formatters';
import { format, differenceInDays } from 'date-fns';
// import { AddDomainDialog } from './AddDomainDialog';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

interface DomainManagerProps {
  domains: Domain[];
  onAddDomain: (domain: DomainCreate) => void;
  onAddDomainsBulk: (domains: DomainCreate[]) => void;
  onUpdateDomain: (variables: { id: string; updates: DomainUpdate }) => void;
  onDeleteDomain: (id: string) => void;
  baseCurrency: string;
}

// --- INITIAL STATE FOR THE FORM ---
const initialFormData = {
  name: '',
  registrar: '',
  registrationDate: '',
  expirationDate: '',
  status: 'active',
  autoRenew: true,
  currentPrice: '',
  currency: 'EUR',
  notes: '',
};

const DomainManager: React.FC<DomainManagerProps> = ({
  domains,
  onAddDomain,
  onAddDomainsBulk,
  onUpdateDomain,
  onDeleteDomain,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [formData, setFormData] = useState(initialFormData);

  // --- BULK ADD STATE ---
  const [bulkText, setBulkText] = useState('');
  const [domainsToCreate, setDomainsToCreate] = useState<DomainCreate[]>([]);

  const resetForms = () => {
    setFormData(initialFormData);
    setEditingDomain(null);
    setBulkText('');
    setDomainsToCreate([]);
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const domainData: DomainCreate = {
      name: formData.name,
      registrar: formData.registrar,
      registrationDate: formData.registrationDate,
      expirationDate: formData.expirationDate,
      status: formData.status,
      autoRenew: formData.autoRenew,
      currentPrice: parseFloat(formData.currentPrice) || 0,
      currency: formData.currency || 'EUR',//baseCurrency,
      notes: formData.notes,
    };

    if (editingDomain) {
      // Create an update DTO - for now, we'll use a subset
      const updateData: DomainUpdate = {
        name: formData.name,
        registrar: formData.registrar,
        registrationDate: formData.registrationDate,
        expirationDate: formData.expirationDate,
        status: formData.status,
        autoRenew: formData.autoRenew,
        currentPrice: parseFloat(formData.currentPrice) || 0,
        currency: formData.currency || 'EUR',//baseCurrency,
        notes: formData.notes,
      };
      onUpdateDomain({ id: editingDomain.id, updates: updateData });
      toast.success("Domain updated!");
    } else {
      onAddDomain(domainData);
      toast.success("Domain added!");
    }

    resetForms();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (domain: Domain) => {
    setEditingDomain(domain);
    setFormData({
      name: domain.name,
      registrar: domain.registrar || '',
      registrationDate: domain.registrationDate,
      expirationDate: domain.expirationDate,
      status: domain.status,
      autoRenew: domain.autoRenew,
      currentPrice: domain.currentPrice.toString(),
      currency: domain.currency,
      notes: domain.notes || '',
    });
    setIsAddDialogOpen(true);
  };

  // --- BULK ADD LOGIC ---
  const addFromBulkLine = () => {
    // This is the "Add to list" button logic
    const lines = bulkText.split('\n').filter(line => line.trim() !== '');
    const newDomains: DomainCreate[] = lines.map(line => {
      const [name, expirationDate, currentPrice] = line.split(/\s+/);
      if (!name || !expirationDate || !currentPrice) return null;
      return {
        name,
        registrar: formData.registrar, // Use the common registrar
        registrationDate: formData.registrationDate, // Use the common registration date
        expirationDate,
        autoRenew: formData.autoRenew,
        currentPrice: parseFloat(currentPrice),
        currency: formData.currency || 'EUR',//baseCurrency,
        notes: '',
      };
    }).filter(Boolean) as DomainCreate[];

    if (newDomains.length > 0) {
      setDomainsToCreate(prev => [...prev, ...newDomains]);
      setBulkText(''); // Clear textarea after adding
    } else {
      toast.error("Invalid format. Use: name.com YYYY-MM-DD price");
    }
  };

  const handleBulkSubmit = () => {
    if (domainsToCreate.length === 0) {
      toast.error("No domains in the list to create.");
      return;
    }
    onAddDomainsBulk(domainsToCreate);
    toast.success(`${domainsToCreate.length} domains are being added.`);
    resetForms();
    setIsAddDialogOpen(false);
  };

  const getExpirationStatus = (expirationDate: string) => {
    const days = differenceInDays(new Date(expirationDate), new Date());
    if (days < 0) return { label: 'Expired', variant: 'destructive' as const };
    if (days <= 30) return { label: `${days}d left`, variant: 'destructive' as const };
    if (days <= 90) return { label: `${days}d left`, variant: 'outline' as const };

    return { label: format(new Date(expirationDate), 'MMM d, yyyy'), variant: 'secondary' as const };
  };

  const getPriceChange = (domain: Domain) => {
    if (domain.priceHistory.length < 2) return null;
    const current = domain.currentPrice;
    const previous = domain.priceHistory[domain.priceHistory.length - 2].price;
    const change = ((current - previous) / previous) * 100;
    return change;
  };

  const sortedActiveDomains = domains ? domains?.filter(domain => new Date(domain.expirationDate).getTime() > new Date().getTime()).sort(
    (a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
  ) : [];

  const sortedExpiredDomains = domains ? domains?.filter(domain => new Date(domain.expirationDate).getTime() < new Date().getTime()).sort(
    (a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
  ) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Domains</h2>
          <p className="text-sm text-muted-foreground">Track your domain portfolio and renewals</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForms();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingDomain ? 'Edit Domain' : 'Add Domain'}</DialogTitle>
              <DialogDescription>
                {editingDomain ? 'Update domain details' : 'Add a new domain to track'}
              </DialogDescription>
            </DialogHeader>

            {/* <Tabs defaultValue="single" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single" disabled={!!editingDomain}>Single</TabsTrigger>
                <TabsTrigger value="bulk" disabled={!!editingDomain}>Bulk</TabsTrigger>
              </TabsList>

              <TabsContent value="single"> */}
            <form onSubmit={handleSingleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Domain Name</Label>
                  <Input
                    id="name"
                    placeholder="example.com"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="registrar">Provider</Label>
                  <Input
                    id="registrar"
                    placeholder="e.g., Namecheap, Cloudflare"
                    value={formData.registrar}
                    onChange={(e) => setFormData(prev => ({ ...prev, registrar: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="registrationDate">Registration Date</Label>
                  <Input
                    id="registrationDate"
                    type="date"
                    value={formData.registrationDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, registrationDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expirationDate">Expiration Date</Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  >
                    <option value="active">Active</option>
                    <option value="parked">Parked</option>
                    <option value="for_sale">For Sale</option>
                    <option value="expired">Expired</option>
                  </select>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Used for portfolio filtering and lifecycle tracking
                  </p>
                </div>
                <div>
                  <Label htmlFor="currentPrice">Annual Price</Label>
                  <Input
                    id="currentPrice"
                    type="number"
                    step="0.01"
                    placeholder="12.99"
                    value={formData.currentPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentPrice: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    placeholder="EUR"
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  />
                </div>
                <div className="col-span-2 flex items-center justify-between">
                  <Label htmlFor="autoRenew">Auto-Renew</Label>
                  <Switch
                    id="autoRenew"
                    checked={formData.autoRenew}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoRenew: checked }))}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Optional notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  resetForms();
                  setIsAddDialogOpen(false);
                }}>
                  Cancel
                </Button>
                <Button type="submit">{editingDomain ? 'Update' : 'Add'} Domain</Button>
              </div>
            </form>
            {/* </TabsContent>

              <TabsContent value="bulk">
                <div className="space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">Set common details first, then add domains to the list below.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Provider (Registrar)</Label>
                      <Input placeholder="e.g., Namecheap" value={formData.registrar} onChange={e => setFormData(f => ({ ...f, registrar: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Common Reg. Date</Label>
                      <Input type="date" value={formData.registrationDate} onChange={e => setFormData(f => ({ ...f, registrationDate: e.target.value }))} />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Label>Paste Domains Here</Label>
                    <Textarea
                      placeholder="rochanegra.io 2027-01-20 12.99&#10;another.com 2026-05-10 10.50"
                      rows={5}
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                    />
                    <Button type="button" variant="secondary" className="mt-2 w-full" onClick={addFromBulkLine}>
                      Add to List
                    </Button>
                  </div>

                  {domainsToCreate.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Domains to be Created ({domainsToCreate.length})</h4>
                      <div className="max-h-48 overflow-y-auto space-y-2 rounded-md bg-muted p-2">
                        {domainsToCreate.map((domain, index) => (
                          <div key={index} className="flex justify-between items-center text-sm p-2 bg-background rounded">
                            <span>{domain.name}</span>
                            <span className="text-muted-foreground">{domain.expirationDate}</span>
                            <span className="font-mono">{formatCurrency(domain.currentPrice, domain.currency)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button onClick={handleBulkSubmit} className="w-full" disabled={domainsToCreate.length === 0}>
                    Create {domainsToCreate.length} Domains
                  </Button>
                </div>
              </TabsContent>
            </Tabs> */}
          </DialogContent>
        </Dialog>
      </div>

      {/* Domain List */}
      {domains?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No domains yet</h3>
            <p className="text-sm text-muted-foreground">Add your first domain to start tracking</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedActiveDomains.map((domain) => {
            const status = getExpirationStatus(domain.expirationDate);
            const priceChange = getPriceChange(domain);

            return (
              <Card key={domain.id} className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-base">{domain.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(domain)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => onDeleteDomain(domain.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{domain.registrar}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Expires</span>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <DollarSign className="h-3 w-3" />
                      <span>Annual</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatCurrency(domain.currentPrice)}</span>
                      {priceChange !== null && priceChange !== 0 && (
                        <Badge variant={priceChange > 0 ? 'destructive' : 'default'} className="text-xs">
                          <TrendingUp className={`mr-1 h-3 w-3 ${priceChange < 0 ? 'rotate-180' : ''}`} />
                          {Math.abs(priceChange).toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={
                      domain.status === 'expired'
                        ? 'destructive'
                        : domain.status === 'for_sale'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {domain.status?.replace('_', ' ')}
                  </Badge>
                  {domain.autoRenew && (
                    <Badge variant="outline" className="text-xs">Auto-Renew</Badge>
                  )}
                  {domain.notes && (
                    <p className="text-xs text-muted-foreground">{domain.notes}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {sortedExpiredDomains?.length > 0 && (
        <Collapsible defaultOpen={false} className="space-y-4">
          <CollapsibleTrigger asChild>
            <button
              className="group flex w-full items-center justify-between rounded-lg border bg-muted/40 px-4 py-3 text-left transition hover:bg-muted"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-destructive">
                  Expired Domains
                </span>

                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                  {sortedExpiredDomains.length}
                </span>
              </div>

              <svg
                className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-3">
            {sortedExpiredDomains.map((domain) => {
              const status = getExpirationStatus(domain.expirationDate);
              const priceChange = getPriceChange(domain);

              return (
                <Card
                  key={domain.id}
                  className="border-dashed bg-background/60"
                >
                  <CardContent className="flex items-center justify-between gap-4 py-4">
                    {/* Left */}
                    <div className="flex flex-col gap-1">
                      <span className="font-medium leading-none">
                        {domain.name}
                      </span>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {domain.registrar && (
                          <span>{domain.registrar}</span>
                        )}
                        <span>•</span>
                        <span>
                          Expired on {domain.expirationDate}
                        </span>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        {domain.currency} {domain.currentPrice.toFixed(2)}
                      </span>

                      <span className="rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
                        Expired
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      )}



      {/* The new, self-contained dialog for adding domains */}
      {/* <AddDomainDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddDomain={onAddDomain}
        onAddDomainsBulk={onAddDomainsBulk}
        baseCurrency={"EUR"}
      /> */}
    </div>
  );
};

export default DomainManager;

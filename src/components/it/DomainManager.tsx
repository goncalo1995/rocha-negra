import React, { useState } from 'react';
import { Plus, Globe, Calendar, DollarSign, Trash2, Edit2, ExternalLink, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Domain } from '@/types/it';
import { formatCurrency } from '@/lib/formatters';
import { format, differenceInDays } from 'date-fns';

interface DomainManagerProps {
  domains: Domain[];
  onAddDomain: (domain: Omit<Domain, 'id' | 'createdAt' | 'updatedAt' | 'priceHistory'>) => void;
  onUpdateDomain: (id: string, updates: Partial<Domain>) => void;
  onDeleteDomain: (id: string) => void;
}

const DomainManager: React.FC<DomainManagerProps> = ({
  domains,
  onAddDomain,
  onUpdateDomain,
  onDeleteDomain,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    registrar: '',
    registrationDate: '',
    expirationDate: '',
    autoRenew: true,
    currentPrice: '',
    currency: 'EUR',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      registrar: '',
      registrationDate: '',
      expirationDate: '',
      autoRenew: true,
      currentPrice: '',
      currency: 'EUR',
      notes: '',
    });
    setEditingDomain(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingDomain) {
      onUpdateDomain(editingDomain.id, {
        name: formData.name,
        registrar: formData.registrar,
        registrationDate: formData.registrationDate,
        expirationDate: formData.expirationDate,
        autoRenew: formData.autoRenew,
        currentPrice: parseFloat(formData.currentPrice) || 0,
        currency: formData.currency,
        notes: formData.notes,
      });
    } else {
      onAddDomain({
        name: formData.name,
        registrar: formData.registrar,
        registrationDate: formData.registrationDate,
        expirationDate: formData.expirationDate,
        autoRenew: formData.autoRenew,
        currentPrice: parseFloat(formData.currentPrice) || 0,
        currency: formData.currency,
        notes: formData.notes,
      });
    }
    
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (domain: Domain) => {
    setEditingDomain(domain);
    setFormData({
      name: domain.name,
      registrar: domain.registrar,
      registrationDate: domain.registrationDate,
      expirationDate: domain.expirationDate,
      autoRenew: domain.autoRenew,
      currentPrice: domain.currentPrice.toString(),
      currency: domain.currency,
      notes: domain.notes || '',
    });
    setIsAddDialogOpen(true);
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

  const sortedDomains = [...domains].sort(
    (a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
  );

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
          if (!open) resetForm();
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
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Label htmlFor="registrar">Registrar</Label>
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
                  resetForm();
                  setIsAddDialogOpen(false);
                }}>
                  Cancel
                </Button>
                <Button type="submit">{editingDomain ? 'Update' : 'Add'} Domain</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Domain List */}
      {sortedDomains.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No domains yet</h3>
            <p className="text-sm text-muted-foreground">Add your first domain to start tracking</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedDomains.map((domain) => {
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
    </div>
  );
};

export default DomainManager;

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardCockpit } from '@/components/dashboard/DashboardCockpit';
import { AssetManager } from '@/components/assets/AssetManager';
import { TransactionLog } from '@/components/transactions/TransactionLog';
import { QuickAddButton } from '@/components/transactions/QuickAddButton';
import { useFinance } from '@/hooks/useFinance';
import { LayoutDashboard, Wallet, Receipt, Mountain } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const {
    assets,
    categories,
    transactions,
    metrics,
    addAsset,
    updateAsset,
    deleteAsset,
    addTransaction,
    deleteTransaction,
  } = useFinance();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Mountain className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Rocha Negra</h1>
              <p className="text-xs text-muted-foreground">Personal Finance</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="assets" className="gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Assets</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="animate-fade-in">
            <DashboardCockpit 
              metrics={metrics} 
              transactions={transactions} 
              categories={categories} 
            />
          </TabsContent>

          <TabsContent value="assets" className="animate-fade-in">
            <AssetManager
              assets={assets}
              onAddAsset={addAsset}
              onUpdateAsset={updateAsset}
              onDeleteAsset={deleteAsset}
            />
          </TabsContent>

          <TabsContent value="transactions" className="animate-fade-in">
            <TransactionLog
              transactions={transactions}
              categories={categories}
              assets={assets}
              onDeleteTransaction={deleteTransaction}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Quick Add FAB */}
      <QuickAddButton
        categories={categories}
        assets={assets}
        onAddTransaction={addTransaction}
      />
    </div>
  );
};

export default Index;

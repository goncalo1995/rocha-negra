export interface Domain {
  id: string;
  name: string; // e.g., "example.com"
  registrar: string; // e.g., "Namecheap", "Cloudflare"
  registrationDate: string;
  expirationDate: string;
  autoRenew: boolean;
  // Pricing with history for tracking increases
  currentPrice: number;
  currency: string;
  priceHistory: DomainPriceChange[];
  // Finance integration
  linkedRecurringRuleId?: string;
  linkedAssetId?: string;
  // Metadata
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DomainPriceChange {
  date: string;
  price: number;
  reason?: string; // e.g., "Annual increase", "Promo ended"
}

export interface ITState {
  domains: Domain[];
}

export interface ITMetrics {
  totalDomains: number;
  expiringThisMonth: number;
  expiringThisYear: number;
  annualCost: number;
  nextRenewal: Domain | null;
}

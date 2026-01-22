export interface Domain {
  id: string;
  recurringGeneratorId: string | null;
  name: string;
  registrar: string | null;
  registrationDate: string; // 'YYYY-MM-DD'
  expirationDate: string;
  status: string;
  autoRenew: boolean;
  notes: string | null;
  currentPrice: number;
  currency: string;
  priceHistory: PriceHistoryDto[];
}

export interface PriceHistoryDto {
  price: number;
  currency: string;
  effectiveDate: string;
}

// DTO for CREATING a domain (matches backend DomainCreateDto)
export interface DomainCreate {
  name: string;
  registrar: string | null;
  registrationDate: string;
  expirationDate: string;
  status: string;
  autoRenew: boolean;
  notes: string | null;
  // Financial details for creating the recurring rule
  currentPrice: number;
  currency: string;
  categoryId?: string | null;
  assetId?: string | null;
}

// DTO for UPDATING a domain (matches a future backend DomainUpdateDto)
export interface DomainUpdate {
  name?: string;
  registrar?: string;
  registrationDate?: string;
  expirationDate?: string;
  status?: string;
  autoRenew?: boolean;
  currentPrice?: number;
  currency?: string;
  notes?: string;
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

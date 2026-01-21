-- === HOUSING MODULE SCHEMA ===

-- 1. Properties Table (The core "House" entity)
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL UNIQUE, -- 1-to-1 link to its financial asset
  name TEXT NOT NULL, -- e.g., "Main Home", "Beach House Rental"
  address TEXT,
  property_type TEXT, -- e.g., 'house', 'apartment', 'land'
  property_status TEXT, -- e.g., 'owned', 'rented', 'for_sale'
  -- ... other fields like square_footage, year_built, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- ... Add Indexes, RLS, and Triggers for 'properties'

CREATE INDEX idx_properties_user_id ON public.properties(user_id);

-- 2. Maintenance Logs Table (similar to vehicles)
CREATE TABLE public.property_maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL, -- e.g., "Fixed leaky faucet", "Pool cleaning"
  cost DECIMAL(10, 2) NOT NULL CHECK (cost >= 0),
  currency TEXT NOT NULL,
  date DATE NOT NULL,
  -- ... other fields like contractor_name, notes, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- ... Add Indexes and RLS for 'property_maintenance_logs'

-- 3. Rental Income Table (NEW CONCEPT)
CREATE TABLE public.rental_income_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  tenant_name TEXT,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL,
  date DATE NOT NULL,
  -- ... other fields like payment_method, notes, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- ... Add Indexes and RLS for 'rental_income_logs'

You will create a new package com.rochanegra.api.housing with the standard stack.
PropertyService.java:
createProperty(PropertyCreateDto): This is the key integration point.
It calls assetService.createAsset(...) to create a new financial Asset of type 'property' with the user-provided initialValue.
It creates a new Property entity in the properties table, storing the asset_id from the asset that was just created.
It returns a PropertyDto.
addMaintenanceLog(propertyId, ...):
Creates a property_maintenance_logs record.
Calls transactionService.createTransaction(...) to create an expense transaction.
Creates a record in transaction_links to link this new transaction to the propertyId with entity_type: 'property'.
addRentalIncome(propertyId, ...):
Creates a rental_income_logs record.
Calls transactionService.createTransaction(...) to create an income transaction.
Creates a record in transaction_links linking the transaction to the propertyId.


The "Add New Property" Frontend Workflow:
Page 1: Core Details
Property Name: "Beach House Rental"
Address, Type, etc.
Initial Value: "$500,000" (This will be the initialValue for the Asset).
Page 2: Recurring Expenses (Optional)
The UI presents a list of common housing expenses: "Mortgage", "Property Tax", "Insurance", "Water", "Gas", "Electricity", "Pool Guy".
For each one, there's a simple form: [Amount] [per] [Month/Year] [on date] [from account].
The user fills out the ones that apply. They can add custom ones.
Page 3: Recurring Income (Optional, for rentals)
A simple form for rental income: "Receive [Amount] [per] [Month] from [Tenant Name]."
On "Finish":
The frontend makes one API call to POST /api/v1/properties to create the Property and its linked Asset.
Then, it makes multiple API calls to POST /api/v1/recurring-generators for each recurring expense and income the user filled out.
For each created RecurringGenerator, it can then make a call to a new endpoint POST /api/v1/links to link that generator to the new propertyId.
This workflow is incredibly powerful for the user but uses the exact same, simple, robust backend endpoints you've already designed (/assets, /properties, /recurring-generators).


New Logic in DashboardService.getDashboardData():
It already calculates total income and expenses.
To get the "Housing Spend" card, it will make a new query:
Find all categories with system_key like 'CAT_HOUSING', 'CAT_MORTGAGE', 'CAT_UTILITIES'.
Call transactionRepository.sumAmountByUserIdAndCategoriesAndDateBetween(...) to get the total spent this month for just those categories.
To get the projected housing spend, it will:
Fetch all active RecurringGenerators.
Filter them down to only those whose TransactionTemplate is linked to a housing category.
Sum their monthly-equivalent amounts.
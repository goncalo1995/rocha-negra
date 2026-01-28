-- Rocha Negra Finance Module - Supabase Migration
-- Run this in the Supabase SQL Editor

-- 1. Create custom types
CREATE TYPE public.asset_type AS ENUM ('bank_account', 'cash', 'investment', 'crypto', 'stock', 'property', 'vehicle', 'jewelry', 'other');
CREATE TYPE public.liability_type AS ENUM ('loan', 'credit_card', 'mortgage', 'other');
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense', 'transfer');
CREATE TYPE public.category_nature AS ENUM ('fixed', 'variable', 'savings', 'investment', 'emergency');
CREATE TYPE public.recurring_frequency AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly');
CREATE TYPE public.linkable_entity_type AS ENUM ('vehicle', 'liability', 'property', 'project');

-- 2. Create profiles table (links to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create assets and liabilities table
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type public.asset_type NOT NULL,

  -- For unit-based assets (crypto, stocks)
  currency TEXT NOT NULL DEFAULT 'EUR',
  quantity DECIMAL(20,8), -- The number of units held (e.g., 0.003)
  -- For currency-based assets (bank accounts, cash)
  -- The 'currency' column above will hold 'EUR', 'USD', etc.
  balance DECIMAL(15, 2), -- The amount of money in the account

  institution TEXT,
  description TEXT,
  custom_fields JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.liabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type public.liability_type NOT NULL,
  currency TEXT NOT NULL,
  initial_amount DECIMAL(15,2) NOT NULL,
  current_balance DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2),
  description TEXT,
  custom_fields JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  system_key TEXT, -- e.g., 'CAT_FUEL', 'CAT_SALARY', 'CAT_MAINTENANCE'
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  nature public.category_nature NOT NULL,
  icon_slug TEXT NOT NULL DEFAULT 'circle',
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- This creates a unique constraint that ONLY applies to non-null system keys.
CREATE UNIQUE INDEX unique_system_key_per_user_if_not_null
ON public.categories (user_id, system_key)
WHERE (system_key IS NOT NULL);

-- Recurring Generators (The "Template")
CREATE TABLE public.recurring_generators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  frequency public.recurring_frequency NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  next_due_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  custom_fields JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transaction Templates (The "Payload" for a Generator)
CREATE TABLE public.transaction_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generator_id UUID REFERENCES public.recurring_generators(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL,
  description_template TEXT, -- e.g., "Payment for {month}"
  type public.transaction_type NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  asset_id UUID REFERENCES public.assets(id),
  destination_asset_id UUID REFERENCES public.assets(id),
  effective_from_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions Table (Pure financial flow, with optional link to generator)
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  generator_id UUID REFERENCES public.recurring_generators(id) ON DELETE SET NULL,

  -- Original Amount (in the currency of the asset)
  amount_original DECIMAL(20, 8) NOT NULL,
  currency_original TEXT NOT NULL,
  -- Converted to User's Base Currency
  amount_base DECIMAL(20, 8) NOT NULL,
  exchange_rate DECIMAL(20, 8), -- The rate used for the conversion

  description TEXT NOT NULL,
  date DATE NOT NULL,
  type public.transaction_type NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  asset_id UUID REFERENCES public.assets(id),
  destination_asset_id UUID REFERENCES public.assets(id),
  attachment_url TEXT,
  custom_fields JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.transaction_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL,
  entity_id UUID NOT NULL, -- The ID of the vehicle, liability, etc.
  entity_type public.linkable_entity_type NOT NULL, -- The type of entity being linked
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.exchange_rates (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL, -- Changed from DATE
  base_currency TEXT NOT NULL, -- e.g., 'EUR'
  target_currency TEXT NOT NULL, -- e.g., 'USD'
  rate DECIMAL(20, 8) NOT NULL,
);

-- 7. Create indexes for better query performance
CREATE INDEX ON public.assets (user_id);
CREATE INDEX ON public.liabilities (user_id);
CREATE INDEX ON public.categories (user_id);
CREATE INDEX ON public.recurring_generators (user_id, next_due_date, is_active);
CREATE INDEX ON public.transaction_templates (generator_id, effective_from_date);
CREATE INDEX ON public.transactions (user_id, date DESC);
CREATE INDEX ON public.transactions (asset_id);
CREATE INDEX ON public.transactions (category_id);
CREATE INDEX idx_exchange_rates_latest ON public.exchange_rates (base_currency, target_currency, timestamp DESC);

-- Optimize Recurring/Projection logic
CREATE INDEX IF NOT EXISTS idx_generators_projection_lookup ON public.recurring_generators (user_id, is_active);
-- Optimize Projects/Tasks UI
CREATE INDEX IF NOT EXISTS idx_tasks_project_order ON public.tasks (project_id, position ASC);
CREATE INDEX IF NOT EXISTS idx_tasks_inbox_lookup ON public.tasks (created_by, created_at DESC) WHERE (project_id IS NULL);

-- Unique constraint to prevent duplicate links
ALTER TABLE public.exchange_rates ADD CONSTRAINT unique_rate_per_day UNIQUE (timestamp, base_currency, target_currency);

-- 8. Enable Row Level Security on ALL tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_generators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- 10. RLS Policies for assets
CREATE POLICY "Users can view own assets"
  ON public.assets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own assets"
  ON public.assets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own assets"
  ON public.assets FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own assets"
  ON public.assets FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own liabilities"
  ON public.liabilities FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own liabilities"
  ON public.liabilities FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own liabilities"
  ON public.liabilities FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own liabilities"
  ON public.liabilities FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 11. RLS Policies for categories
CREATE POLICY "Users can view own categories"
  ON public.categories FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own categories"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own categories"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own categories"
  ON public.categories FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 12. RLS Policies for transactions
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 13. RLS Policies for recurring_generators
CREATE POLICY "Users can view own recurring generators"
  ON public.recurring_generators FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own recurring generators"
  ON public.recurring_generators FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own recurring generators"
  ON public.recurring_generators FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own recurring generators"
  ON public.recurring_generators FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 13. RLS Policies for transaction_templates
CREATE POLICY "Users can view own transaction_templates"
  ON public.transaction_templates FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transaction_templates"
  ON public.transaction_templates FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own transaction_templates"
  ON public.transaction_templates FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own transaction_templates"
  ON public.transaction_templates FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 14. RLS Policies for exchange_rates
CREATE POLICY "Nobody can update exchange_rates"
  ON public.exchange_rates FOR ALL
  TO authenticated
  USING (false);

-- 16. Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- 15. Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 16. Create function to seed default categories for new users
CREATE OR REPLACE FUNCTION public.seed_default_categories()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.categories (user_id, system_key, name, type, nature, icon_slug, color) VALUES
    (NEW.id, 'CAT_SALARY', 'Salary', 'income', 'fixed', 'Wallet', '#10b981'),
    (NEW.id, 'CAT_FREELANCE', 'Freelance', 'income', 'variable', 'Briefcase', '#06b6d4'),
    (NEW.id, 'CAT_INVESTMENTS', 'Investments', 'income', 'variable', 'TrendingUp', '#8b5cf6'),
    (NEW.id, 'CAT_HOUSING', 'Housing', 'expense', 'fixed', 'Home', '#f59e0b'),
    (NEW.id, 'CAT_INSURANCE', 'Insurance', 'expense', 'fixed', 'Shield', '#6366f1'),
    (NEW.id, 'CAT_UTILITIES', 'Utilities', 'expense', 'fixed', 'Zap', '#ec4899'),
    (NEW.id, 'CAT_CAR_MAINTENANCE', 'Car Maintenance', 'expense', 'variable', 'Car', '#ef4444'),
    (NEW.id, 'CAT_FUEL', 'Fuel', 'expense', 'variable', 'Fuel', '#f97316'),
    (NEW.id, 'CAT_GROCERIES', 'Groceries', 'expense', 'variable', 'ShoppingCart', '#84cc16'),
    (NEW.id, 'CAT_DINING_OUT', 'Dining Out', 'expense', 'variable', 'Utensils', '#14b8a6'),
    (NEW.id, 'CAT_FRIENDS_SOCIAL', 'Friends & Social', 'expense', 'variable', 'Users', '#a855f7'),
    (NEW.id, 'CAT_ENTERTAINMENT', 'Entertainment', 'expense', 'variable', 'Tv', '#f43f5e'),
    (NEW.id, 'CAT_HEALTHCARE', 'Healthcare', 'expense', 'variable', 'HeartPulse', '#22c55e'),
    (NEW.id, 'CAT_SHOPPING', 'Shopping', 'expense', 'variable', 'ShoppingBag', '#3b82f6'),
    (NEW.id, 'CAT_EMERGENCY_FUND', 'Emergency Fund', 'expense', 'emergency', 'AlertTriangle', '#eab308'),
    (NEW.id, 'CAT_SAVINGS', 'Savings', 'expense', 'savings', 'PiggyBank', '#10b981');
  RETURN NEW;
END;
$$;

-- 17. Create trigger to seed categories on profile creation
CREATE TRIGGER on_profile_created_seed_categories
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.seed_default_categories();

-- 18. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 19. Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_liabilities_updated_at
  BEFORE UPDATE ON public.liabilities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recurring_generators_updated_at
  BEFORE UPDATE ON public.recurring_generators
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


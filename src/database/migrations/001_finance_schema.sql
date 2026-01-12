-- Rocha Negra Finance Module - Supabase Migration
-- Run this in the Supabase SQL Editor

-- 1. Create custom types
CREATE TYPE public.asset_type AS ENUM ('liquid_cash', 'investment', 'physical', 'liability');
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense', 'transfer');
CREATE TYPE public.category_nature AS ENUM ('fixed', 'variable', 'savings', 'emergency');
CREATE TYPE public.recurring_frequency AS ENUM ('weekly', 'monthly', 'yearly');

-- 2. Create profiles table (links to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create assets table
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type public.asset_type NOT NULL,
  current_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  nature public.category_nature NOT NULL,
  icon_slug TEXT NOT NULL DEFAULT 'circle',
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type public.transaction_type NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_rule_id UUID,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create recurring_rules table
CREATE TABLE public.recurring_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  frequency public.recurring_frequency NOT NULL,
  next_due_date DATE NOT NULL,
  projected_amount DECIMAL(15,2) NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for recurring_rule_id in transactions
ALTER TABLE public.transactions 
ADD CONSTRAINT fk_recurring_rule 
FOREIGN KEY (recurring_rule_id) REFERENCES public.recurring_rules(id) ON DELETE SET NULL;

-- 7. Create indexes for better query performance
CREATE INDEX idx_assets_user_id ON public.assets(user_id);
CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_transactions_category ON public.transactions(category_id);
CREATE INDEX idx_recurring_rules_user_id ON public.recurring_rules(user_id);
CREATE INDEX idx_recurring_rules_next_due ON public.recurring_rules(next_due_date);

-- 8. Enable Row Level Security on ALL tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_rules ENABLE ROW LEVEL SECURITY;

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

-- 13. RLS Policies for recurring_rules
CREATE POLICY "Users can view own recurring rules"
  ON public.recurring_rules FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own recurring rules"
  ON public.recurring_rules FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own recurring rules"
  ON public.recurring_rules FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own recurring rules"
  ON public.recurring_rules FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 14. Create function to handle new user signup
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
  INSERT INTO public.categories (user_id, name, type, nature, icon_slug, color) VALUES
    (NEW.id, 'Salary', 'income', 'fixed', 'wallet', '#10b981'),
    (NEW.id, 'Freelance', 'income', 'variable', 'briefcase', '#06b6d4'),
    (NEW.id, 'Investments', 'income', 'variable', 'trending-up', '#8b5cf6'),
    (NEW.id, 'Housing', 'expense', 'fixed', 'home', '#f59e0b'),
    (NEW.id, 'Insurance', 'expense', 'fixed', 'shield', '#6366f1'),
    (NEW.id, 'Utilities', 'expense', 'fixed', 'zap', '#ec4899'),
    (NEW.id, 'Car Maintenance', 'expense', 'variable', 'car', '#ef4444'),
    (NEW.id, 'Fuel', 'expense', 'variable', 'fuel', '#f97316'),
    (NEW.id, 'Groceries', 'expense', 'variable', 'shopping-cart', '#84cc16'),
    (NEW.id, 'Dining Out', 'expense', 'variable', 'utensils', '#14b8a6'),
    (NEW.id, 'Friends & Social', 'expense', 'variable', 'users', '#a855f7'),
    (NEW.id, 'Entertainment', 'expense', 'variable', 'tv', '#f43f5e'),
    (NEW.id, 'Healthcare', 'expense', 'variable', 'heart-pulse', '#22c55e'),
    (NEW.id, 'Shopping', 'expense', 'variable', 'shopping-bag', '#3b82f6'),
    (NEW.id, 'Emergency Fund', 'expense', 'emergency', 'alert-triangle', '#eab308'),
    (NEW.id, 'Savings', 'expense', 'savings', 'piggy-bank', '#10b981');
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

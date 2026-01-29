-- === DOMAINS MODULE SCHEMA ===

-- 1. Domains Table
CREATE TABLE public.domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recurring_generator_id UUID REFERENCES public.recurring_generators(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  registrar TEXT,
  status TEXT NOT NULL DEFAULT 'parked', -- 'active', 'parked', 'for_sale', 'expired'
  registration_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  auto_renew BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_domain_name_per_user UNIQUE (user_id, name)
);

-- Indexes
CREATE INDEX idx_domains_user_id ON public.domains(user_id);
CREATE INDEX idx_domains_expiration_date ON public.domains(expiration_date);

-- RLS
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own domains" ON public.domains FOR ALL USING (auth.uid() = user_id);

-- Trigger
CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON public.domains FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 2. Price History Table
CREATE TABLE public.domain_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES public.domains(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL,
  effective_date DATE NOT NULL, -- The date this price became active
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_domain_price_history_domain_id ON public.domain_price_history(domain_id);

-- RLS
ALTER TABLE public.domain_price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own domain price history" ON public.domain_price_history FOR ALL USING (auth.uid() = user_id);
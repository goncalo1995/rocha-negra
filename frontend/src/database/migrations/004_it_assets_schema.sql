-- === IT ASSETS MODULE SCHEMA (V1 - DOMAINS ONLY) ===

-- 1. Domains Table
CREATE TABLE public.domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recurring_generator_id UUID REFERENCES public.recurring_generators(id) ON DELETE SET NULL, -- Link to the financial rule
  name TEXT NOT NULL, -- e.g., "rochanegra.io"
  registrar TEXT, -- e.g., "Namecheap"
  registration_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  auto_renew BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Add Indexes, RLS, and Triggers for 'domains'

-- 2. Price History Table
-- This is crucial for tracking price changes over time.
CREATE TABLE public.domain_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES public.domains(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL,
  effective_date DATE NOT NULL, -- The date this price became active
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Add Indexes and RLS for 'domain_price_history'
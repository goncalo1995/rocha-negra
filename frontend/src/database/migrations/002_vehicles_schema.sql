-- Rocha Negra Vehicles Module - CORRECTED Supabase Migration

-- 1. Create vehicles table (matches the Java Entity)
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL, -- Link to the financial asset
  name TEXT NOT NULL,
  make TEXT,
  model TEXT,
  year INT,
  vin TEXT,
  license_plate TEXT,
  current_mileage DOUBLE PRECISION,
  mileage_unit TEXT DEFAULT 'km', -- 'km' or 'mi'
  fuel_type TEXT,
  fuel_unit TEXT DEFAULT 'liters', -- 'liters', 'gallons_us', 'gallons_uk'
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vehicles ADD CONSTRAINT check_mileage_unit CHECK (mileage_unit IN ('km', 'mi'));
ALTER TABLE public.vehicles ADD CONSTRAINT check_fuel_unit CHECK (fuel_unit IN ('liters', 'gallons_us', 'gallons_uk'));

-- 2. Create maintenance_logs table
CREATE TABLE public.maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  mileage_at_service DOUBLE PRECISION,
  cost DECIMAL(10, 2) NOT NULL CHECK (cost >= 0),
  currency TEXT DEFAULT 'EUR',
  service_provider TEXT,
  notes TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create fuel_logs table
CREATE TABLE public.fuel_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  quantity DECIMAL(10, 3) NOT NULL,
  quantity_unit TEXT NOT NULL,
  total_cost DECIMAL(10, 2) NOT NULL CHECK (total_cost >= 0),
  currency TEXT DEFAULT 'EUR',
  mileage_at_fill DOUBLE PRECISION,
  full_tank BOOLEAN DEFAULT FALSE,
  station TEXT,
  notes TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.fuel_logs ADD CONSTRAINT check_fuel_log_quantity_unit CHECK (quantity_unit IN ('liters', 'gallons_us', 'gallons_uk'));

-- 4. Create indexes
CREATE INDEX idx_vehicles_user_id ON public.vehicles(user_id);
CREATE INDEX idx_maintenance_logs_vehicle_id ON public.maintenance_logs(vehicle_id);
CREATE INDEX idx_fuel_logs_vehicle_id ON public.fuel_logs(vehicle_id);

-- 5. Enable Row Level Security
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_logs ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
CREATE POLICY "Users can manage their own vehicles" ON public.vehicles
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own maintenance logs" ON public.maintenance_logs
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own fuel logs" ON public.fuel_logs
  FOR ALL USING (user_id = auth.uid());

-- 7. Add updated_at trigger for vehicles (Requires the function from your first migration)
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
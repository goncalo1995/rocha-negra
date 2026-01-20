CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  preference_key TEXT NOT NULL,
  preference_value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure a user can only have one value for each key
  CONSTRAINT unique_user_preference_key UNIQUE (user_id, preference_key)
);

-- Add Indexes, RLS, and Triggers...
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Row Level Security
CREATE POLICY "Users can view own user preferences"
  ON public.user_preferences FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own user preferences"
  ON public.user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own user preferences"
  ON public.user_preferences FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own user preferences"
  ON public.user_preferences FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
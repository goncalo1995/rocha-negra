-- === UNIVERSAL LINK MODULE SCHEMA ===

-- 1. Drop the old, specific table if it exists
DROP TABLE IF EXISTS public.transaction_links;

-- 2. Create the new, generic entity_links table
CREATE TABLE public.entity_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- The "Subject" of the relationship
  source_entity_id UUID NOT NULL,
  source_entity_type TEXT NOT NULL, -- 'transaction', 'task', 'recurring_generator'
  
  -- The "Object" of the relationship
  target_entity_id UUID NOT NULL,
  target_entity_type TEXT NOT NULL, -- 'asset', 'liability', 'vehicle', 'domain', 'project'
  
  -- The "Verb" describing the relationship
  relation_type TEXT NOT NULL DEFAULT 'RELATED_TO', -- 'AFFECTS', 'PART_OF', 'FOR'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent exact duplicate links
  CONSTRAINT unique_entity_link UNIQUE (user_id, source_entity_id, target_entity_id, relation_type)
);

-- 3. Add Critical Indexes for performance
CREATE INDEX idx_entity_links_source ON public.entity_links(user_id, source_entity_id, source_entity_type);
CREATE INDEX idx_entity_links_target ON public.entity_links(user_id, target_entity_id, target_entity_type);

-- 4. Enable RLS
ALTER TABLE public.entity_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own links"
  ON public.entity_links FOR ALL
  USING (auth.uid() = user_id);
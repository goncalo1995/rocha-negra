-- === STEP 1: DEFINE THE CORE BLUEPRINT TABLE ===
-- This single table replaces project_details, roadmap_steps, and their join tables.

CREATE TABLE public.blueprint_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Link to the parent Project/Area node
    node_id UUID REFERENCES public.nodes(id) ON DELETE CASCADE NOT NULL,
    
    -- The core outline structure (self-referencing hierarchy)
    parent_id UUID REFERENCES public.blueprint_steps(id) ON DELETE CASCADE,
    
    -- Display order for steps at the same level
    "position" INT NOT NULL DEFAULT 0,
    
    -- Core Content
    title TEXT NOT NULL,
    description TEXT, -- The "Definition of Done" or key details
    
    -- Status Management (reusing the existing task_status enum)
    status public.task_status NOT NULL DEFAULT 'TODO',
    
    -- The "Intelligence" Layer
    context_node_ids UUID[], -- Specific PARA notes/resources to inform this step
    -- Note: assigned_agent_id will be added in a future migration when agents are built.
    
    -- Flexible details field for future expansion
    details JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for query performance
CREATE INDEX idx_blueprint_steps_node_id ON public.blueprint_steps(node_id);
CREATE INDEX idx_blueprint_steps_parent_id ON public.blueprint_steps(parent_id);

-- === STEP 2: DATA INTEGRITY & AUTOMATION TRIGGERS ===

-- A. Auto-update the 'updated_at' timestamp
CREATE TRIGGER update_blueprint_steps_updated_at
  BEFORE UPDATE ON public.blueprint_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- B. Function to ensure blueprints are only attached to PROJECT nodes
CREATE OR REPLACE FUNCTION enforce_blueprint_on_project_node() RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.nodes WHERE id = NEW.node_id AND type = 'PROJECT') THEN
    RAISE EXCEPTION 'Blueprints can only be attached to nodes of type PROJECT';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_blueprint_node_type
BEFORE INSERT OR UPDATE ON public.blueprint_steps
FOR EACH ROW EXECUTE FUNCTION enforce_blueprint_on_project_node();

-- C. Function to clean up blueprint data if a Node stops being a PROJECT
CREATE OR REPLACE FUNCTION cleanup_blueprint_on_type_change() RETURNS trigger AS $$
BEGIN
  IF OLD.type = 'PROJECT' AND NEW.type != 'PROJECT' THEN
    -- Purge the blueprint associated with this node as it's no longer a project
    DELETE FROM public.blueprint_steps WHERE node_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cleanup_blueprint_on_type_change
AFTER UPDATE ON public.nodes
FOR EACH ROW
WHEN (OLD.type IS DISTINCT FROM NEW.type)
EXECUTE FUNCTION cleanup_blueprint_on_type_change();


-- === STEP 3: ROW LEVEL SECURITY (RLS) ===
-- Assumes 'can_view_node(node_id)' and 'can_edit_node(node_id)' functions exist.

ALTER TABLE public.blueprint_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view steps of projects they can access"
  ON public.blueprint_steps FOR SELECT
  USING (public.can_view_node(node_id));
  
CREATE POLICY "Users with edit rights can manage blueprint steps"
  ON public.blueprint_steps FOR ALL -- Covers INSERT, UPDATE, DELETE
  USING (public.can_edit_node(node_id));



-- Left these becuase requires recreation of the enum type
-- Add new node types
-- Note: 'ALTER TYPE ... ADD VALUE' cannot be executed in a transaction block in some versions of Postgres.
-- If this fails, run it separately.
ALTER TYPE public.node_type ADD VALUE IF NOT EXISTS 'VERSION';
ALTER TYPE public.node_type ADD VALUE IF NOT EXISTS 'CHECKPOINT';
ALTER TYPE public.node_link_type ADD VALUE IF NOT EXISTS 'ASSOCIATED';
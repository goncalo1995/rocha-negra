-- 1. Create project_details (Capability Table for PROJECT type nodes)
-- Note: node_id is the PRIMARY KEY, enforcing a strict 1:1 relationship
CREATE TABLE public.project_details (
    node_id UUID PRIMARY KEY REFERENCES public.nodes(id) ON DELETE CASCADE,
    desired_outcome TEXT,
    main_risk TEXT,
    progress INT CHECK (progress BETWEEN 0 AND 100),
    is_ai_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create roadmap_steps (Now linked directly to a Node)
CREATE TABLE public.roadmap_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID REFERENCES public.nodes(id) ON DELETE CASCADE NOT NULL,
    parent_step_id UUID REFERENCES public.roadmap_steps(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'TODO',
    definition_of_done TEXT,
    prompt_template TEXT,
    position NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_roadmap_node_id ON public.roadmap_steps(node_id);

-- 3. Create context join table for multi-node referencing in roadmap steps
CREATE TABLE public.roadmap_step_context (
    step_id UUID REFERENCES public.roadmap_steps(id) ON DELETE CASCADE,
    node_id UUID REFERENCES public.nodes(id) ON DELETE CASCADE,
    PRIMARY KEY (step_id, node_id)
);

-- === THE CRITICAL TRIGGERS FOR DATA INTEGRITY ===

-- A. Prevent attaching project details or roadmaps to non-project nodes
CREATE OR REPLACE FUNCTION enforce_node_is_project() RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.nodes WHERE id = NEW.node_id AND type = 'PROJECT') THEN
    RAISE EXCEPTION 'This entity can only be attached to nodes of type PROJECT';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_project_details
BEFORE INSERT OR UPDATE ON public.project_details
FOR EACH ROW EXECUTE FUNCTION enforce_node_is_project();

CREATE TRIGGER trg_validate_roadmap_steps
BEFORE INSERT OR UPDATE ON public.roadmap_steps
FOR EACH ROW EXECUTE FUNCTION enforce_node_is_project();

-- B. Clean up project-specific data if a Node stops being a PROJECT (State Mutation Protection)
CREATE OR REPLACE FUNCTION cleanup_project_data_on_type_change() RETURNS trigger AS $$
BEGIN
  IF OLD.type = 'PROJECT' AND NEW.type != 'PROJECT' THEN
    -- Explicitly purge data as it is no longer valid for the new node type
    DELETE FROM public.project_details WHERE node_id = NEW.id;
    DELETE FROM public.roadmap_steps WHERE node_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cleanup_on_type_change
AFTER UPDATE ON public.nodes
FOR EACH ROW
WHEN (OLD.type IS DISTINCT FROM NEW.type)
EXECUTE FUNCTION cleanup_project_data_on_type_change();

-- Auto-update timestamps
CREATE TRIGGER update_project_details_updated_at
  BEFORE UPDATE ON public.project_details
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_roadmap_steps_updated_at
  BEFORE UPDATE ON public.roadmap_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- === ESSENTIAL SECURITY LAYER: ROW LEVEL SECURITY (RLS) ===
-- We assume the 'can_view_node(node_id)' and 'can_edit_node(node_id)' functions from the base schema already exist.

-- 1. Enable RLS on all new tables
ALTER TABLE public.project_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_step_context ENABLE ROW LEVEL SECURITY;

-- 2. Define Policies for project_details
CREATE POLICY "Users can view metadata of projects they can access"
  ON public.project_details FOR SELECT USING (public.can_view_node(node_id));
CREATE POLICY "Users with edit rights can manage project metadata"
  ON public.project_details FOR ALL USING (public.can_edit_node(node_id));

-- 3. Define Policies for roadmap_steps
CREATE POLICY "Users can view steps of projects they can access"
  ON public.roadmap_steps FOR SELECT USING (public.can_view_node(node_id));
CREATE POLICY "Users with edit rights can manage roadmap steps"
  ON public.roadmap_steps FOR ALL USING (public.can_edit_node(node_id));

-- 4. Define Policies for roadmap_step_context
CREATE POLICY "Users can view step context of projects they can access"
  ON public.roadmap_step_context FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.roadmap_steps WHERE id = step_id AND public.can_view_node(node_id)));
CREATE POLICY "Users with edit rights can manage step context"
  ON public.roadmap_step_context FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.roadmap_steps WHERE id = step_id AND public.can_edit_node(node_id)));
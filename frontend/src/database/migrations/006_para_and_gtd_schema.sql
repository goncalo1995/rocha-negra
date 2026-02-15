-- === PARA & GTD UNIFIED MODULE SCHEMA (V2.0 - PRODUCTION READY) ===

-- Create new, more generic ENUM types
CREATE TYPE public.node_type AS ENUM ('PROJECT', 'AREA', 'RESOURCE', 'GOAL');
CREATE TYPE public.node_status AS ENUM ('ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED');
CREATE TYPE public.node_role AS ENUM ('OWNER', 'EDITOR', 'VIEWER');
CREATE TYPE public.task_status AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'ARCHIVED', 'WAITING', 'SOMEDAY');
CREATE TYPE public.node_link_type AS ENUM ('REFERENCES', 'DEPENDS_ON', 'BELONGS_TO', 'SUPPORTS', 'RELATED_TO');

-- === STEP 2: CREATE THE UNIFIED 'NODES' TABLE (The Heart of PARA) ===
CREATE TABLE public.nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- The PARA category
  type public.node_type NOT NULL,
  
  -- Hierarchical structure (an Area can contain Projects, a Project can contain Resources)
  parent_id UUID REFERENCES public.nodes(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  
  -- Fields primarily for 'PROJECT' and 'GOAL' type nodes
  status public.node_status,
  start_date DATE,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  
  -- Fields primarily for 'RESOURCE' type nodes
  content TEXT, -- For notes/documents
  url TEXT,     -- For bookmarks
  storage_path TEXT, -- For file uploads
  
  custom_fields JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- === STEP 3: CREATE THE 'NODE_MEMBERS' TABLE (Replaces Project Members) ===
CREATE TABLE public.node_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID REFERENCES public.nodes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.node_role NOT NULL DEFAULT 'VIEWER',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_per_node UNIQUE (node_id, user_id)
);

-- === STEP 4: CREATE THE 'TASKS' TABLE (Now linked to Nodes) ===
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID REFERENCES public.nodes(id) ON DELETE SET NULL, -- A task is part of a Node (Project, Area, etc.)
  parent_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status public.task_status NOT NULL DEFAULT 'TODO',
  priority INT DEFAULT 2 CHECK (priority BETWEEN 1 AND 4),
  position INT,
  start_date DATE,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  custom_fields JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.node_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node_id UUID REFERENCES public.nodes(id) ON DELETE CASCADE NOT NULL,
  target_node_id UUID REFERENCES public.nodes(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  type public.node_link_type NOT NULL, 
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate links between the same two nodes
  CONSTRAINT unique_source_target_link UNIQUE (source_node_id, target_node_id, type)
);


-- === STEP 5: INDEXES & TRIGGERS ===
-- Indexes for 'nodes'
CREATE INDEX idx_nodes_user_id_type ON public.nodes(user_id, type);
CREATE INDEX idx_nodes_parent_id ON public.nodes(parent_id);
-- Indexes for 'node_members'
CREATE INDEX idx_node_members_user_id ON public.node_members(user_id);
-- Indexes for 'tasks'
CREATE INDEX idx_tasks_node_id ON public.tasks(node_id);
CREATE INDEX idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX idx_tasks_assignee_status_due ON public.tasks (assigned_to, status, due_date);
-- Indexes for 'node_links'
CREATE INDEX idx_node_links_source_id ON public.node_links(source_node_id);
CREATE INDEX idx_node_links_target_id ON public.node_links(target_node_id);

-- Triggers
CREATE TRIGGER update_nodes_updated_at BEFORE UPDATE ON public.nodes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- === STEP 6: HELPER FUNCTIONS (FOR SECURE RLS) ===

CREATE OR REPLACE FUNCTION public.can_view_node(p_node_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER -- Bypasses RLS for the internal check.
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.node_members
    WHERE node_id = p_node_id
      AND user_id = auth.uid()
  );
$$;


-- Function to check if the current user is an owner or editor of a specific node.
CREATE OR REPLACE FUNCTION public.can_edit_node(p_node_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER -- Crucial: Bypasses RLS for the internal check.
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.node_members
    WHERE node_id = p_node_id
      AND user_id = auth.uid()
      AND role IN ('OWNER', 'EDITOR')
  );
$$;

-- Function to check if the current user is an owner of a specific node.
CREATE OR REPLACE FUNCTION public.is_node_owner(p_node_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.node_members
    WHERE node_id = p_node_id
      AND user_id = auth.uid()
      AND role = 'OWNER'
  );
$$;

CREATE OR REPLACE FUNCTION public.create_node_and_add_owner(
  p_user_id UUID,
  p_type public.node_type,
  p_name TEXT,
  p_description TEXT,
  p_parent_id UUID,
  p_due_date DATE,
  p_status public.node_status DEFAULT 'ACTIVE'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Must be definer to insert into node_members on behalf of the user
AS $$
DECLARE
  new_node_id UUID;
BEGIN
  -- Insert the new node
  INSERT INTO public.nodes (user_id, type, name, description, parent_id, due_date, status)
  VALUES (p_user_id, p_type, p_name, p_description, p_parent_id, p_due_date, p_status)
  RETURNING id INTO new_node_id;

  -- Add the creator as the owner
  INSERT INTO public.node_members (node_id, user_id, role)
  VALUES (new_node_id, p_user_id, 'OWNER');
  
  RETURN new_node_id;
END;
$$;

-- === STEP 7: ROW LEVEL SECURITY (Applied to the new model) ===
ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.node_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.node_links ENABLE ROW LEVEL SECURITY;

-- Node Policies (A node is visible if you are a member OR if it's your personal node)
CREATE POLICY "Users can view nodes they are a member of or own" ON public.nodes FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM node_members WHERE node_id = nodes.id AND user_id = auth.uid()));

CREATE POLICY "Users can create their own nodes" ON public.nodes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners/editors can update nodes" ON public.nodes FOR UPDATE
  USING (public.can_edit_node(id));

CREATE POLICY "Owners can delete nodes" ON public.nodes FOR DELETE
  USING (public.is_node_owner(id));


-- == Node Members Policies ==
CREATE POLICY "Members can see other members in their nodes" ON public.node_members FOR SELECT
  USING (EXISTS (SELECT 1 FROM node_members pm_check WHERE pm_check.node_id = node_members.node_id AND pm_check.user_id = auth.uid()));

CREATE POLICY "Owners can add new members to their nodes" ON public.node_members FOR INSERT
  WITH CHECK (public.is_node_owner(node_id));

CREATE POLICY "Owners can update members in their nodes" ON public.node_members FOR UPDATE
  USING (public.is_node_owner(node_id));

CREATE POLICY "Owners can delete members in their nodes" ON public.node_members FOR DELETE
  USING (public.is_node_owner(node_id));

-- == Task Policies ==
CREATE POLICY "View personal tasks or tasks in member nodes" ON public.tasks FOR SELECT
  USING ((node_id IS NULL AND created_by = auth.uid()) OR (EXISTS (SELECT 1 FROM node_members WHERE node_id = tasks.node_id AND user_id = auth.uid())));
  
CREATE POLICY "Create personal tasks or in nodes they can edit" ON public.tasks FOR INSERT
  WITH CHECK ((node_id IS NULL AND created_by = auth.uid()) OR (public.can_edit_node(node_id)));

CREATE POLICY "Update tasks based on role or assignment" ON public.tasks FOR UPDATE
  USING ((node_id IS NULL AND created_by = auth.uid()) OR (assigned_to = auth.uid()) OR (public.can_edit_node(node_id)));

CREATE POLICY "Delete personal tasks or tasks in nodes they own" ON public.tasks FOR DELETE
  USING ((node_id IS NULL AND created_by = auth.uid()) OR (public.is_node_owner(node_id)));

-- == Node Links Policies ==
CREATE POLICY "Users can view links if they can view both connected nodes"
  ON public.node_links FOR SELECT
  USING (
    can_view_node(source_node_id) AND can_view_node(target_node_id)
  );

-- INSERT Policy: A user can create a link if they can EDIT the source node.
-- (They only need to be able to view the target node).
CREATE POLICY "Users can create links from nodes they can edit"
  ON public.node_links FOR INSERT
  WITH CHECK (
    can_edit_node(source_node_id) AND can_view_node(target_node_id)
  );

-- DELETE Policy: A user can delete a link if they can EDIT the source node.
CREATE POLICY "Users can delete links from nodes they can edit"
  ON public.node_links FOR DELETE
  USING (
    can_edit_node(source_node_id)
  );

-- NOTE: It's often safer to disallow UPDATE on join tables like this.
-- If a user needs to change a link, they can DELETE and re-CREATE it.
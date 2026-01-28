-- === PROJECTS & TASKS MODULE SCHEMA (V1.5 - ROBUST & SECURE) ===

-- === STEP 1: CREATE ROBUST ENUM TYPES ===
-- Using ENUMs instead of TEXT for data integrity, as recommended.
CREATE TYPE public.project_status AS ENUM ('active', 'on_hold', 'completed', 'archived');
CREATE TYPE public.project_role AS ENUM ('owner', 'editor', 'viewer'); -- 'member' is too ambiguous, role implies permission level.
CREATE TYPE public.task_status AS ENUM ('todo', 'in_progress', 'done', 'archived');

-- === STEP 2: CREATE CORE TABLES ===

-- Projects Table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status public.project_status NOT NULL DEFAULT 'active',
  start_date DATE,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  custom_fields JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Members Table
CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  -- FIX: Default to the safest, least-permissive role.
  role public.project_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_per_project UNIQUE (project_id, user_id)
);

-- Tasks Table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Hierarchy & Scoping
  parent_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,

  -- People
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Core Content
  title TEXT NOT NULL,
  description TEXT,
  
  -- State & Prioritization
  status public.task_status NOT NULL DEFAULT 'todo',
  priority INT DEFAULT 2 CHECK (priority BETWEEN 1 AND 4),
  position INT, -- For manual sorting
  
  -- Time Awareness
  start_date DATE,
  due_date DATE,
  completed_at TIMESTAMPTZ,

  custom_fields JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- === STEP 3: INDEXES FOR PERFORMANCE ===
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_project_members_user_id ON public.project_members(user_id);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
-- FIX: Added index for "tasks created by me" queries
CREATE INDEX idx_tasks_created_by ON public.tasks(created_by);
-- The CRITICAL composite index for "my tasks" / "agenda" views
CREATE INDEX idx_tasks_assignee_status_due ON public.tasks (assigned_to, status, due_date);


-- === STEP 4: TRIGGERS ===
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- === STEP 5: ROW LEVEL SECURITY (TIGHTENED) ===
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Project Policies
-- Note: INSERT for projects is handled by the 'create_project_and_add_owner' function.
CREATE POLICY "Users can view projects they are members of" ON public.projects FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.project_members WHERE project_id = id AND user_id = auth.uid()));

CREATE POLICY "Owners/editors can update projects" ON public.projects FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.project_members WHERE project_id = id AND user_id = auth.uid() AND role IN ('owner', 'editor')));
  
CREATE POLICY "Owners can delete projects" ON public.projects FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.project_members WHERE project_id = id AND user_id = auth.uid() AND role = 'owner'));

-- Project Members Policies
CREATE POLICY "Members can see who is in their project" ON public.project_members FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.project_members pm_check WHERE pm_check.project_id = project_members.project_id AND pm_check.user_id = auth.uid()));

CREATE POLICY "Owners can add members" ON public.project_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_members.project_id -- Check the project of the NEW row
        AND pm.user_id = auth.uid()
        AND pm.role = 'owner'
    )
  );

-- UPDATE policy needs both USING and WITH CHECK for maximum security
CREATE POLICY "Owners can update member roles in their projects" ON public.project_members FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.project_members pm_check WHERE pm_check.project_id = project_members.project_id AND pm_check.user_id = auth.uid() AND pm_check.role = 'owner'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.project_members pm_check WHERE pm_check.project_id = project_members.project_id AND pm_check.user_id = auth.uid() AND pm_check.role = 'owner'));

CREATE POLICY "Owners can remove members from their projects" ON public.project_members FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.project_members WHERE project_id = project_members.project_id AND user_id = auth.uid() AND role = 'owner'));

-- Tasks Policies
CREATE POLICY "Users can view personal tasks or tasks in their projects" ON public.tasks FOR SELECT
  USING ((project_id IS NULL AND created_by = auth.uid()) OR (EXISTS (SELECT 1 FROM project_members WHERE project_id = tasks.project_id AND user_id = auth.uid())));
  
CREATE POLICY "Users can create personal tasks or tasks in projects they can edit" ON public.tasks FOR INSERT
  WITH CHECK ((project_id IS NULL AND created_by = auth.uid()) OR (EXISTS (SELECT 1 FROM project_members WHERE project_id = tasks.project_id AND user_id = auth.uid() AND role IN ('owner', 'editor'))));

CREATE POLICY "Users can update tasks based on their role or assignment" ON public.tasks FOR UPDATE
  USING (
    ( -- Condition 1: It's a personal task I created
      project_id IS NULL AND created_by = auth.uid()
    ) OR (
      -- Condition 2: It's a project task and I am the assignee
      assigned_to = auth.uid()
    ) OR (
      -- Condition 3: It's a project task and I am an owner/editor of the project
      EXISTS (
        SELECT 1 FROM public.project_members pm
        WHERE pm.project_id = tasks.project_id
          AND pm.user_id = auth.uid()
          AND pm.role IN ('owner', 'editor')
      )
    )
  );

CREATE POLICY "Owners can delete tasks in their projects, users can delete their own personal tasks" ON public.tasks FOR DELETE
  USING ((project_id IS NULL AND created_by = auth.uid()) OR (EXISTS (SELECT 1 FROM project_members WHERE project_id = tasks.project_id AND user_id = auth.uid() AND role = 'owner')));

-- === STEP 6: HELPER FUNCTIONS ===
CREATE OR REPLACE FUNCTION public.create_project_and_add_owner(
  name TEXT,
  description TEXT,
  owner_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_project_id UUID;
BEGIN
  INSERT INTO public.projects (name, description)
  VALUES (name, description)
  RETURNING id INTO new_project_id;

  INSERT INTO public.project_members (project_id, user_id, role)
  VALUES (new_project_id, owner_id, 'owner');

  RETURN new_project_id;
END;
$$;
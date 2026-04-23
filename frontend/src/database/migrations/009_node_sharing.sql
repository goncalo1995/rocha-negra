-- 1. Columns on nodes table
ALTER TABLE public.nodes
    ADD COLUMN IF NOT EXISTS share_token UUID DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS share_enabled BOOLEAN DEFAULT false;

-- 2. Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_nodes_share_token ON public.nodes(share_token) 
    WHERE share_token IS NOT NULL AND share_enabled = true;

-- 3. Analytics table
CREATE TABLE IF NOT EXISTS public.node_share_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
    share_token UUID NOT NULL,
    visitor_ip VARCHAR(45),
    visitor_user_agent TEXT,
    visited_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_share_analytics_node_id ON public.node_share_analytics(node_id);
CREATE INDEX IF NOT EXISTS idx_share_analytics_visited_at ON public.node_share_analytics(visited_at);
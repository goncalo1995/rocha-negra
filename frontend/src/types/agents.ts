export type AgentModel = 'anthropic/claude-3-haiku' | 'anthropic/claude-3-5-sonnet' | 'openai/gpt-4o';

export interface AgentPersona {
  id: string;
  name: string;
  role_description: string;
  system_prompt_template: string;
  default_model: AgentModel;
  temperature: number;
  created_at: string;
  
  // Dummy UI helper stats
  stats?: {
    active_tasks: number;
    completed_tasks: number;
  };
}

export interface AgentWorker {
  id: string;
  persona_id: string;
  title: string;
  status: 'ACTIVE' | 'ARCHIVED';
  created_at: string;
  last_activity: string;
}

export interface AgentContextNode {
  id: string;
  type: 'PROJECT' | 'AREA' | 'RESOURCE' | 'GOAL';
  name: string;
}

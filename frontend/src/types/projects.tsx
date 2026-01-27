import { Database } from "./database.types";
import { FromDb } from "./utils";

export type Project = FromDb<Database['public']['Tables']['projects']['Row']>;
export type ProjectMember = FromDb<Database['public']['Tables']['project_members']['Row']>;

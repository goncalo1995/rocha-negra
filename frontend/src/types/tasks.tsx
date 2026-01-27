import { Database } from "./database.types";
import { FromDb } from "./utils";

export type Task = FromDb<Database['public']['Tables']['tasks']['Row']>;

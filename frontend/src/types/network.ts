import { Database } from "./database.types";
import { FromDb } from "./utils";

export type ContactCategory = Database['public']['Enums']['contact_category'];
export type Contact = FromDb<Database['public']['Tables']['contacts']['Row']>;

export interface CreateContactDto {
    firstName: string;
    lastName?: string;
    email?: string;
    phone?: string;
    company?: string;
    role?: string;
    category: ContactCategory;
    notes?: string;
    linkedinUrl?: string;
    avatarUrl?: string;
}

export interface UpdateContactDto extends Partial<CreateContactDto> { }

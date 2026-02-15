export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          balance: number | null
          created_at: string | null
          currency: string
          custom_fields: Json | null
          description: string | null
          id: string
          institution: string | null
          name: string
          quantity: number | null
          type: Database["public"]["Enums"]["asset_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          currency: string
          custom_fields?: Json | null
          description?: string | null
          id: string
          institution?: string | null
          name: string
          quantity?: number | null
          type: Database["public"]["Enums"]["asset_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          currency?: string
          custom_fields?: Json | null
          description?: string | null
          id?: string
          institution?: string | null
          name?: string
          quantity?: number | null
          type?: Database["public"]["Enums"]["asset_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          icon_slug: string
          id: string
          name: string
          nature: Database["public"]["Enums"]["category_nature"]
          system_key: string | null
          type: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon_slug?: string
          id?: string
          name: string
          nature: Database["public"]["Enums"]["category_nature"]
          system_key?: string | null
          type: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon_slug?: string
          id?: string
          name?: string
          nature?: Database["public"]["Enums"]["category_nature"]
          system_key?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          avatar_url: string | null
          category: Database["public"]["Enums"]["contact_category"]
          company: string | null
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string | null
          linkedin_url: string | null
          notes: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          category?: Database["public"]["Enums"]["contact_category"]
          company?: string | null
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name?: string | null
          linkedin_url?: string | null
          notes?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          category?: Database["public"]["Enums"]["contact_category"]
          company?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string | null
          linkedin_url?: string | null
          notes?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      domain_price_history: {
        Row: {
          created_at: string | null
          currency: string
          domain_id: string
          effective_date: string
          id: string
          price: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency: string
          domain_id: string
          effective_date: string
          id?: string
          price: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string
          domain_id?: string
          effective_date?: string
          id?: string
          price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "domain_price_history_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      domains: {
        Row: {
          auto_renew: boolean | null
          created_at: string | null
          expiration_date: string
          id: string
          name: string
          notes: string | null
          registrar: string | null
          registration_date: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string | null
          expiration_date: string
          id?: string
          name: string
          notes?: string | null
          registrar?: string | null
          registration_date: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string | null
          expiration_date?: string
          id?: string
          name?: string
          notes?: string | null
          registrar?: string | null
          registration_date?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      entity_links: {
        Row: {
          created_at: string | null
          id: string
          relation_type: string
          source_entity_id: string
          source_entity_type: string
          target_entity_id: string
          target_entity_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          relation_type?: string
          source_entity_id: string
          source_entity_type: string
          target_entity_id: string
          target_entity_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          relation_type?: string
          source_entity_id?: string
          source_entity_type?: string
          target_entity_id?: string
          target_entity_type?: string
          user_id?: string
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          base_currency: string
          id: number
          rate: number
          target_currency: string
          timestamp: string
        }
        Insert: {
          base_currency: string
          id?: number
          rate: number
          target_currency: string
          timestamp: string
        }
        Update: {
          base_currency?: string
          id?: number
          rate?: number
          target_currency?: string
          timestamp?: string
        }
        Relationships: []
      }
      fuel_logs: {
        Row: {
          created_at: string | null
          currency: string | null
          date: string
          full_tank: boolean | null
          id: string
          mileage_at_fill: number | null
          notes: string | null
          quantity: number
          quantity_unit: string
          station: string | null
          total_cost: number
          user_id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          date: string
          full_tank?: boolean | null
          id?: string
          mileage_at_fill?: number | null
          notes?: string | null
          quantity: number
          quantity_unit: string
          station?: string | null
          total_cost: number
          user_id: string
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          date?: string
          full_tank?: boolean | null
          id?: string
          mileage_at_fill?: number | null
          notes?: string | null
          quantity?: number
          quantity_unit?: string
          station?: string | null
          total_cost?: number
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fuel_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      liabilities: {
        Row: {
          created_at: string | null
          currency: string
          current_balance: number
          custom_fields: Json | null
          description: string | null
          id: string
          initial_amount: number
          interest_rate: number | null
          name: string
          type: Database["public"]["Enums"]["liability_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency: string
          current_balance: number
          custom_fields?: Json | null
          description?: string | null
          id?: string
          initial_amount: number
          interest_rate?: number | null
          name: string
          type: Database["public"]["Enums"]["liability_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string
          current_balance?: number
          custom_fields?: Json | null
          description?: string | null
          id?: string
          initial_amount?: number
          interest_rate?: number | null
          name?: string
          type?: Database["public"]["Enums"]["liability_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      maintenance_logs: {
        Row: {
          cost: number
          created_at: string | null
          currency: string | null
          date: string
          description: string
          id: string
          mileage_at_service: number | null
          notes: string | null
          service_provider: string | null
          type: string
          user_id: string
          vehicle_id: string
        }
        Insert: {
          cost: number
          created_at?: string | null
          currency?: string | null
          date: string
          description: string
          id?: string
          mileage_at_service?: number | null
          notes?: string | null
          service_provider?: string | null
          type: string
          user_id: string
          vehicle_id: string
        }
        Update: {
          cost?: number
          created_at?: string | null
          currency?: string | null
          date?: string
          description?: string
          id?: string
          mileage_at_service?: number | null
          notes?: string | null
          service_provider?: string | null
          type?: string
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      node_links: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          source_node_id: string
          target_node_id: string
          type: Database["public"]["Enums"]["node_link_type"]
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          source_node_id: string
          target_node_id: string
          type: Database["public"]["Enums"]["node_link_type"]
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          source_node_id?: string
          target_node_id?: string
          type?: Database["public"]["Enums"]["node_link_type"]
        }
        Relationships: [
          {
            foreignKeyName: "node_links_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "node_links_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      node_members: {
        Row: {
          created_at: string | null
          id: string
          node_id: string
          role: Database["public"]["Enums"]["node_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          node_id: string
          role?: Database["public"]["Enums"]["node_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          node_id?: string
          role?: Database["public"]["Enums"]["node_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "node_members_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      nodes: {
        Row: {
          completed_at: string | null
          content: string | null
          created_at: string | null
          custom_fields: Json | null
          description: string | null
          due_date: string | null
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["node_status"] | null
          storage_path: string | null
          type: Database["public"]["Enums"]["node_type"]
          updated_at: string | null
          url: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          content?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          description?: string | null
          due_date?: string | null
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["node_status"] | null
          storage_path?: string | null
          type: Database["public"]["Enums"]["node_type"]
          updated_at?: string | null
          url?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          content?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          description?: string | null
          due_date?: string | null
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["node_status"] | null
          storage_path?: string | null
          type?: Database["public"]["Enums"]["node_type"]
          updated_at?: string | null
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nodes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      recurring_generators: {
        Row: {
          created_at: string | null
          custom_fields: Json | null
          description: string
          end_date: string | null
          frequency: Database["public"]["Enums"]["recurring_frequency"]
          id: string
          is_active: boolean | null
          next_due_date: string
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          custom_fields?: Json | null
          description: string
          end_date?: string | null
          frequency: Database["public"]["Enums"]["recurring_frequency"]
          id?: string
          is_active?: boolean | null
          next_due_date: string
          start_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          custom_fields?: Json | null
          description?: string
          end_date?: string | null
          frequency?: Database["public"]["Enums"]["recurring_frequency"]
          id?: string
          is_active?: boolean | null
          next_due_date?: string
          start_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string
          custom_fields: Json | null
          description: string | null
          due_date: string | null
          id: string
          node_id: string | null
          parent_id: string | null
          position: number | null
          priority: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by: string
          custom_fields?: Json | null
          description?: string | null
          due_date?: string | null
          id?: string
          node_id?: string | null
          parent_id?: string | null
          position?: number | null
          priority?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string
          custom_fields?: Json | null
          description?: string | null
          due_date?: string | null
          id?: string
          node_id?: string | null
          parent_id?: string | null
          position?: number | null
          priority?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_templates: {
        Row: {
          amount: number
          asset_id: string | null
          category_id: string | null
          created_at: string | null
          currency: string
          description_template: string | null
          destination_asset_id: string | null
          effective_from_date: string
          generator_id: string
          id: string
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          asset_id?: string | null
          category_id?: string | null
          created_at?: string | null
          currency: string
          description_template?: string | null
          destination_asset_id?: string | null
          effective_from_date: string
          generator_id: string
          id?: string
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          asset_id?: string | null
          category_id?: string | null
          created_at?: string | null
          currency?: string
          description_template?: string | null
          destination_asset_id?: string | null
          effective_from_date?: string
          generator_id?: string
          id?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_templates_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_templates_destination_asset_id_fkey"
            columns: ["destination_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_templates_generator_id_fkey"
            columns: ["generator_id"]
            isOneToOne: false
            referencedRelation: "recurring_generators"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount_base: number
          amount_original: number
          asset_id: string | null
          attachment_url: string | null
          category_id: string | null
          created_at: string | null
          currency_original: string
          custom_fields: Json | null
          date: string
          description: string
          destination_asset_id: string | null
          exchange_rate: number | null
          generator_id: string | null
          id: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_base: number
          amount_original: number
          asset_id?: string | null
          attachment_url?: string | null
          category_id?: string | null
          created_at?: string | null
          currency_original: string
          custom_fields?: Json | null
          date: string
          description: string
          destination_asset_id?: string | null
          exchange_rate?: number | null
          generator_id?: string | null
          id?: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_base?: number
          amount_original?: number
          asset_id?: string | null
          attachment_url?: string | null
          category_id?: string | null
          created_at?: string | null
          currency_original?: string
          custom_fields?: Json | null
          date?: string
          description?: string
          destination_asset_id?: string | null
          exchange_rate?: number | null
          generator_id?: string | null
          id?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_destination_asset_id_fkey"
            columns: ["destination_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_generator_id_fkey"
            columns: ["generator_id"]
            isOneToOne: false
            referencedRelation: "recurring_generators"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          preference_key: string
          preference_value: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          preference_key: string
          preference_value: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          preference_key?: string
          preference_value?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          asset_id: string | null
          created_at: string | null
          current_mileage: number | null
          fuel_type: string | null
          fuel_unit: string | null
          id: string
          insurance_policy_number: string | null
          insurance_provider: string | null
          license_plate: string | null
          make: string | null
          mileage_unit: string | null
          model: string | null
          name: string
          notes: string | null
          updated_at: string | null
          user_id: string
          vin: string | null
          year: number | null
        }
        Insert: {
          asset_id?: string | null
          created_at?: string | null
          current_mileage?: number | null
          fuel_type?: string | null
          fuel_unit?: string | null
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          license_plate?: string | null
          make?: string | null
          mileage_unit?: string | null
          model?: string | null
          name: string
          notes?: string | null
          updated_at?: string | null
          user_id: string
          vin?: string | null
          year?: number | null
        }
        Update: {
          asset_id?: string | null
          created_at?: string | null
          current_mileage?: number | null
          fuel_type?: string | null
          fuel_unit?: string | null
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          license_plate?: string | null
          make?: string | null
          mileage_unit?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_edit_node: { Args: { p_node_id: string }; Returns: boolean }
      can_view_node: { Args: { p_node_id: string }; Returns: boolean }
      create_node_and_add_owner: {
        Args: {
          p_description: string
          p_due_date: string
          p_name: string
          p_parent_id: string
          p_status?: Database["public"]["Enums"]["node_status"]
          p_type: Database["public"]["Enums"]["node_type"]
          p_user_id: string
        }
        Returns: string
      }
      create_project_and_add_owner:
        | { Args: { description: string; name: string }; Returns: string }
        | {
            Args: { description: string; name: string; owner_id: string }
            Returns: string
          }
      is_node_owner: { Args: { p_node_id: string }; Returns: boolean }
    }
    Enums: {
      asset_type:
        | "bank_account"
        | "cash"
        | "credit_card"
        | "investment"
        | "property"
        | "vehicle"
        | "jewelry"
        | "other"
        | "crypto"
        | "stock"
      assettype:
        | "bank_account"
        | "cash"
        | "credit_card"
        | "investment"
        | "other"
        | "property"
        | "jewelry"
        | "vehicle"
      category_nature:
        | "fixed"
        | "variable"
        | "savings"
        | "investment"
        | "emergency"
      categorynature: "emergency" | "fixed" | "savings" | "variable"
      contact_category: "personal" | "professional" | "service_provider"
      liability_type: "loan" | "credit_card" | "mortgage" | "other"
      linkable_entity_type: "vehicle" | "liability" | "property" | "project"
      node_link_type:
        | "REFERENCES"
        | "DEPENDS_ON"
        | "BELONGS_TO"
        | "SUPPORTS"
        | "RELATED_TO"
      node_role: "OWNER" | "EDITOR" | "VIEWER"
      node_status: "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED"
      node_type: "PROJECT" | "AREA" | "RESOURCE" | "GOAL"
      recurring_frequency:
        | "daily"
        | "weekly"
        | "monthly"
        | "quarterly"
        | "yearly"
      recurringfrequency: "monthly" | "weekly" | "yearly"
      task_status:
        | "TODO"
        | "IN_PROGRESS"
        | "DONE"
        | "ARCHIVED"
        | "WAITING"
        | "SOMEDAY"
      transaction_type: "income" | "expense" | "transfer"
      transactiontype: "expense" | "income" | "transfer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      asset_type: [
        "bank_account",
        "cash",
        "credit_card",
        "investment",
        "property",
        "vehicle",
        "jewelry",
        "other",
        "crypto",
        "stock",
      ],
      assettype: [
        "bank_account",
        "cash",
        "credit_card",
        "investment",
        "other",
        "property",
        "jewelry",
        "vehicle",
      ],
      category_nature: [
        "fixed",
        "variable",
        "savings",
        "investment",
        "emergency",
      ],
      categorynature: ["emergency", "fixed", "savings", "variable"],
      contact_category: ["personal", "professional", "service_provider"],
      liability_type: ["loan", "credit_card", "mortgage", "other"],
      linkable_entity_type: ["vehicle", "liability", "property", "project"],
      node_link_type: [
        "REFERENCES",
        "DEPENDS_ON",
        "BELONGS_TO",
        "SUPPORTS",
        "RELATED_TO",
      ],
      node_role: ["OWNER", "EDITOR", "VIEWER"],
      node_status: ["ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"],
      node_type: ["PROJECT", "AREA", "RESOURCE", "GOAL"],
      recurring_frequency: [
        "daily",
        "weekly",
        "monthly",
        "quarterly",
        "yearly",
      ],
      recurringfrequency: ["monthly", "weekly", "yearly"],
      task_status: [
        "TODO",
        "IN_PROGRESS",
        "DONE",
        "ARCHIVED",
        "WAITING",
        "SOMEDAY",
      ],
      transaction_type: ["income", "expense", "transfer"],
      transactiontype: ["expense", "income", "transfer"],
    },
  },
} as const

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
      transaction_links: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["linkable_entity_type"]
          id: string
          transaction_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["linkable_entity_type"]
          id?: string
          transaction_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["linkable_entity_type"]
          id?: string
          transaction_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_links_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
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
      [_ in never]: never
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
      liability_type: "loan" | "credit_card" | "mortgage" | "other"
      linkable_entity_type: "vehicle" | "liability" | "property" | "project"
      recurring_frequency:
        | "daily"
        | "weekly"
        | "monthly"
        | "quarterly"
        | "yearly"
      recurringfrequency: "monthly" | "weekly" | "yearly"
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
      liability_type: ["loan", "credit_card", "mortgage", "other"],
      linkable_entity_type: ["vehicle", "liability", "property", "project"],
      recurring_frequency: [
        "daily",
        "weekly",
        "monthly",
        "quarterly",
        "yearly",
      ],
      recurringfrequency: ["monthly", "weekly", "yearly"],
      transaction_type: ["income", "expense", "transfer"],
      transactiontype: ["expense", "income", "transfer"],
    },
  },
} as const

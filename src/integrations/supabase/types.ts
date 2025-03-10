export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          pool_id: string
          sender: string
          timestamp: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          pool_id: string
          sender: string
          timestamp: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          pool_id?: string
          sender?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      game_players: {
        Row: {
          game_id: string
          id: string
          is_winner: boolean
          joined_at: string
          prize_amount: number
          selected_number: number | null
          user_id: string
        }
        Insert: {
          game_id: string
          id?: string
          is_winner?: boolean
          joined_at?: string
          prize_amount?: number
          selected_number?: number | null
          user_id: string
        }
        Update: {
          game_id?: string
          id?: string
          is_winner?: boolean
          joined_at?: string
          prize_amount?: number
          selected_number?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_players_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_players_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_pools: {
        Row: {
          created_at: string
          id: string
          player_data: Json
          player_id: string
          pool_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          player_data: Json
          player_id: string
          pool_id: string
        }
        Update: {
          created_at?: string
          id?: string
          player_data?: Json
          player_id?: string
          pool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_pools_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          created_at: string
          ended_at: string | null
          entry_fee: number
          game_type: string
          id: string
          status: string
          winning_number: number | null
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          entry_fee: number
          game_type: string
          id?: string
          status: string
          winning_number?: number | null
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          entry_fee?: number
          game_type?: string
          id?: string
          status?: string
          winning_number?: number | null
        }
        Relationships: []
      }
      pools: {
        Row: {
          created_at: string
          current_players: number
          entry_fee: number
          game_type: string
          id: string
          max_players: number
          number_range_max: number
          number_range_min: number
          play_frequency: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_players?: number
          entry_fee: number
          game_type: string
          id: string
          max_players: number
          number_range_max: number
          number_range_min: number
          play_frequency?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_players?: number
          entry_fee?: number
          game_type?: string
          id?: string
          max_players?: number
          number_range_max?: number
          number_range_min?: number
          play_frequency?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          bonus_amount: number
          created_at: string
          id: string
          referred_id: string
          referrer_id: string
        }
        Insert: {
          bonus_amount?: number
          created_at?: string
          id?: string
          referred_id: string
          referrer_id: string
        }
        Update: {
          bonus_amount?: number
          created_at?: string
          id?: string
          referred_id?: string
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staking_plans: {
        Row: {
          apy: number
          created_at: string
          description: string
          fee: number | null
          id: string
          min_amount: number
          name: string
          period: string
        }
        Insert: {
          apy: number
          created_at?: string
          description: string
          fee?: number | null
          id?: string
          min_amount?: number
          name: string
          period: string
        }
        Update: {
          apy?: number
          created_at?: string
          description?: string
          fee?: number | null
          id?: string
          min_amount?: number
          name?: string
          period?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          id: string
          message: string
          read: boolean
          sender: string
          timestamp: string
          user_id: string
        }
        Insert: {
          id?: string
          message: string
          read?: boolean
          sender: string
          timestamp?: string
          user_id: string
        }
        Update: {
          id?: string
          message?: string
          read?: boolean
          sender?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_id: string | null
          status: string
          transaction_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_id?: string | null
          status: string
          transaction_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_id?: string | null
          status?: string
          transaction_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
          username: string
          wallet_balance: number
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          updated_at?: string
          username: string
          wallet_balance?: number
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
          username?: string
          wallet_balance?: number
        }
        Relationships: []
      }
      user_stakes: {
        Row: {
          amount: number
          created_at: string
          end_date: string
          fee: number | null
          id: string
          is_compounding: boolean
          plan_id: string
          rewards: number
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          end_date: string
          fee?: number | null
          id?: string
          is_compounding?: boolean
          plan_id: string
          rewards?: number
          start_date?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          end_date?: string
          fee?: number | null
          id?: string
          is_compounding?: boolean
          plan_id?: string
          rewards?: number
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stakes_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "staking_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_stakes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_user_staking_totals: {
        Args: {
          p_user_id: string
        }
        Returns: {
          total_staked: number
          total_rewards: number
        }[]
      }
      cancel_stake: {
        Args: {
          p_stake_id: string
          p_user_id: string
          p_refund_amount: number
        }
        Returns: undefined
      }
      create_stake: {
        Args: {
          p_user_id: string
          p_plan_id: string
          p_amount: number
          p_start_date: string
          p_end_date: string
          p_is_compounding: boolean
        }
        Returns: undefined
      }
      withdraw_stake_rewards: {
        Args: {
          p_stake_id: string
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

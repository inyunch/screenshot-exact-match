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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      lakes: {
        Row: {
          acres: number | null
          ais_found_ss: boolean | null
          ais_found_zm: boolean | null
          ais_survey_year: number | null
          chl_2018: number | null
          chl_2019: number | null
          chl_2020: number | null
          chl_2021: number | null
          chl_2022: number | null
          chl_2023: number | null
          chl_mean: number | null
          chl_percentile: number | null
          chl_slope: number | null
          county: string | null
          exposure: number | null
          flag_busy_access: boolean | null
          flag_clarity_rising: boolean | null
          flag_near_source: boolean | null
          infested: boolean | null
          infested_within_25km: number | null
          lake_id: string
          lat: number | null
          lon: number | null
          max_depth_m: number | null
          n_launches: number | null
          n_wash_stations: number | null
          name: string | null
          nearest_infested_km: number | null
          risk_percentile: number | null
          risk_prob: number | null
          risk_rank: number | null
          risk_tier: string | null
          secchi_2018: number | null
          secchi_2019: number | null
          secchi_2020: number | null
          secchi_2021: number | null
          secchi_2022: number | null
          secchi_2023: number | null
          secchi_mean: number | null
          secchi_slope: number | null
          septic_screen: string | null
          ss_first_year: number | null
          trailer_parking: number | null
          zm_first_year: number | null
        }
        Insert: {
          acres?: number | null
          ais_found_ss?: boolean | null
          ais_found_zm?: boolean | null
          ais_survey_year?: number | null
          chl_2018?: number | null
          chl_2019?: number | null
          chl_2020?: number | null
          chl_2021?: number | null
          chl_2022?: number | null
          chl_2023?: number | null
          chl_mean?: number | null
          chl_percentile?: number | null
          chl_slope?: number | null
          county?: string | null
          exposure?: number | null
          flag_busy_access?: boolean | null
          flag_clarity_rising?: boolean | null
          flag_near_source?: boolean | null
          infested?: boolean | null
          infested_within_25km?: number | null
          lake_id: string
          lat?: number | null
          lon?: number | null
          max_depth_m?: number | null
          n_launches?: number | null
          n_wash_stations?: number | null
          name?: string | null
          nearest_infested_km?: number | null
          risk_percentile?: number | null
          risk_prob?: number | null
          risk_rank?: number | null
          risk_tier?: string | null
          secchi_2018?: number | null
          secchi_2019?: number | null
          secchi_2020?: number | null
          secchi_2021?: number | null
          secchi_2022?: number | null
          secchi_2023?: number | null
          secchi_mean?: number | null
          secchi_slope?: number | null
          septic_screen?: string | null
          ss_first_year?: number | null
          trailer_parking?: number | null
          zm_first_year?: number | null
        }
        Update: {
          acres?: number | null
          ais_found_ss?: boolean | null
          ais_found_zm?: boolean | null
          ais_survey_year?: number | null
          chl_2018?: number | null
          chl_2019?: number | null
          chl_2020?: number | null
          chl_2021?: number | null
          chl_2022?: number | null
          chl_2023?: number | null
          chl_mean?: number | null
          chl_percentile?: number | null
          chl_slope?: number | null
          county?: string | null
          exposure?: number | null
          flag_busy_access?: boolean | null
          flag_clarity_rising?: boolean | null
          flag_near_source?: boolean | null
          infested?: boolean | null
          infested_within_25km?: number | null
          lake_id?: string
          lat?: number | null
          lon?: number | null
          max_depth_m?: number | null
          n_launches?: number | null
          n_wash_stations?: number | null
          name?: string | null
          nearest_infested_km?: number | null
          risk_percentile?: number | null
          risk_prob?: number | null
          risk_rank?: number | null
          risk_tier?: string | null
          secchi_2018?: number | null
          secchi_2019?: number | null
          secchi_2020?: number | null
          secchi_2021?: number | null
          secchi_2022?: number | null
          secchi_2023?: number | null
          secchi_mean?: number | null
          secchi_slope?: number | null
          septic_screen?: string | null
          ss_first_year?: number | null
          trailer_parking?: number | null
          zm_first_year?: number | null
        }
        Relationships: []
      }
      metrics: {
        Row: {
          description: string | null
          key: string
          value: number | null
        }
        Insert: {
          description?: string | null
          key: string
          value?: number | null
        }
        Update: {
          description?: string | null
          key?: string
          value?: number | null
        }
        Relationships: []
      }
      nearest_sources: {
        Row: {
          distance_km: number | null
          first_year: number | null
          id: number
          lake_id: string | null
          source_county: string | null
          source_lake_id: string | null
          source_name: string | null
          species: string | null
        }
        Insert: {
          distance_km?: number | null
          first_year?: number | null
          id?: never
          lake_id?: string | null
          source_county?: string | null
          source_lake_id?: string | null
          source_name?: string | null
          species?: string | null
        }
        Update: {
          distance_km?: number | null
          first_year?: number | null
          id?: never
          lake_id?: string | null
          source_county?: string | null
          source_lake_id?: string | null
          source_name?: string | null
          species?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

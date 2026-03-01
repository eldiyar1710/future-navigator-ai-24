import { supabase } from "@/integrations/supabase/client";

// Helper to query tables that may not yet be in the auto-generated types
// Remove this once types.ts is regenerated
export const supabaseAny = supabase as any;

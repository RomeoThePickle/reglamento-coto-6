import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Usa la llave secreta (service role): solo debe importarse desde código de servidor.
let cliente: SupabaseClient | undefined;

export function supabaseAdmin(): SupabaseClient {
  if (!cliente) {
    const url = process.env.SUPABASE_URL;
    const llave = process.env.SUPABASE_SECRET_KEY;
    if (!url || !llave) {
      throw new Error("Faltan las variables de entorno SUPABASE_URL o SUPABASE_SECRET_KEY.");
    }
    cliente = createClient(url, llave, { auth: { persistSession: false } });
  }
  return cliente;
}

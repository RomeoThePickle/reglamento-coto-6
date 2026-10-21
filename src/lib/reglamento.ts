import { supabaseAdmin } from "./supabase-admin";

export const BUCKET_REGLAMENTOS = "reglamentos";

/** Duración del enlace temporal al PDF que recibe un propietario ya validado. */
const VIGENCIA_ENLACE_SEGUNDOS = 60 * 60;

/**
 * El PDF vive en el bucket privado "reglamentos" de Supabase Storage. El nombre
 * del archivo funciona como versión: cada aceptación guarda qué archivo se mostró.
 */
export function versionReglamento(): string {
  const archivo = process.env.REGLAMENTO_ARCHIVO;
  if (!archivo) throw new Error("Falta la variable de entorno REGLAMENTO_ARCHIVO.");
  return archivo;
}

export async function enlaceReglamento(): Promise<string> {
  const { data, error } = await supabaseAdmin()
    .storage.from(BUCKET_REGLAMENTOS)
    .createSignedUrl(versionReglamento(), VIGENCIA_ENLACE_SEGUNDOS);
  if (error) throw new Error(`No se pudo generar el enlace al reglamento: ${error.message}`);
  return data.signedUrl;
}

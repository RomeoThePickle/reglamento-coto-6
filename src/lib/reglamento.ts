export const BUCKET_REGLAMENTOS = "reglamentos";

/**
 * El PDF vive en el bucket público "reglamentos" de Supabase Storage. El nombre
 * del archivo funciona como versión: cada aceptación guarda qué archivo se mostró.
 */
export function getReglamento() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const archivo = process.env.REGLAMENTO_ARCHIVO;
  if (!supabaseUrl || !archivo) {
    throw new Error("Faltan las variables de entorno SUPABASE_URL o REGLAMENTO_ARCHIVO.");
  }
  return {
    version: archivo,
    url: `${supabaseUrl}/storage/v1/object/public/${BUCKET_REGLAMENTOS}/${encodeURIComponent(archivo)}`,
  };
}

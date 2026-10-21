import { PLAZO_DIAS } from "./config";
import { supabaseAdmin } from "./supabase-admin";
import type { Comprobante } from "./tipos";
import { normalizarCasa, normalizarIniciales } from "./validacion";

export type Propietario = { id: number; numeroCasa: string; iniciales: string };

export type ResultadoValidacion =
  | { ok: true; propietario: Propietario }
  | { ok: false; status: number; error: string };

/** Valida el formato y busca la combinación casa + iniciales en el padrón. */
export async function validarPropietario(datos: Record<string, unknown>): Promise<ResultadoValidacion> {
  const iniciales = normalizarIniciales(String(datos.iniciales ?? ""));
  const numeroCasa = normalizarCasa(String(datos.numeroCasa ?? ""));
  if (!iniciales) {
    return { ok: false, status: 400, error: "Escribe las iniciales del propietario (de 2 a 6 letras)." };
  }
  if (!numeroCasa) {
    return { ok: false, status: 400, error: "Escribe un número de casa válido." };
  }

  const { data, error } = await supabaseAdmin()
    .from("propietarios")
    .select("id")
    .eq("numero_casa", numeroCasa)
    .eq("iniciales", iniciales)
    .maybeSingle();
  if (error) throw error;

  // Mismo mensaje si no existe la casa o si no coinciden las iniciales, para no
  // revelar qué casas están registradas.
  if (!data) {
    return {
      ok: false,
      status: 403,
      error:
        "Las iniciales y el número de casa no coinciden con el padrón de propietarios. " +
        "Verifícalos o comunícate con la Mesa Directiva.",
    };
  }
  return { ok: true, propietario: { id: data.id, numeroCasa, iniciales } };
}

/** Aceptación previa de este propietario para esta versión del reglamento, si existe. */
export async function buscarAceptacion(
  propietario: Propietario,
  version: string,
): Promise<Comprobante | null> {
  const { data, error } = await supabaseAdmin()
    .from("aceptaciones")
    .select("id, aceptado_en")
    .eq("propietario_id", propietario.id)
    .eq("version_reglamento", version)
    .maybeSingle();
  if (error) throw error;
  return data && comprobante(propietario, data);
}

export function comprobante(
  propietario: Propietario,
  fila: { id: number; aceptado_en: string },
): Comprobante {
  const aceptadoEn = new Date(fila.aceptado_en);
  const fechaLimite = new Date(aceptadoEn.getTime() + PLAZO_DIAS * 24 * 60 * 60 * 1000);
  return {
    folio: fila.id,
    numeroCasa: propietario.numeroCasa,
    iniciales: propietario.iniciales,
    aceptadoEn: aceptadoEn.toISOString(),
    fechaLimite: fechaLimite.toISOString(),
  };
}

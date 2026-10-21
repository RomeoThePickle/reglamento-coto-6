import { ultimoDiaPlazo } from "./plazo";
import { supabaseAdmin } from "./supabase-admin";
import type { Comprobante, Plazo } from "./tipos";
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

/**
 * Registra que el propietario aceptó los términos del plazo. Solo se guarda la
 * primera aceptación de cada versión; en ingresos posteriores se devuelve esa.
 */
export async function registrarAceptacion(
  propietario: Propietario,
  version: string,
  userAgent: string | null,
): Promise<Comprobante> {
  const db = supabaseAdmin();

  const { data: previa, error } = await db
    .from("aceptaciones")
    .select("id, aceptado_en")
    .eq("propietario_id", propietario.id)
    .eq("version_reglamento", version)
    .maybeSingle();
  if (error) throw error;
  if (previa) return comprobante(previa);

  const { data: nueva, error: errorAlta } = await db
    .from("aceptaciones")
    .insert({
      propietario_id: propietario.id,
      iniciales: propietario.iniciales,
      numero_casa: propietario.numeroCasa,
      version_reglamento: version,
      user_agent: userAgent?.slice(0, 500) ?? null,
    })
    .select("id, aceptado_en")
    .single();
  // Doble envío simultáneo: el índice único ya guardó el primero.
  if (errorAlta?.code === "23505") return registrarAceptacion(propietario, version, userAgent);
  if (errorAlta) throw errorAlta;
  return comprobante(nueva);
}

function comprobante(fila: { id: number; aceptado_en: string }): Comprobante {
  return { folio: fila.id, aceptadoEn: new Date(fila.aceptado_en).toISOString() };
}

/**
 * Registra el ingreso del propietario. El primer ingreso a cada versión del
 * reglamento fija el inicio de su plazo; los siguientes solo actualizan el último.
 */
export async function registrarIngreso(propietario: Propietario, version: string): Promise<Plazo> {
  const db = supabaseAdmin();

  const { data: existente, error } = await db
    .from("ingresos")
    .update({ ultimo_ingreso: new Date().toISOString() })
    .eq("propietario_id", propietario.id)
    .eq("version_reglamento", version)
    .select("primer_ingreso")
    .maybeSingle();
  if (error) throw error;
  if (existente) return plazo(existente.primer_ingreso, false);

  const { data: nuevo, error: errorAlta } = await db
    .from("ingresos")
    .insert({ propietario_id: propietario.id, version_reglamento: version })
    .select("primer_ingreso")
    .single();
  // Dos ingresos simultáneos: el otro ya creó la fila, se toma esa.
  if (errorAlta?.code === "23505") return registrarIngreso(propietario, version);
  if (errorAlta) throw errorAlta;
  return plazo(nuevo.primer_ingreso, true);
}

function plazo(primerIngreso: string, esPrimerIngreso: boolean): Plazo {
  const fecha = new Date(primerIngreso);
  return { primerIngreso: fecha.toISOString(), ultimoDia: ultimoDiaPlazo(fecha), esPrimerIngreso };
}

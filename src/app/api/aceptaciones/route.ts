import { NextResponse } from "next/server";
import { PLAZO_DIAS } from "@/lib/config";
import { getReglamento } from "@/lib/reglamento";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { normalizarCasa, normalizarIniciales } from "@/lib/validacion";

function error(status: number, mensaje: string) {
  return NextResponse.json({ error: mensaje }, { status });
}

export async function POST(req: Request) {
  let datos: Record<string, unknown>;
  try {
    datos = await req.json();
  } catch {
    return error(400, "Solicitud inválida.");
  }

  const iniciales = normalizarIniciales(String(datos.iniciales ?? ""));
  const numeroCasa = normalizarCasa(String(datos.numeroCasa ?? ""));

  if (datos.aceptaPlazo !== true) {
    return error(400, "Debes marcar la casilla de aceptación.");
  }
  if (!iniciales) {
    return error(400, "Escribe las iniciales del propietario (de 2 a 6 letras).");
  }
  if (!numeroCasa) {
    return error(400, "Escribe un número de casa válido.");
  }
  // Si se subió un PDF nuevo mientras la persona leía, que recargue y lea el actual.
  if (datos.version !== getReglamento().version) {
    return error(409, "El reglamento se actualizó. Recarga la página para ver la versión vigente.");
  }

  const { data, error: errorDb } = await supabaseAdmin()
    .from("aceptaciones")
    .insert({
      iniciales,
      numero_casa: numeroCasa,
      version_reglamento: getReglamento().version,
      user_agent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
    })
    .select("id, aceptado_en")
    .single();

  if (errorDb) {
    console.error("Error al guardar aceptación:", errorDb);
    return error(500, "No pudimos guardar tu aceptación. Intenta de nuevo en unos minutos.");
  }

  const aceptadoEn = new Date(data.aceptado_en);
  const fechaLimite = new Date(aceptadoEn.getTime() + PLAZO_DIAS * 24 * 60 * 60 * 1000);

  return NextResponse.json({
    folio: data.id,
    iniciales,
    numeroCasa,
    aceptadoEn: aceptadoEn.toISOString(),
    fechaLimite: fechaLimite.toISOString(),
  });
}

import { NextResponse } from "next/server";
import { buscarAceptacion, comprobante, validarPropietario } from "@/lib/padron";
import { versionReglamento } from "@/lib/reglamento";
import { supabaseAdmin } from "@/lib/supabase-admin";

function error(status: number, mensaje: string) {
  return NextResponse.json({ error: mensaje }, { status });
}

// Paso 2: registra la aceptación. Se vuelve a validar contra el padrón porque
// el navegador no es confiable.
export async function POST(req: Request) {
  let datos: Record<string, unknown>;
  try {
    datos = await req.json();
  } catch {
    return error(400, "Solicitud inválida.");
  }

  if (datos.aceptaPlazo !== true) {
    return error(400, "Debes marcar la casilla de aceptación.");
  }

  try {
    const resultado = await validarPropietario(datos);
    if (!resultado.ok) return error(resultado.status, resultado.error);
    const { propietario } = resultado;

    // Si se subió un PDF nuevo mientras la persona leía, que recargue y lea el actual.
    const version = versionReglamento();
    if (datos.version !== version) {
      return error(409, "El reglamento se actualizó. Recarga la página para ver la versión vigente.");
    }

    // Si ya aceptó esta versión, se devuelve el registro original: el plazo no se reinicia.
    const previa = await buscarAceptacion(propietario, version);
    if (previa) return NextResponse.json(previa);

    const { data, error: errorDb } = await supabaseAdmin()
      .from("aceptaciones")
      .insert({
        propietario_id: propietario.id,
        iniciales: propietario.iniciales,
        numero_casa: propietario.numeroCasa,
        version_reglamento: version,
        user_agent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
      })
      .select("id, aceptado_en")
      .single();

    if (errorDb) {
      // Doble envío simultáneo: el índice único ya guardó el primero.
      if (errorDb.code === "23505") {
        const existente = await buscarAceptacion(propietario, version);
        if (existente) return NextResponse.json(existente);
      }
      throw errorDb;
    }

    return NextResponse.json(comprobante(propietario, data));
  } catch (err) {
    console.error("Error al guardar aceptación:", err);
    return error(500, "No pudimos guardar tu aceptación. Intenta de nuevo en unos minutos.");
  }
}

import { NextResponse } from "next/server";
import { buscarAceptacion, validarPropietario } from "@/lib/padron";
import { enlaceReglamento, versionReglamento } from "@/lib/reglamento";

// Paso 1: valida al propietario contra el padrón y, si coincide, entrega el
// enlace temporal al PDF junto con su aceptación previa (si ya la registró).
export async function POST(req: Request) {
  let datos: Record<string, unknown>;
  try {
    datos = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  try {
    const resultado = await validarPropietario(datos);
    if (!resultado.ok) {
      return NextResponse.json({ error: resultado.error }, { status: resultado.status });
    }
    const { propietario } = resultado;
    const version = versionReglamento();

    return NextResponse.json({
      numeroCasa: propietario.numeroCasa,
      iniciales: propietario.iniciales,
      version,
      url: await enlaceReglamento(),
      aceptacion: await buscarAceptacion(propietario, version),
    });
  } catch (err) {
    console.error("Error al verificar propietario:", err);
    return NextResponse.json(
      { error: "No pudimos verificar tus datos. Intenta de nuevo en unos minutos." },
      { status: 500 },
    );
  }
}

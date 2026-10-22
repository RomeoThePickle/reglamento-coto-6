import { NextResponse } from "next/server";
import { registrarAceptacion, registrarIngreso, validarPropietario } from "@/lib/padron";
import { enlaceReglamento, versionReglamento } from "@/lib/reglamento";

// Valida al propietario contra el padrón, registra su ingreso y su aceptación de
// los términos del plazo, y entrega el enlace temporal al PDF.
export async function POST(req: Request) {
  let datos: Record<string, unknown>;
  try {
    datos = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  if (datos.aceptaPlazo !== true) {
    return NextResponse.json(
      { error: "Para continuar, marca la casilla de aceptación." },
      { status: 400 },
    );
  }

  try {
    const resultado = await validarPropietario(datos);
    if (!resultado.ok) {
      return NextResponse.json({ error: resultado.error }, { status: resultado.status });
    }
    const { propietario } = resultado;
    const version = versionReglamento();

    // El ingreso va primero: su fecha marca el inicio del plazo.
    const plazo = await registrarIngreso(propietario, version);
    const aceptacion = await registrarAceptacion(
      propietario,
      version,
      req.headers.get("user-agent"),
    );

    return NextResponse.json({
      numeroCasa: propietario.numeroCasa,
      iniciales: propietario.iniciales,
      url: await enlaceReglamento(),
      plazo,
      aceptacion,
    });
  } catch (err) {
    console.error("Error al verificar propietario:", err);
    return NextResponse.json(
      { error: "No pudimos verificar tus datos. Intenta de nuevo en unos minutos." },
      { status: 500 },
    );
  }
}

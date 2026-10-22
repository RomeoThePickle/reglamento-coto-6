import { AVISO_SIN_RECEPCION, PLAZO_DIAS, ZONA_HORARIA } from "@/lib/config";
import { diasRestantes, formatearDia } from "@/lib/plazo";
import type { Comprobante, Plazo } from "@/lib/tipos";

const fechaHora = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: ZONA_HORARIA,
});

function titulo(restantes: number): string {
  if (restantes < 0) return "Tu plazo venció";
  if (restantes === 0) return "Hoy es tu último día";
  if (restantes === 1) return "Te queda 1 día";
  return `Te quedan ${restantes} días`;
}

type Props = { plazo: Plazo; aceptacion: Comprobante };

export default function AvisoPlazo({ plazo, aceptacion }: Props) {
  const restantes = diasRestantes(plazo.ultimoDia);
  const ultimoDia = formatearDia(plazo.ultimoDia);
  const urgente = restantes <= 2;

  return (
    <section
      aria-label="Plazo para comentarios y sugerencias"
      className={`mt-6 rounded-lg border p-5 ${
        urgente
          ? "border-amber-300 bg-amber-50 text-amber-950"
          : "border-sky-200 bg-sky-50 text-sky-950"
      }`}
    >
      <p className="text-2xl font-semibold">{titulo(restantes)}</p>
      <p className="mt-1">
        {restantes < 0 ? (
          <>
            El plazo para presentar comentarios y/o sugerencias sobre este reglamento terminó el{" "}
            <strong>{ultimoDia}</strong>. Si no los presentaste, el reglamento quedó aceptado en
            los términos en que se encuentra redactado.
          </>
        ) : (
          <>
            para leer el reglamento y presentar por escrito ante el Consejo Administrativo del condominio Jardín de los Reyes tus comentarios
            y/o sugerencias. Tienes hasta el <strong>{ultimoDia}</strong>; de lo contrario, el
            reglamento quedará aceptado en los términos en que se encuentra redactado.
          </>
        )}
      </p>
      <p className="mt-3 text-sm opacity-80">
        {plazo.esPrimerIngreso
          ? `Tu plazo de ${PLAZO_DIAS} días naturales comenzó hoy, con tu primer ingreso a este sitio.`
          : `Tu plazo de ${PLAZO_DIAS} días naturales comenzó con tu primer ingreso, el ` +
            `${fechaHora.format(new Date(plazo.primerIngreso))}.`}
      </p>
      <p className="mt-1 text-sm opacity-80">
        Aceptación registrada el {fechaHora.format(new Date(aceptacion.aceptadoEn))} · Folio{" "}
        <span className="font-mono">{aceptacion.folio}</span>
      </p>
      <p className="mt-3 border-t border-current/15 pt-3 text-sm font-medium">{AVISO_SIN_RECEPCION}</p>
    </section>
  );
}

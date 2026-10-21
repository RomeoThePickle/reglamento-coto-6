import { PLAZO_DIAS, ZONA_HORARIA } from "@/lib/config";
import type { Comprobante as TipoComprobante } from "@/lib/tipos";

const fechaHora = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: ZONA_HORARIA,
});
const fecha = new Intl.DateTimeFormat("es-MX", { dateStyle: "full", timeZone: ZONA_HORARIA });

type Props = { comprobante: TipoComprobante; yaRegistrada?: boolean };

export default function Comprobante({ comprobante, yaRegistrada }: Props) {
  const vencido = new Date(comprobante.fechaLimite) < new Date();

  return (
    <section
      aria-live="polite"
      className="rounded-lg border border-emerald-300 bg-emerald-50 p-6 text-emerald-950"
    >
      <h2 className="text-lg font-semibold">
        {yaRegistrada ? "Ya registraste tu aceptación" : "Aceptación registrada"}
      </h2>
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-emerald-800">Folio</dt>
        <dd className="font-mono">{comprobante.folio}</dd>
        <dt className="text-emerald-800">Casa</dt>
        <dd>{comprobante.numeroCasa}</dd>
        <dt className="text-emerald-800">Iniciales</dt>
        <dd>{comprobante.iniciales}</dd>
        <dt className="text-emerald-800">Fecha</dt>
        <dd>{fechaHora.format(new Date(comprobante.aceptadoEn))}</dd>
      </dl>
      <p className="mt-4">
        {vencido ? (
          <>
            El plazo de {PLAZO_DIAS} días para presentar quejas o sugerencias venció el{" "}
            <strong>{fecha.format(new Date(comprobante.fechaLimite))}</strong>.
          </>
        ) : (
          <>
            Tienes hasta el <strong>{fecha.format(new Date(comprobante.fechaLimite))}</strong> para
            presentar cualquier queja formal o sugerencia sobre el reglamento.
          </>
        )}
      </p>
      {!yaRegistrada && (
        <p className="mt-2 text-sm text-emerald-800">
          Te recomendamos tomar una captura de pantalla como comprobante.
        </p>
      )}
    </section>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import type { Comprobante as TipoComprobante, Sesion } from "@/lib/tipos";
import Comprobante from "./Comprobante";
import FormularioAceptacion from "./FormularioAceptacion";
import FormularioVerificacion from "./FormularioVerificacion";

// pdf.js solo funciona en el navegador.
const VisorPdf = dynamic(() => import("./VisorPdf"), {
  ssr: false,
  loading: () => <p className="py-16 text-center text-stone-500">Cargando reglamento…</p>,
});

/**
 * Paso 1: el propietario se identifica y el servidor lo valida contra el padrón.
 * Paso 2: se muestra el reglamento y, al llegar al final, se registra la aceptación.
 */
export default function Reglamento() {
  const [sesion, setSesion] = useState<Sesion>();
  const [comprobante, setComprobante] = useState<TipoComprobante>();
  const [leido, setLeido] = useState(false);
  const [errorVisor, setErrorVisor] = useState(false);

  const marcarLeido = useCallback(() => setLeido(true), []);
  const marcarError = useCallback(() => setErrorVisor(true), []);

  function iniciar(nueva: Sesion) {
    setSesion(nueva);
    setComprobante(nueva.aceptacion ?? undefined);
    setLeido(false);
    setErrorVisor(false);
    window.scrollTo({ top: 0 });
  }

  if (!sesion) return <FormularioVerificacion onVerificado={iniciar} />;

  const yaRegistrada = Boolean(sesion.aceptacion);

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm">
        <span>
          Casa <strong>{sesion.numeroCasa}</strong> · {sesion.iniciales}
        </span>
        <span className="flex gap-4">
          <a href={sesion.url} target="_blank" rel="noopener" className="font-medium underline underline-offset-4">
            Descargar PDF
          </a>
          <button
            type="button"
            onClick={() => setSesion(undefined)}
            className="text-stone-600 underline underline-offset-4"
          >
            Cambiar
          </button>
        </span>
      </div>

      {yaRegistrada && comprobante && (
        <div className="mt-6">
          <Comprobante comprobante={comprobante} yaRegistrada />
        </div>
      )}

      <section aria-label="Reglamento" className="mt-6">
        {errorVisor ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-900">
            <p className="font-medium">Tu navegador no pudo mostrar el reglamento aquí.</p>
            <p className="mt-1 text-sm">
              Ábrelo en una pestaña nueva, léelo completo y después regresa a esta página para
              registrar tu aceptación.
            </p>
            <a
              href={sesion.url}
              target="_blank"
              rel="noopener"
              onClick={marcarLeido}
              className="mt-3 inline-block rounded-md bg-amber-900 px-4 py-2 text-sm font-medium text-white"
            >
              Abrir reglamento (PDF)
            </a>
          </div>
        ) : (
          <VisorPdf url={sesion.url} onFinalAlcanzado={marcarLeido} onError={marcarError} />
        )}
      </section>

      {!yaRegistrada && (
        <div className="mt-8">
          {comprobante ? (
            <Comprobante comprobante={comprobante} />
          ) : (
            <FormularioAceptacion sesion={sesion} habilitado={leido} onRegistrada={setComprobante} />
          )}
        </div>
      )}
    </>
  );
}

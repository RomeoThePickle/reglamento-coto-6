"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import type { Sesion } from "@/lib/tipos";
import AvisoPlazo from "./AvisoPlazo";
import FormularioVerificacion from "./FormularioVerificacion";

// pdf.js solo funciona en el navegador.
const VisorPdf = dynamic(() => import("./VisorPdf"), {
  ssr: false,
  loading: () => <p className="py-16 text-center text-stone-500">Cargando reglamento…</p>,
});

/**
 * Paso 1: el propietario se identifica, acepta los términos del plazo y el
 * servidor lo valida contra el padrón.
 * Paso 2: se muestran los días que le quedan y el reglamento.
 */
export default function Reglamento() {
  const [sesion, setSesion] = useState<Sesion>();
  const [errorVisor, setErrorVisor] = useState(false);

  const marcarError = useCallback(() => setErrorVisor(true), []);

  function iniciar(nueva: Sesion) {
    setSesion(nueva);
    setErrorVisor(false);
    window.scrollTo({ top: 0 });
  }

  if (!sesion) return <FormularioVerificacion onVerificado={iniciar} />;

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

      <AvisoPlazo plazo={sesion.plazo} aceptacion={sesion.aceptacion} />

      <section aria-label="Reglamento" className="mt-6">
        {errorVisor ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-900">
            <p className="font-medium">Tu navegador no pudo mostrar el reglamento aquí.</p>
            <p className="mt-1 text-sm">Ábrelo en una pestaña nueva para leerlo.</p>
            <a
              href={sesion.url}
              target="_blank"
              rel="noopener"
              className="mt-3 inline-block rounded-md bg-amber-900 px-4 py-2 text-sm font-medium text-white"
            >
              Abrir reglamento (PDF)
            </a>
          </div>
        ) : (
          <VisorPdf url={sesion.url} onError={marcarError} />
        )}
      </section>
    </>
  );
}

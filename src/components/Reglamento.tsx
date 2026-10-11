"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import FormularioAceptacion from "./FormularioAceptacion";

// pdf.js solo funciona en el navegador.
const VisorPdf = dynamic(() => import("./VisorPdf"), {
  ssr: false,
  loading: () => <p className="py-16 text-center text-stone-500">Cargando reglamento…</p>,
});

type Props = { url: string; version: string };

export default function Reglamento({ url, version }: Props) {
  const [leido, setLeido] = useState(false);
  const [errorVisor, setErrorVisor] = useState(false);

  const marcarLeido = useCallback(() => setLeido(true), []);
  const marcarError = useCallback(() => setErrorVisor(true), []);

  return (
    <>
      <section aria-label="Reglamento" className="mt-6">
        {errorVisor ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-900">
            <p className="font-medium">Tu navegador no pudo mostrar el reglamento aquí.</p>
            <p className="mt-1 text-sm">
              Ábrelo en una pestaña nueva, léelo completo y después regresa a esta página para
              registrar tu aceptación.
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener"
              onClick={marcarLeido}
              className="mt-3 inline-block rounded-md bg-amber-900 px-4 py-2 text-sm font-medium text-white"
            >
              Abrir reglamento (PDF)
            </a>
          </div>
        ) : (
          <VisorPdf url={url} onFinalAlcanzado={marcarLeido} onError={marcarError} />
        )}
      </section>

      <FormularioAceptacion version={version} habilitado={leido} />
    </>
  );
}

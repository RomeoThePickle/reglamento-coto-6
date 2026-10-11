"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type Props = {
  url: string;
  /** Se llama una vez, cuando la persona llega al final del documento. */
  onFinalAlcanzado: () => void;
  /** El navegador no pudo mostrar el PDF; la página ofrece abrirlo aparte. */
  onError: () => void;
};

export default function VisorPdf({ url, onFinalAlcanzado, onError }: Props) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const finalRef = useRef<HTMLDivElement>(null);
  const [ancho, setAncho] = useState<number>();
  const [numPaginas, setNumPaginas] = useState(0);
  const [renderizadas, setRenderizadas] = useState(0);

  useEffect(() => {
    const el = contenedorRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entrada]) => setAncho(Math.floor(entrada.contentRect.width)));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Solo se observa el final cuando todas las páginas ya tienen su altura real;
  // antes de eso el marcador estaría visible desde el inicio.
  const listo = numPaginas > 0 && renderizadas >= numPaginas;
  useEffect(() => {
    if (!listo || !finalRef.current) return;
    const obs = new IntersectionObserver(([entrada]) => {
      if (entrada.isIntersecting) {
        onFinalAlcanzado();
        obs.disconnect();
      }
    });
    obs.observe(finalRef.current);
    return () => obs.disconnect();
  }, [listo, onFinalAlcanzado]);

  return (
    <div ref={contenedorRef} className="w-full">
      <Document
        file={url}
        onLoadSuccess={({ numPages }) => setNumPaginas(numPages)}
        onLoadError={onError}
        loading={<p className="py-16 text-center text-stone-500">Cargando reglamento…</p>}
        error={null}
      >
        {ancho &&
          Array.from({ length: numPaginas }, (_, i) => (
            <Page
              key={i}
              pageNumber={i + 1}
              width={ancho}
              className="mb-4 overflow-hidden rounded-md shadow-sm ring-1 ring-stone-200"
              onRenderSuccess={() => setRenderizadas((n) => n + 1)}
              loading={<div style={{ height: ancho * 1.29 }} className="bg-white" />}
            />
          ))}
      </Document>
      <div ref={finalRef} aria-hidden className="h-px" />
    </div>
  );
}

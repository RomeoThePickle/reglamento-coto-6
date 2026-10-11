"use client";

import { useState, type FormEvent } from "react";
import { PLAZO_DIAS, TEXTO_ACEPTACION, ZONA_HORARIA } from "@/lib/config";
import { normalizarCasa, normalizarIniciales } from "@/lib/validacion";

type Comprobante = {
  folio: number;
  iniciales: string;
  numeroCasa: string;
  aceptadoEn: string;
  fechaLimite: string;
};

const fechaHora = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: ZONA_HORARIA,
});
const fecha = new Intl.DateTimeFormat("es-MX", { dateStyle: "full", timeZone: ZONA_HORARIA });

type Props = { version: string; habilitado: boolean };

export default function FormularioAceptacion({ version, habilitado }: Props) {
  const [acepta, setAcepta] = useState(false);
  const [iniciales, setIniciales] = useState("");
  const [numeroCasa, setNumeroCasa] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string>();
  const [comprobante, setComprobante] = useState<Comprobante>();

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(undefined);

    if (!normalizarIniciales(iniciales)) {
      setError("Escribe las iniciales del propietario (de 2 a 6 letras, sin números).");
      return;
    }
    if (!normalizarCasa(numeroCasa)) {
      setError("Escribe un número de casa válido.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/aceptaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ iniciales, numeroCasa, version, aceptaPlazo: acepta }),
      });
      const datos = await res.json();
      if (!res.ok) throw new Error(datos.error ?? "Ocurrió un error inesperado.");
      setComprobante(datos);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "No hay conexión. Revisa tu internet e intenta de nuevo."
          : (err as Error).message,
      );
    } finally {
      setEnviando(false);
    }
  }

  if (comprobante) {
    return (
      <section
        aria-live="polite"
        className="mt-8 rounded-lg border border-emerald-300 bg-emerald-50 p-6 text-emerald-950"
      >
        <h2 className="text-lg font-semibold">Aceptación registrada</h2>
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
          Tienes hasta el <strong>{fecha.format(new Date(comprobante.fechaLimite))}</strong> para
          presentar cualquier queja formal o sugerencia sobre el reglamento.
        </p>
        <p className="mt-2 text-sm text-emerald-800">
          Te recomendamos tomar una captura de pantalla como comprobante.
        </p>
      </section>
    );
  }

  return (
    <form
      onSubmit={enviar}
      className="mt-8 rounded-lg border border-stone-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold">Confirmación de lectura</h2>

      {!habilitado && (
        <p className="mt-2 rounded-md bg-stone-100 px-3 py-2 text-sm text-stone-600">
          Desplázate hasta el final del reglamento para habilitar la confirmación.
        </p>
      )}

      <fieldset disabled={!habilitado || enviando} className="mt-4 space-y-5 disabled:opacity-50">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={acepta}
            onChange={(e) => setAcepta(e.target.checked)}
            required
            className="mt-1 size-5 shrink-0 accent-stone-900"
          />
          <span className="text-[15px] leading-relaxed">{TEXTO_ACEPTACION}</span>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Iniciales del propietario</span>
            <input
              value={iniciales}
              onChange={(e) => setIniciales(e.target.value)}
              required
              maxLength={12}
              autoComplete="off"
              autoCapitalize="characters"
              placeholder="Ej. JPG"
              className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 uppercase placeholder:normal-case focus:border-stone-900 focus:outline-none"
            />
            <span className="mt-1 block text-xs text-stone-500">
              Ej. Juan Pérez García → JPG
            </span>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Número de casa</span>
            <input
              value={numeroCasa}
              onChange={(e) => setNumeroCasa(e.target.value)}
              required
              maxLength={10}
              autoComplete="off"
              inputMode="text"
              placeholder="Ej. 24"
              className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 uppercase placeholder:normal-case focus:border-stone-900 focus:outline-none"
            />
          </label>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-md bg-stone-900 px-4 py-3 font-medium text-white hover:bg-stone-800 sm:w-auto"
        >
          {enviando ? "Registrando…" : "Registrar aceptación"}
        </button>
      </fieldset>

      <p className="mt-4 text-xs text-stone-500">
        El plazo de {PLAZO_DIAS} días se cuenta a partir de la fecha de registro.
      </p>
    </form>
  );
}

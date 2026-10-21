"use client";

import { useState, type FormEvent } from "react";
import { PLAZO_DIAS, TEXTO_ACEPTACION } from "@/lib/config";
import type { Comprobante, Sesion } from "@/lib/tipos";

type Props = {
  sesion: Sesion;
  habilitado: boolean;
  onRegistrada: (comprobante: Comprobante) => void;
};

export default function FormularioAceptacion({ sesion, habilitado, onRegistrada }: Props) {
  const [acepta, setAcepta] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string>();

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(undefined);
    setEnviando(true);
    try {
      const res = await fetch("/api/aceptaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          iniciales: sesion.iniciales,
          numeroCasa: sesion.numeroCasa,
          version: sesion.version,
          aceptaPlazo: acepta,
        }),
      });
      const datos = await res.json();
      if (!res.ok) throw new Error(datos.error ?? "Ocurrió un error inesperado.");
      onRegistrada(datos);
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

  return (
    <form onSubmit={enviar} className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
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
        Casa {sesion.numeroCasa} · {sesion.iniciales}. El plazo de {PLAZO_DIAS} días se cuenta a
        partir de la fecha de registro.
      </p>
    </form>
  );
}

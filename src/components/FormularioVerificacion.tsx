"use client";

import { useState, type FormEvent } from "react";
import type { Sesion } from "@/lib/tipos";
import { normalizarCasa, normalizarIniciales } from "@/lib/validacion";

type Props = { onVerificado: (sesion: Sesion) => void };

export default function FormularioVerificacion({ onVerificado }: Props) {
  const [iniciales, setIniciales] = useState("");
  const [numeroCasa, setNumeroCasa] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string>();

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
      const res = await fetch("/api/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ iniciales, numeroCasa }),
      });
      const datos = await res.json();
      if (!res.ok) throw new Error(datos.error ?? "Ocurrió un error inesperado.");
      onVerificado(datos);
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
    <form
      onSubmit={enviar}
      className="mt-6 rounded-lg border border-stone-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold">Identifícate como propietario</h2>
      <p className="mt-1 text-sm text-stone-600">
        Escribe las iniciales del propietario y el número de casa tal como están registrados en el
        padrón del coto.
      </p>

      <fieldset disabled={enviando} className="mt-5 space-y-5">
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
          className="w-full rounded-md bg-stone-900 px-4 py-3 font-medium text-white hover:bg-stone-800 disabled:opacity-50 sm:w-auto"
        >
          {enviando ? "Verificando…" : "Continuar al reglamento"}
        </button>
      </fieldset>
    </form>
  );
}

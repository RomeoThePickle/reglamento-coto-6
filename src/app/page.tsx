import Reglamento from "@/components/Reglamento";
import { NOMBRE_COTO } from "@/lib/config";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <header>
        <p className="text-sm font-medium tracking-wide text-stone-500 uppercase">{NOMBRE_COTO}</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Reglamento Interno</h1>
        <p className="mt-3 text-stone-600">
          Identifícate como propietario para consultar el reglamento. Al terminar de leerlo,
          confirma tu lectura al final de la página.
        </p>
      </header>

      <Reglamento />
    </main>
  );
}

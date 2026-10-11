import Reglamento from "@/components/Reglamento";
import { NOMBRE_COTO } from "@/lib/config";
import { getReglamento } from "@/lib/reglamento";

export default function Home() {
  const { url, version } = getReglamento();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <header>
        <p className="text-sm font-medium tracking-wide text-stone-500 uppercase">{NOMBRE_COTO}</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Reglamento Interno</h1>
        <p className="mt-3 text-stone-600">
          Lee el reglamento completo. Al terminar, confirma tu lectura con las iniciales del
          propietario y el número de casa.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener"
          className="mt-3 inline-block text-sm font-medium underline underline-offset-4"
        >
          Descargar PDF
        </a>
      </header>

      <Reglamento url={url} version={version} />
    </main>
  );
}

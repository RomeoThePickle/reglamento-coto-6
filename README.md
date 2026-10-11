# Reglamento Interno · Coto 6

Aplicación web que muestra el reglamento (PDF) y registra que cada propietario lo leyó y
aceptó el plazo de 10 días para presentar quejas o sugerencias.

- **Frontend y API:** Next.js en Vercel.
- **Base de datos:** Supabase (tabla `aceptaciones`).
- **PDF:** Supabase Storage, bucket público `reglamentos`.

## Cómo funciona

1. El reglamento se muestra página por página dentro del sitio (también funciona en celulares).
2. El formulario se habilita hasta que la persona se desplaza al final del documento.
3. Se piden las iniciales del propietario y el número de casa, y se marca la casilla de aceptación.
4. El servidor guarda el registro con la fecha, la versión del PDF y el navegador, y muestra un
   folio con la fecha límite del plazo.

La tabla tiene RLS activado sin políticas: solo el servidor (con la llave secreta) puede leer o
escribir. Nadie puede consultar ni borrar registros desde el navegador.

## Configuración

### 1. Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Aplica la migración `supabase/migrations/20261011000000_aceptaciones.sql`:
   - con la CLI: `supabase link --project-ref TU_PROYECTO && supabase db push`, o
   - copiando el SQL en el **SQL Editor** del panel.
3. En **Storage → reglamentos**, sube el PDF con un nombre que incluya la versión, por ejemplo
   `reglamento-2026-10.pdf`.

### 2. Variables de entorno

Copia `.env.example` a `.env.local` y llénalo (Project Settings → API en Supabase).

| Variable | Descripción |
| --- | --- |
| `SUPABASE_URL` | URL del proyecto |
| `SUPABASE_SECRET_KEY` | Llave secreta (`sb_secret_…`) o `service_role`. Solo servidor. |
| `REGLAMENTO_ARCHIVO` | Nombre exacto del PDF en el bucket |

### 3. Desarrollo local

```bash
npm install
npm run dev
```

### 4. Vercel

1. Importa el repositorio en Vercel (detecta Next.js automáticamente).
2. Agrega las tres variables de entorno en **Settings → Environment Variables**.
3. Despliega.

## Actualizar el reglamento

No reemplaces el archivo existente. Sube el PDF nuevo con otro nombre
(`reglamento-2027-01.pdf`), cambia `REGLAMENTO_ARCHIVO` en Vercel y vuelve a desplegar. Así cada
aceptación queda ligada al documento exacto que la persona leyó.

## Consultar las aceptaciones

En Supabase → **Table Editor → aceptaciones** (se puede exportar a CSV), o en el SQL Editor:

```sql
select numero_casa, iniciales, aceptado_en at time zone 'America/Mexico_City' as fecha
from aceptaciones
where version_reglamento = 'reglamento-2026-10.pdf'
order by numero_casa;
```

## Textos

El nombre del coto, el plazo en días y el texto de aceptación están en `src/lib/config.ts`.

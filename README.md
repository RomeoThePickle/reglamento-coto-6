# Reglamento Interno · Coto 6

Aplicación web que muestra el reglamento (PDF) y registra que cada propietario lo leyó y
aceptó el plazo de 10 días para presentar quejas o sugerencias.

- **Frontend y API:** Next.js en Vercel.
- **Base de datos:** Supabase (tabla `aceptaciones`).
- **Padrón:** Supabase (tabla `propietarios`, se llena a mano).
- **PDF:** Supabase Storage, bucket privado `reglamentos`.

## Cómo funciona

1. El propietario escribe sus iniciales y su número de casa. El servidor busca esa combinación en
   la tabla `propietarios`; si no existe, no puede continuar.
2. Si coincide, el servidor entrega un enlace temporal (1 hora) al PDF y el reglamento se muestra
   página por página dentro del sitio (también funciona en celulares).
3. Al llegar al final del documento se habilita la casilla de aceptación del plazo de 10 días.
4. El servidor vuelve a validar al propietario, guarda el registro con la fecha y la versión del
   PDF, y muestra un folio con la fecha límite del plazo.

Cada propietario solo puede aceptar una vez cada versión del reglamento. Si vuelve a entrar, ve su
comprobante original: el plazo no se reinicia.

Las tablas tienen RLS activado sin políticas: solo el servidor (con la llave secreta) puede leer o
escribir. Nadie puede consultar el padrón ni las aceptaciones desde el navegador.

## Configuración

### 1. Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Aplica las migraciones de `supabase/migrations/`, en orden:
   - con la CLI: `supabase link --project-ref TU_PROYECTO && supabase db push`, o
   - copiando el SQL de cada archivo en el **SQL Editor** del panel.
3. En **Storage → reglamentos**, sube el PDF con un nombre que incluya la versión, por ejemplo
   `reglamento-2026-10.pdf`.

### 2. Padrón de propietarios

En Supabase → **Table Editor → propietarios**, agrega una fila por propietario:

| Columna | Ejemplo | Notas |
| --- | --- | --- |
| `numero_casa` | `24`, `12-B` | Letras, números y guion. |
| `iniciales` | `JPG` | De 2 a 6 letras. |
| `nombre` | `Juan Pérez García` | Opcional, solo como referencia. |

No te preocupes por el formato: la base de datos convierte a mayúsculas y quita acentos, puntos y
espacios al guardar (`j. p. g.` → `JPG`, `Ó.Ñ.R.` → `ONR`). El sitio hace lo mismo con lo que
escribe el propietario, así que ambos coinciden. Si una casa tiene varios propietarios, agrega
una fila para cada uno.

También puedes cargarlo de golpe desde el SQL Editor:

```sql
insert into propietarios (numero_casa, iniciales, nombre) values
  ('1', 'JPG', 'Juan Pérez García'),
  ('2', 'MLH', 'María López Hernández');
```

### 3. Variables de entorno

Copia `.env.example` a `.env.local` y llénalo (Project Settings → API en Supabase).

| Variable | Descripción |
| --- | --- |
| `SUPABASE_URL` | URL del proyecto |
| `SUPABASE_SECRET_KEY` | Llave secreta (`sb_secret_…`) o `service_role`. Solo servidor. |
| `REGLAMENTO_ARCHIVO` | Nombre exacto del PDF en el bucket |

### 4. Desarrollo local

```bash
npm install
npm run dev
```

### 5. Vercel

1. Importa el repositorio en Vercel (detecta Next.js automáticamente).
2. Agrega las tres variables de entorno en **Settings → Environment Variables**.
3. Despliega.

## Actualizar el reglamento

No reemplaces el archivo existente. Sube el PDF nuevo con otro nombre
(`reglamento-2027-01.pdf`), cambia `REGLAMENTO_ARCHIVO` en Vercel y vuelve a desplegar. Así cada
aceptación queda ligada al documento exacto que la persona leyó.

## Consultar las aceptaciones

En Supabase → **Table Editor → aceptaciones** (se puede exportar a CSV), o en el SQL Editor.
Estado de cada propietario para la versión vigente:

```sql
select p.numero_casa, p.iniciales, p.nombre,
       a.aceptado_en at time zone 'America/Mexico_City' as fecha_aceptacion,
       (a.aceptado_en + interval '10 days') at time zone 'America/Mexico_City' as fecha_limite
from propietarios p
left join aceptaciones a
  on a.propietario_id = p.id and a.version_reglamento = 'reglamento-2026-10.pdf'
order by a.aceptado_en is not null, p.numero_casa;
```

Los propietarios con `fecha_aceptacion` vacía aún no han aceptado.

## Textos

El nombre del coto, el plazo en días y el texto de aceptación están en `src/lib/config.ts`.

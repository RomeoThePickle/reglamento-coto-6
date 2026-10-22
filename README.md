# Reglamento Interno · Coto 6

Aplicación web que muestra el reglamento (PDF) y registra que cada propietario lo leyó y
aceptó el plazo de 10 días para presentar quejas o sugerencias.

**El sitio no recibe quejas ni sugerencias.** Solo informa el plazo; los propietarios deben
entregarlas por escrito a la Mesa Directiva.

- **Frontend y API:** Next.js en Vercel.
- **Base de datos:** Supabase (tabla `aceptaciones`).
- **Padrón:** Supabase (tabla `propietarios`, se llena a mano).
- **PDF:** Supabase Storage, bucket privado `reglamentos`.

## Cómo funciona

1. En la primera pantalla, el propietario escribe sus iniciales y su número de casa, y marca la
   casilla de aceptación (obligatoria):

   > Acepto que, a partir de mi primer ingreso a este sitio, cuento con un plazo de 10 días
   > naturales para leer el Reglamento Interno del Coto 6 y presentar por escrito ante la Mesa
   > Directiva los comentarios y/o sugerencias que considere pertinentes. De no hacerlo dentro de
   > dicho plazo, acepto el reglamento en los términos en que se encuentra redactado.

2. El servidor busca la combinación casa + iniciales en la tabla `propietarios`; si no existe, no
   puede continuar. Si coincide, registra su ingreso (`ingresos`) y su aceptación
   (`aceptaciones`), y entrega un enlace temporal (1 hora) al PDF.
3. Se muestra cuántos días le quedan, el folio de su aceptación y el reglamento página por página
   (también funciona en celulares).

### El plazo de 10 días

- Corre desde el **primer ingreso** del propietario a cada versión del reglamento, no desde que
  acepta. Esa fecha se guarda una sola vez y no cambia aunque vuelva a entrar.
- Son días naturales y el último día cuenta completo (hora de `America/Mexico_City`): si entró
  el 21 de octubre a cualquier hora, tiene hasta el 31 de octubre a las 23:59.
- En cada ingreso se muestra "Te quedan N días", "Hoy es tu último día" o "Tu plazo venció".
- Solo se guarda la primera aceptación de cada propietario por versión. Si vuelve a entrar, debe
  marcar la casilla de nuevo, pero se le muestra el folio original.

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
       i.primer_ingreso at time zone 'America/Mexico_City' as primer_ingreso,
       (i.primer_ingreso at time zone 'America/Mexico_City')::date + 10 as ultimo_dia_plazo,
       a.aceptado_en at time zone 'America/Mexico_City' as fecha_aceptacion
from propietarios p
left join ingresos i
  on i.propietario_id = p.id and i.version_reglamento = 'reglamento-2026-10.pdf'
left join aceptaciones a
  on a.propietario_id = p.id and a.version_reglamento = 'reglamento-2026-10.pdf'
order by p.numero_casa;
```

Si `primer_ingreso` está vacío, el propietario no ha entrado (su plazo aún no corre). Si
`fecha_aceptacion` está vacía, no ha aceptado.

## Textos

El nombre del coto, el plazo en días y el texto de aceptación están en `src/lib/config.ts`.

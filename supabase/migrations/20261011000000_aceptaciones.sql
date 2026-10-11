-- Registro de aceptaciones del reglamento.
-- Solo el servidor (service role) escribe y lee esta tabla: RLS activado sin
-- políticas, por lo que la llave pública (anon) no tiene ningún acceso.
create table public.aceptaciones (
  id                 bigint generated always as identity primary key,
  numero_casa        text        not null check (char_length(numero_casa) between 1 and 10),
  iniciales          text        not null check (char_length(iniciales) between 2 and 6),
  version_reglamento text        not null,
  aceptado_en        timestamptz not null default now(),
  user_agent         text
);

alter table public.aceptaciones enable row level security;

create index aceptaciones_casa_idx on public.aceptaciones (numero_casa, version_reglamento);

-- Bucket público para el PDF del reglamento. Nunca sobrescribas un archivo:
-- sube cada versión con un nombre nuevo (p. ej. reglamento-2026-10.pdf) para
-- que cada aceptación quede ligada al documento exacto que se mostró.
insert into storage.buckets (id, name, public, allowed_mime_types)
values ('reglamentos', 'reglamentos', true, array['application/pdf'])
on conflict (id) do nothing;

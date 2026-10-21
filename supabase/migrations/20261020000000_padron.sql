-- Padrón de propietarios: se llena a mano desde el Table Editor de Supabase.
-- Una casa puede tener varios propietarios (una fila por cada uno).

-- Misma normalización que src/lib/validacion.ts: sin acentos, mayúsculas y sin
-- espacios, puntos ni guiones. Así "j. p. g." y "JPG" se guardan igual.
create function public.normalizar_iniciales(valor text) returns text
language sql immutable set search_path = '' as $$
  select regexp_replace(
    upper(translate(valor, 'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN')),
    '[[:space:].-]', '', 'g'
  )
$$;

create function public.normalizar_casa(valor text) returns text
language sql immutable set search_path = '' as $$
  select upper(regexp_replace(valor, '[[:space:]]', '', 'g'))
$$;

create table public.propietarios (
  id          bigint generated always as identity primary key,
  numero_casa text        not null check (numero_casa ~ '^[0-9A-Z][0-9A-Z-]{0,9}$'),
  iniciales   text        not null check (iniciales ~ '^[A-Z]{2,6}$'),
  nombre      text,       -- opcional, solo como referencia para la administración
  creado_en   timestamptz not null default now(),
  unique (numero_casa, iniciales)
);

alter table public.propietarios enable row level security;

create function public.normalizar_propietario() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.numero_casa := public.normalizar_casa(new.numero_casa);
  new.iniciales   := public.normalizar_iniciales(new.iniciales);
  return new;
end
$$;

create trigger propietarios_normalizar
before insert or update on public.propietarios
for each row execute function public.normalizar_propietario();

-- Cada aceptación queda ligada al propietario que la hizo. Solo se permite una
-- por propietario y versión, para que el plazo de 10 días no se pueda reiniciar.
alter table public.aceptaciones
  add column propietario_id bigint references public.propietarios (id) on delete set null;

create unique index aceptaciones_propietario_version_idx
  on public.aceptaciones (propietario_id, version_reglamento);

-- El PDF ahora solo se entrega con un enlace temporal tras validar al propietario.
update storage.buckets set public = false where id = 'reglamentos';

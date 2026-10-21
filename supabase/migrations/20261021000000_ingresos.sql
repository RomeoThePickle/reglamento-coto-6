-- Primer y último ingreso de cada propietario por versión del reglamento.
-- El plazo para presentar quejas o sugerencias corre desde el primer ingreso,
-- así que esa fecha nunca se modifica después de crearse la fila.
create table public.ingresos (
  propietario_id     bigint      not null references public.propietarios (id) on delete cascade,
  version_reglamento text        not null,
  primer_ingreso     timestamptz not null default now(),
  ultimo_ingreso     timestamptz not null default now(),
  primary key (propietario_id, version_reglamento)
);

alter table public.ingresos enable row level security;

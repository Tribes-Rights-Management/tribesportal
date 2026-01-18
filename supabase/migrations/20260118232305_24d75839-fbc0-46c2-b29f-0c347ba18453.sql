begin;

-- 1) Enum type for density mode (safe + explicit)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'ui_density_mode') then
    create type ui_density_mode as enum ('comfortable', 'compact');
  end if;
end $$;

-- 2) Column on user_profiles
alter table public.user_profiles
  add column if not exists ui_density_mode ui_density_mode not null default 'comfortable';

commit;
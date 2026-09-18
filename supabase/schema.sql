-- Prototype Library — Supabase schema
-- Run this in the Supabase SQL editor for your project.

create table if not exists projects (
  id          bigserial primary key,
  name        text not null,
  description text not null default '',
  test_type   text not null check (test_type in ('usability', 'ab', 'survey', 'other')),
  slug        text not null unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists versions (
  id           bigserial primary key,
  project_id   bigint not null references projects(id) on delete cascade,
  number       integer not null,
  label        text not null,
  changelog    text not null default '',
  test_notes   text not null default '',
  file_name    text not null,
  size_bytes   bigint not null default 0,
  is_published boolean not null default false,
  device       text not null default 'responsive'
               check (device in ('desktop','mobile','responsive')),
  created_at   timestamptz not null default now(),
  unique (project_id, number)
);

create table if not exists feedback (
  id          bigserial primary key,
  version_id  bigint not null references versions(id) on delete cascade,
  tester_name text not null,
  division    text not null,
  nps_score   integer not null check (nps_score between 1 and 5),
  feedback    text not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists idx_versions_project on versions(project_id);
create index if not exists idx_versions_published on versions(project_id, is_published);
create index if not exists idx_feedback_version on feedback(version_id);

-- App users (username -> auth.users). GoTrue has no native username,
-- so the login flow resolves username -> email through this table.
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text not null,
  email      text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_profiles_username_lower
  on profiles (lower(username));

-- Homepage list with aggregate columns.
create or replace view project_overview as
select
  p.id,
  p.name,
  p.description,
  p.test_type,
  p.slug,
  p.created_at,
  p.updated_at,
  (select count(*) from versions v where v.project_id = p.id) as version_count,
  (select v.label from versions v where v.project_id = p.id and v.is_published = true limit 1) as published_label,
  (select v.label from versions v where v.project_id = p.id order by v.number desc limit 1) as latest_label
from projects p;

-- Atomic publish: unpublish the rest, publish one, bump project updated_at.
create or replace function publish_version(p_version_id bigint, p_project_id bigint)
returns versions
language plpgsql
as $$
declare
  v versions%rowtype;
begin
  update versions set is_published = false where project_id = p_project_id;
  update versions set is_published = true where id = p_version_id;
  update projects set updated_at = now() where id = p_project_id;

  select * into v from versions where id = p_version_id;
  if not found then
    raise exception 'version not found';
  end if;
  return v;
end;
$$;
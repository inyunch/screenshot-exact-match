create table public.lakes (
  lake_id text primary key,
  name text,
  county text,
  lat double precision,
  lon double precision,
  acres double precision,
  max_depth_m double precision,
  n_launches integer,
  trailer_parking integer,
  n_wash_stations integer,
  infested boolean,
  zm_first_year integer,
  ss_first_year integer,
  risk_rank integer,
  risk_percentile double precision,
  risk_tier text,
  risk_prob double precision,
  exposure double precision,
  nearest_infested_km double precision,
  infested_within_25km integer,
  flag_near_source boolean,
  flag_busy_access boolean,
  flag_clarity_rising boolean,
  secchi_mean double precision,
  secchi_slope double precision,
  chl_mean double precision,
  chl_slope double precision,
  chl_percentile double precision,
  septic_screen text,
  ais_survey_year integer,
  ais_found_zm boolean,
  ais_found_ss boolean,
  secchi_2018 double precision,
  secchi_2019 double precision,
  secchi_2020 double precision,
  secchi_2021 double precision,
  secchi_2022 double precision,
  secchi_2023 double precision,
  chl_2018 double precision,
  chl_2019 double precision,
  chl_2020 double precision,
  chl_2021 double precision,
  chl_2022 double precision,
  chl_2023 double precision
);
create index lakes_rank_idx on public.lakes (risk_rank);
create index lakes_county_idx on public.lakes (county);
grant select on public.lakes to anon, authenticated;
grant all on public.lakes to service_role;
alter table public.lakes enable row level security;
create policy "public read" on public.lakes for select to anon, authenticated using (true);

create table public.nearest_sources (
  id bigint generated always as identity primary key,
  lake_id text,
  source_lake_id text,
  source_name text,
  source_county text,
  distance_km double precision,
  species text,
  first_year integer
);
create index nearest_lake_idx on public.nearest_sources (lake_id);
grant select on public.nearest_sources to anon, authenticated;
grant all on public.nearest_sources to service_role;
alter table public.nearest_sources enable row level security;
create policy "public read" on public.nearest_sources for select to anon, authenticated using (true);

create table public.metrics (
  key text primary key,
  value double precision,
  description text
);
grant select on public.metrics to anon, authenticated;
grant all on public.metrics to service_role;
alter table public.metrics enable row level security;
create policy "public read" on public.metrics for select to anon, authenticated using (true);
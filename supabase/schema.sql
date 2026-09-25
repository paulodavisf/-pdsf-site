create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  company text check (company is null or char_length(company) <= 120),
  email text not null check (char_length(email) between 6 and 254),
  phone text check (phone is null or char_length(phone) <= 40),
  service text check (service is null or char_length(service) <= 80),
  message text not null check (char_length(trim(message)) between 10 and 4000),
  privacy_consent boolean not null check (privacy_consent = true)
);

alter table public.contact_submissions enable row level security;

-- Public visitors may add a contact request; they cannot read, change, or delete submissions.
revoke all on table public.contact_submissions from anon, authenticated;
grant insert on table public.contact_submissions to anon;

drop policy if exists "Allow public contact submissions" on public.contact_submissions;
create policy "Allow public contact submissions"
  on public.contact_submissions
  for insert
  to anon
  with check (
    char_length(trim(name)) between 2 and 120
    and char_length(email) between 6 and 254
    and char_length(trim(message)) between 10 and 4000
    and privacy_consent = true
  );

-- Newsletter Tan Tan Teatro
-- Da eseguire una volta nel SQL Editor di Supabase (Dashboard → SQL Editor → New query).
--
-- Sicurezza: la tabella ha RLS attivo e nessuna policy, quindi la chiave pubblica
-- del sito non può leggere né modificare gli iscritti. Il sito può solo chiamare
-- la funzione subscribe_newsletter, che aggiunge un indirizzo e non restituisce nulla
-- (così non si può scoprire se un'email è già iscritta).

create table if not exists public.newsletter_subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  locale          text not null default 'it' check (locale in ('it', 'en')),
  source          text,
  consent_at      timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  unsubscribed_at timestamptz
);

alter table public.newsletter_subscribers enable row level security;

create or replace function public.subscribe_newsletter(
  p_email  text,
  p_locale text default 'it',
  p_source text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
begin
  if v_email is null
     or length(v_email) > 254
     or v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'invalid_email' using errcode = '22023';
  end if;

  insert into public.newsletter_subscribers (email, locale, source)
  values (
    v_email,
    case when p_locale = 'en' then 'en' else 'it' end,
    left(p_source, 40)
  )
  on conflict (email) do update
    set unsubscribed_at = null,
        consent_at      = now(),
        locale          = excluded.locale
    where public.newsletter_subscribers.unsubscribed_at is not null;
end;
$$;

revoke all on function public.subscribe_newsletter(text, text, text) from public;
grant execute on function public.subscribe_newsletter(text, text, text) to anon, authenticated;

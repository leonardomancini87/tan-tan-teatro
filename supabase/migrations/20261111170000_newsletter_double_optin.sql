-- Newsletter: conferma dell'iscrizione tramite link (double opt-in)
-- Da eseguire una volta nel SQL Editor di Supabase (Dashboard → SQL Editor → New query).
--
-- Come funziona:
--   1. Il modulo del sito chiama la Edge Function newsletter-subscribe, che salva
--      l'indirizzo come "da confermare" e invia l'email con il link.
--   2. Il link apre /newsletter/conferma, che chiama confirm_newsletter(token).
--   3. Ogni email contiene anche il link /newsletter/disiscrizione?token=…,
--      che chiama unsubscribe_newsletter_token(token).
--
-- Per gli invii usa solo le righe con confirmed_at valorizzato e unsubscribed_at vuoto.

alter table public.newsletter_subscribers
  add column if not exists confirmed_at      timestamptz,
  add column if not exists confirm_token     uuid not null default gen_random_uuid(),
  add column if not exists confirm_sent_at   timestamptz,
  add column if not exists unsubscribe_token uuid not null default gen_random_uuid();

create unique index if not exists newsletter_subscribers_confirm_token_idx
  on public.newsletter_subscribers (confirm_token);
create unique index if not exists newsletter_subscribers_unsubscribe_token_idx
  on public.newsletter_subscribers (unsubscribe_token);

-- Chi si è iscritto prima di questo cambiamento aveva già dato il consenso nel modulo.
update public.newsletter_subscribers
   set confirmed_at = created_at
 where confirmed_at is null
   and unsubscribed_at is null;

-- Il vecchio percorso diretto (subscribe_newsletter) resta attivo finché il sito
-- non usa la Edge Function, così il modulo non si interrompe. Le righe che crea
-- restano "da confermare" e non ricevono invii. Dopo la pubblicazione si può
-- chiudere con:
--   revoke execute on function public.subscribe_newsletter(text, text, text) from anon, authenticated;

-- Conferma dal link dell'email. Il link vale 7 giorni dall'invio.
create or replace function public.confirm_newsletter(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.newsletter_subscribers
     set confirmed_at = coalesce(confirmed_at, now())
   where confirm_token = p_token
     and unsubscribed_at is null
     and (confirmed_at is not null
          or confirm_sent_at is null
          or confirm_sent_at > now() - interval '7 days');
  get diagnostics v_count = row_count;
  return v_count > 0;
end;
$$;

revoke all on function public.confirm_newsletter(uuid) from public;
grant execute on function public.confirm_newsletter(uuid) to anon, authenticated;

-- Disiscrizione dal link dell'email.
create or replace function public.unsubscribe_newsletter_token(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.newsletter_subscribers
     set unsubscribed_at = coalesce(unsubscribed_at, now())
   where unsubscribe_token = p_token;
  get diagnostics v_count = row_count;
  return v_count > 0;
end;
$$;

revoke all on function public.unsubscribe_newsletter_token(uuid) from public;
grant execute on function public.unsubscribe_newsletter_token(uuid) to anon, authenticated;

notify pgrst, 'reload schema';

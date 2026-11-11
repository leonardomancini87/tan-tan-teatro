-- Disiscrizione dalla newsletter Tan Tan Teatro
-- Da eseguire una volta nel SQL Editor di Supabase (Dashboard → SQL Editor → New query).
--
-- La funzione segna l'indirizzo come disiscritto (unsubscribed_at) senza cancellarlo,
-- così resta traccia della richiesta. Non restituisce nulla: dal sito non si può
-- scoprire se un'email era iscritta oppure no.

create or replace function public.unsubscribe_newsletter(p_email text)
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

  update public.newsletter_subscribers
     set unsubscribed_at = now()
   where email = v_email
     and unsubscribed_at is null;
end;
$$;

revoke all on function public.unsubscribe_newsletter(text) from public;
grant execute on function public.unsubscribe_newsletter(text) to anon, authenticated;

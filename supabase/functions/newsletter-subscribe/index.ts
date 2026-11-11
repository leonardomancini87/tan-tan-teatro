// Edge Function: iscrizione alla newsletter con conferma tramite link.
//
// Chiamata dal modulo del sito (NewsletterForm.astro) con la chiave pubblica.
// Salva l'indirizzo come "da confermare" e invia l'email con il link di conferma
// tramite Resend. Risponde sempre allo stesso modo, cosi dal sito non si puo
// capire se un indirizzo e gia iscritto.
//
// Secret usati (gia presenti per le altre funzioni email):
//   RESEND_API_KEY                      obbligatorio
//   NEWSLETTER_EMAIL_FROM               facoltativo, altrimenti RESEND_FROM_EMAIL / RESEND_FROM
//   NEWSLETTER_EMAIL_REPLY_TO           facoltativo, altrimenti RESEND_REPLY_TO
// SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sono forniti da Supabase.
//
// Va pubblicata con la verifica JWT disattivata (la chiave pubblica del sito non e un JWT):
//   supabase functions deploy newsletter-subscribe --no-verify-jwt
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SITE = 'https://www.tantanteatro.it'
const ALLOWED_ORIGINS = new Set([
  'https://www.tantanteatro.it',
  'https://tantanteatro.it',
  'http://localhost:4321',
])
// Non reinviare l'email di conferma allo stesso indirizzo prima di questo intervallo.
const RESEND_COOLDOWN_MS = 2 * 60 * 1000

const cors = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin && ALLOWED_ORIGINS.has(origin) ? origin : SITE,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  Vary: 'Origin',
})

const isEmail = (value: string) =>
  value.length <= 254 && /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(value)

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

const copy = {
  it: {
    subject: 'Conferma la tua iscrizione alla newsletter di Tan Tan Teatro',
    title: 'Conferma la tua iscrizione',
    body: 'Grazie per esserti iscritto alla newsletter di Tan Tan Teatro. Per completare l\u2019iscrizione, conferma il tuo indirizzo email.',
    button: 'Conferma l\u2019iscrizione',
    note: 'Il link vale 7 giorni. Se non hai chiesto tu l\u2019iscrizione, ignora questa email: senza conferma non riceverai nulla.',
    unsubscribe: 'Non vuoi pi\u00f9 ricevere le nostre email?',
    unsubscribeLink: 'Disiscriviti',
    confirmPath: '/newsletter/conferma',
    unsubscribePath: '/newsletter/disiscrizione',
  },
  en: {
    subject: 'Confirm your subscription to the Tan Tan Teatro newsletter',
    title: 'Confirm your subscription',
    body: 'Thank you for subscribing to the Tan Tan Teatro newsletter. To complete your subscription, please confirm your email address.',
    button: 'Confirm subscription',
    note: 'The link is valid for 7 days. If you did not request this, just ignore this email: without confirmation you will receive nothing.',
    unsubscribe: 'No longer want our emails?',
    unsubscribeLink: 'Unsubscribe',
    confirmPath: '/en/newsletter/confirm',
    unsubscribePath: '/en/newsletter/unsubscribe',
  },
}

Deno.serve(async (req) => {
  const headers = { ...cors(req.headers.get('Origin')), 'Content-Type': 'application/json' }
  const json = (status: number, body: Record<string, unknown>) =>
    new Response(JSON.stringify(body), { status, headers })

  if (req.method === 'OPTIONS') return new Response('ok', { headers })
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  const emailFrom = Deno.env.get('NEWSLETTER_EMAIL_FROM') ??
    Deno.env.get('RESEND_FROM_EMAIL') ??
    Deno.env.get('RESEND_FROM') ??
    'Tan Tan Teatro <prenotazioni@biglietti.tantanteatro.it>'
  const replyTo = Deno.env.get('NEWSLETTER_EMAIL_REPLY_TO') ??
    Deno.env.get('RESEND_REPLY_TO') ??
    'info@tantanteatro.it'

  if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
    console.error('newsletter-subscribe: configurazione incompleta')
    return json(500, { error: 'not_configured' })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json(400, { error: 'invalid_body' })
  }

  const email = String(body.email ?? '').trim().toLowerCase()
  const locale = body.locale === 'en' ? 'en' : 'it'
  const source = String(body.source ?? '').slice(0, 40) || null
  const website = String(body.website ?? '')

  // Campo trappola compilato: e un bot. Rispondiamo come se fosse andata bene.
  if (website) return json(200, { ok: true })
  if (!isEmail(email)) return json(400, { error: 'invalid_email' })
  if (body.consent !== true) return json(400, { error: 'consent_required' })

  const db = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: existing, error: readError } = await db
    .from('newsletter_subscribers')
    .select('id, confirmed_at, unsubscribed_at, confirm_sent_at')
    .eq('email', email)
    .maybeSingle()
  if (readError) {
    console.error('newsletter-subscribe: lettura', readError)
    return json(500, { error: 'server_error' })
  }

  // Gia iscritto e confermato: niente da fare, nessuna email.
  if (existing?.confirmed_at && !existing.unsubscribed_at) return json(200, { ok: true })

  // Email di conferma appena inviata: non la rimandiamo subito.
  if (existing?.confirm_sent_at && !existing.unsubscribed_at &&
      Date.now() - new Date(existing.confirm_sent_at).getTime() < RESEND_COOLDOWN_MS) {
    return json(200, { ok: true })
  }

  const fields = {
    email,
    locale,
    source,
    consent_at: new Date().toISOString(),
    confirmed_at: null,
    unsubscribed_at: null,
    confirm_token: crypto.randomUUID(),
    confirm_sent_at: new Date().toISOString(),
  }
  const { data: saved, error: saveError } = await db
    .from('newsletter_subscribers')
    .upsert(fields, { onConflict: 'email' })
    .select('confirm_token, unsubscribe_token')
    .single()
  if (saveError || !saved) {
    console.error('newsletter-subscribe: salvataggio', saveError)
    return json(500, { error: 'server_error' })
  }

  const t = copy[locale]
  const confirmUrl = `${SITE}${t.confirmPath}/?token=${saved.confirm_token}`
  const unsubscribeUrl = `${SITE}${t.unsubscribePath}/?token=${saved.unsubscribe_token}`

  const html = `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"></head><body style="margin:0;padding:32px 16px;background:#f2f0ec;color:#201b1b;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:560px;margin:0 auto;background:#faf9f6;border:1px solid #dedad3;padding:36px 32px">
<p style="margin:0 0 28px;font-size:13px;letter-spacing:2px;text-transform:uppercase">Tan Tan Teatro</p>
<h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:30px;line-height:1.15">${escapeHtml(t.title)}</h1>
<p style="margin:0 0 26px;font-size:16px;line-height:1.6">${escapeHtml(t.body)}</p>
<p style="margin:0 0 26px"><a href="${confirmUrl}" style="display:inline-block;background:#201b1b;color:#ffffff;text-decoration:none;font-size:13px;letter-spacing:1.2px;text-transform:uppercase;padding:15px 24px;border-radius:2px">${escapeHtml(t.button)}</a></p>
<p style="margin:0 0 26px;font-size:13px;line-height:1.55;color:#6b6660">${escapeHtml(t.note)}</p>
<p style="margin:0;padding-top:18px;border-top:1px solid #dedad3;font-size:12px;line-height:1.5;color:#6b6660">${escapeHtml(t.unsubscribe)} <a href="${unsubscribeUrl}" style="color:#6b6660">${escapeHtml(t.unsubscribeLink)}</a></p>
</div></body></html>`
  const text = `${t.title}\n\n${t.body}\n\n${t.button}: ${confirmUrl}\n\n${t.note}\n\n${t.unsubscribe} ${unsubscribeUrl}`

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `newsletter-confirm-${saved.confirm_token}`,
    },
    body: JSON.stringify({
      from: emailFrom,
      to: [email],
      subject: t.subject,
      html,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
      headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` },
    }),
  })
  if (!response.ok) {
    console.error('newsletter-subscribe: Resend', response.status, await response.text())
    return json(502, { error: 'email_failed' })
  }

  return json(200, { ok: true })
})

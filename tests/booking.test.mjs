import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const booking = readFileSync(resolve(root, 'src/templates/Booking.astro'), 'utf8');

test('Booking page sends requests through the create-public-booking Edge Function', () => {
  assert(booking.includes('/functions/v1/create-public-booking'));
  assert(!booking.includes('/rest/v1/public_booking_requests'));
  for (const field of ['sourceKey', 'fullName', 'email', 'phone', 'seats', 'notes', 'attendees', 'privacyAccepted']) assert(booking.includes(field));
  assert(booking.includes('givenName'));
  assert(booking.includes('surname'));
});

test('Success message reflects confirmed and waitlisted bookings', () => {
  assert(booking.includes('data-success-kicker'));
  assert(booking.includes("status === 'waitlisted'"));
  assert(booking.includes('LISTA D’ATTESA'));
  assert(booking.includes("result?.emailDelivery === 'failed'"));
});

test('Form has validation, spam trap, privacy information and mobile layout', () => {
  assert(booking.includes('type="email"'));
  assert(booking.includes('booking-website'));
  assert(booking.includes('Privacy Policy'));
  assert(booking.includes("questa prenotazione (consulta la '"));
  assert(booking.includes('@media (max-width:640px)'));
});

test('Additional seats require the names of every additional spectator', () => {
  assert(booking.includes('data-spectators'));
  assert(booking.includes('data-spectator-field'));
  assert(booking.includes("firstName:'Nome'"));
  assert(booking.includes("lastName:'Cognome'"));
  assert(booking.includes("input.required = true"));
  assert(booking.includes("data-spectator-person"));
});

test('First spectator has separate first and last name fields', () => {
  assert(booking.includes('name="first_name"'));
  assert(booking.includes('name="last_name"'));
  assert(booking.includes("values.get('first_name')"));
  assert(booking.includes("values.get('last_name')"));
});

test('Booking details capitalize the weekday and include the verified Dravelli address', () => {
  assert(booking.includes("toLocaleUpperCase(isEn ? 'en-GB' : 'it-IT')"));
  assert(booking.includes('Via Praciosa 11, 10024 Moncalieri (TO)'));
  assert(booking.includes('locationLabel(appointment)'));
});

test('Booking labels explicitly inherit the neutral site palette', () => {
  assert(booking.includes(':global(.tt-booking-spectators .tt-booking-field label)'));
  assert(booking.includes('color:var(--tt-ink, currentColor) !important;'));
});

test('Dravelli bookings show performance time, free admission and Arci admission information', () => {
  assert(booking.includes('data-dravelli-details'));
  assert(booking.includes('Inizio spettacolo:'));
  assert(booking.includes("' ore 21:00.'"));
  assert(booking.includes('Ingresso gratuito.'));
  assert(!booking.includes('Contributo richiesto:'));
  assert(!booking.includes('data-limit'));
  assert(booking.includes('è richiesta la tessera ARCI, ottenibile in loco o '));
  assert(booking.includes('href="https://portale.arci.it"'));
  assert(booking.includes("locationText.includes('dravelli')"));
  assert(!booking.includes('Richiedi ora i tuoi posti.'));
  assert(!booking.includes("'Spettatore 1'"));
});


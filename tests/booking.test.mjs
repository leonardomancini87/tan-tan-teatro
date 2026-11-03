import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const booking = readFileSync(resolve(root, 'src/templates/Booking.astro'), 'utf8');

test('Booking page writes to the existing admin booking queue', () => {
  assert(booking.includes('/rest/v1/public_booking_requests'));
  for (const field of ['appointment_id', 'full_name', 'email', 'phone', 'seats', 'notes']) assert(booking.includes(field));
});

test('Booking is explicitly a request, not yet a confirmation', () => {
  assert(booking.includes('Non è ancora una conferma'));
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
  assert(booking.includes("copy.others"));
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
  assert(booking.includes('Ore spettacolo:'));
  assert(booking.includes("ore 21."));
  assert(booking.includes('Ingresso gratuito.'));
  assert(!booking.includes('Contributo richiesto:'));
  assert(!booking.includes('data-limit'));
  assert(booking.includes('è richiesta la tessera ARCI, ottenibile in loco o '));
  assert(booking.includes('href="https://portale.arci.it"'));
  assert(booking.includes("locationText.includes('dravelli')"));
  assert(!booking.includes('Richiedi ora i tuoi posti.'));
  assert(!booking.includes("'Spettatore 1'"));
});


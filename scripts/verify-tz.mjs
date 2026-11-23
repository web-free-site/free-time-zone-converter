#!/usr/bin/env node
import { offsetMinutes, wallTimeToInstant, zonedParts, formatTime } from '../public/assets/js/tz.js';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const inst = wallTimeToInstant('America/New_York', 2026, 7, 15, 14, 30);
const p = zonedParts('America/New_York', inst);
assert(p.hour === 14 && p.minute === 30, `NYC wall time expected 14:30 got ${p.hour}:${p.minute}`);

const inst2 = wallTimeToInstant('America/Los_Angeles', 2026, 7, 15, 14, 30);
const la = zonedParts('America/Los_Angeles', inst2);
assert(la.hour === 14 && la.minute === 30, `LA wall time expected 14:30`);

const ny3pm = wallTimeToInstant('America/New_York', 2026, 1, 15, 15, 0);
const tokyo = formatTime('Asia/Tokyo', ny3pm, false);
assert(tokyo && tokyo.length > 0, 'Tokyo conversion');

const dstSummer = offsetMinutes('America/New_York', new Date('2026-07-01T12:00:00Z'));
const dstWinter = offsetMinutes('America/New_York', new Date('2026-01-01T12:00:00Z'));
assert(dstSummer !== dstWinter, 'DST should change NYC offset');

console.log('verify-tz: OK', { nycSummerOffset: dstSummer, nycWinterOffset: dstWinter, tokyo });
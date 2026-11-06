// Auvera™ — Voice module
// Audio clips, TTS, Web Speech recognition, and voice-guided sale flow.
// Extracted from index.html monolith during reengineering.

// Audio clip file paths (place .m4a or .mp3 in the voice/ folder per language)
export const CLIP = {
  'en-talk-now':   'voice/talk-now.m4a',
  'en-no-hear':    'voice/no-hear.m4a',
  'en-no-mic':     'voice/no-mic.m4a',
  'en-okay':       'voice/okay.m4a',
  'en-q-name':     'voice/q-name.m4a',
  'en-q-item':     'voice/q-item.m4a',
  'en-q-amount':   'voice/q-amount.m4a',
  'en-q-when':     'voice/q-when.m4a',
  'en-sale-saved': 'voice/sale-saved.m4a'
};

export function supportsAudio() {
  return !!(window.Audio || new Audio().canPlayType);
}

export function playClip(key, { fallbackText, lang = 'en' } = {}) {
  const path = CLIP[key];
  if (path) {
    const a = new Audio(path);
    a.play().catch(function() {
      // Audio may be blocked; fall back to TTS
      if (fallbackText) speak(fallbackText, { lang });
    });
    return;
  }
  if (fallbackText) speak(fallbackText, { lang });
}

export function speak(text, { lang = 'en-US', rate = 1, pitch = 1 } = {}) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = rate;
  u.pitch = pitch;
  window.speechSynthesis.speak(u);
}

// ===== Voice Recognition (Web Speech API) =====
export class VoiceRecognizer {
  constructor({ onResult, onError, onStart, onEnd }) {
    this.onResult = onResult;
    this.onError = onError;
    this.onStart = onStart;
    this.onEnd = onEnd;
    this.rec = null;
    this.supported = !!(
      window.SpeechRecognition || window.webkitSpeechRecognition
    );
  }

  start({ lang = 'en-US', continuous = false, interim = false } = {}) {
    if (!this.supported) {
      if (this.onError) this.onError('Voice recognition not supported in this browser.');
      return;
    }
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.rec = new Ctor();
    this.rec.lang = lang;
    this.rec.continuous = continuous;
    this.rec.interimResults = interim;

    this.rec.onstart = () => { if (this.onStart) this.onStart(); };
    this.rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      if (this.onResult) this.onResult(text);
    };
    this.rec.onerror = () => { if (this.onError) this.onError('Error capturing voice.'); };
    this.rec.onend = () => { if (this.onEnd) this.onEnd(); };

    try { this.rec.start(); } catch (_) {
      if (this.onError) this.onError('Could not start voice recognition.');
    }
  }

  stop() {
    if (this.rec) {
      try { this.rec.stop(); } catch (_) {}
      this.rec = null;
    }
  }
}

// ===== Smart word-to-number / word-to-day parsing =====
const amountWords = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
  eighty: 80, ninety: 90, hundred: 100, thousand: 1000,
  rand: 0, rands: 0
};

const daysWords = {
  today: 0, tomorrow: 1, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6, sunday: 7,
  mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 7
};

export function numFromWords(text) {
  const w = String(text || '').toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/);
  let total = 0, current = 0;
  for (let i = 0; i < w.length; i++) {
    const val = amountWords[w[i]];
    if (val === undefined) continue;
    if (val === 100 || val === 1000) {
      current = (current || 1) * val;
      total += current; current = 0;
    } else {
      current += val;
    }
  }
  total += current;
  return total || 0;
}

export function dayFromWords(text) {
  const w = String(text || '').toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/);
  for (let i = 0; i < w.length; i++) {
    const d = daysWords[w[i]];
    if (d !== undefined) return d;
  }
  return null;
}

// Process voice transcript: extract name, amount, due date offset
export function processVoiceWords(text) {
  const lower = String(text || '').toLowerCase();
  const amount = numFromWords(lower);
  const dayOffset = dayFromWords(lower);

  // Strip numbers and day words to get the name
  let name = lower
    .replace(/\d+/g, ' ')
    .replace(/\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|rand|rands)\b/g, ' ')
    .replace(/\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return { name, amount, dayOffset };
}

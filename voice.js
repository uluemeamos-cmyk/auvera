// Auvera™ — Voice module
// Extracted from index.html monolith during reengineering.
// Web Speech API: recognition (input) + synthesis (output).

export class Voice {
  constructor({ onResult, onError, onEnd, onStart }) {
    this.onResult = onResult;
    this.onError = onError;
    this.onEnd = onEnd;
    this.onStart = onStart;
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

    this.rec.onstart = () => {
      if (this.onStart) this.onStart();
    };

    this.rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      if (this.onResult) this.onResult(text);
    };

    this.rec.onerror = () => {
      if (this.onError) this.onError('Error capturing voice.');
    };

    this.rec.onend = () => {
      if (this.onEnd) this.onEnd();
    };

    try {
      this.rec.start();
    } catch (err) {
      if (this.onError) this.onError('Could not start voice recognition.');
    }
  }

  stop() {
    if (this.rec) {
      try { this.rec.stop(); } catch (_) {}
      this.rec = null;
    }
  }

  // Text-to-speech: speak a string
  speak(text, { lang = 'en-US', rate = 1, pitch = 1 } = {}) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    u.pitch = pitch;
    window.speechSynthesis.speak(u);
  }

  // Speak the money summary (received / unpaid)
  speakMoney(received, unpaid) {
    const text = `You have received ${received} this month. You are owed ${unpaid}.`;
    this.speak(text);
  }
}
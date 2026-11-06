// Auvera™ — App module
// State, storage, rendering, actions, WhatsApp, onboarding.
// Extracted from index.html monolith during reengineering.

import { LANGS, I, METHODS, t, method, methodName, langName, explorer } from './i18n.js';
import { CLIP, supportsAudio, playClip, speak, VoiceRecognizer, numFromWords, dayFromWords, processVoiceWords } from './voice.js';

/* ===== State ===== */
const KEY = 'auvera-test-v2';

let db = {
  biz: '',
  lang: 'en',
  ui: 'en',
  bank: '',
  link: '',
  next: 1004,
  sales: [],
  alarms: []
};

let ui = {
  curSale: null,
  saleIndex: null,
  recognition: null,
  synth: null,
  alarmsInterval: null
};

/* ===== DOM ===== */
const $ = (id) => document.getElementById(id);

/* ===== Helpers ===== */
function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function iso(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}
function addDays(n) {
  const d = today();
  d.setDate(d.getDate() + n);
  return iso(d);
}
function parse(s) {
  const p = String(s || iso(today())).split('-');
  return new Date(+p[0], +p[1] - 1, +p[2]);
}
function daysFrom(s) {
  return Math.round((parse(s) - today()) / 86400000);
}
function fmtDate(s) {
  const d = parse(s);
  return d.getDate() + '/' + (d.getMonth() + 1);
}
function money(n) {
  return Math.round(n).toLocaleString('en-ZA').replace(/[,  ]/g, ' ');
}
function initials(n) {
  const p = String(n || '?').trim().split(/\s+/);
  return ((p[0] || '?').charAt(0) + (p.length > 1 ? p[p.length - 1].charAt(0) : '')).toUpperCase();
}

/* ===== Storage ===== */
function load() {
  const raw = localStorage.getItem(KEY);
  if (raw) {
    try { db = JSON.parse(raw); } catch (_) {}
  }
  if (!db.biz) db.biz = '';
  if (!db.lang) db.lang = 'en';
  if (!db.ui) db.ui = 'en';
  if (!db.next) db.next = 1004;
  if (!db.sales) db.sales = [];
  if (!Array.isArray(db.sales)) db.sales = [];
  if (!db.alarms) db.alarms = [];
}
function save() {
  localStorage.setItem(KEY, JSON.stringify(db));
}

/* ===== Language dropdowns ===== */
function populateLangs() {
  function fill(selectId, value) {
    const sel = $(selectId);
    if (!sel) return;
    sel.innerHTML = '';
    LANGS.forEach(function(l) {
      const o = document.createElement('option');
      o.value = l[0];
      o.textContent = l[1];
      if (l[0] === value) o.selected = true;
      sel.appendChild(o);
    });
  }
  fill('fLang', db.lang);
  fill('sLang', db.lang);
  fill('sUi', db.ui);

  const picker = $('#obLangPicker');
  if (picker) {
    picker.innerHTML = '';
    LANGS.forEach(function(l) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = l[1];
      b.onclick = function() {
        $('obLang').value = l[0];
        document.querySelectorAll('#obLangPicker button').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
      };
      if (l[0] === db.lang) b.classList.add('active');
      picker.appendChild(b);
    });
  }
}

/* ===== Voice ===== */
const voiceRec = new VoiceRecognizer({
  onResult: (text) => onVoiceResult(text),
  onError: (msg) => { $('voiceStatus').textContent = msg; },
  onStart: () => { $('voiceStatus').textContent = 'Listening… Speak name & amount'; },
  onEnd: () => {}
});

function onVoiceResult(text) {
  $('voiceStatus').textContent = 'Recognized: "' + text + '"';
  const { name, amount, dayOffset } = processVoiceWords(text);
  if (name) $('fName').value = name;
  if (amount) $('fAmount').value = amount;
  if (dayOffset !== null) $('fDue').value = addDays(dayOffset);
}

/* ===== Sample / example data ===== */
function sample() {
  return {
    biz: '',
    lang: 'en',
    ui: 'en',
    bank: '',
    link: '',
    next: 1004,
    sales: [
      {
        id: 's1', no: 1001, name: 'Mr Adeyemi', phone: '0721234567',
        item: 'suit alterations', amount: 2000, lang: 'pcm',
        created: addDays(-12), due: addDays(-5),
        invoiceSent: true, paid: null, example: true
      },
      {
        id: 's2', no: 1002, name: 'Lerato K.', phone: '0831234567',
        item: 'wig install', amount: 1400, lang: 'en',
        created: addDays(-3), due: addDays(0),
        invoiceSent: true, paid: null, example: true
      },
      {
        id: 's3', no: 1003, name: 'Thandiwe N.', phone: '0611234567',
        item: 'hair braids', amount: 950, lang: 'en',
        created: addDays(-1), due: addDays(3),
        invoiceSent: false, paid: null, example: true
      }
    ],
    alarms: []
  };
}

/* ===== Rendering ===== */
function setLang() {
  document.documentElement.lang = db.ui;
  if (db.ui === 'ur') {
    document.body.setAttribute('dir', 'rtl');
  } else {
    document.body.removeAttribute('dir');
  }
  populateLangs();
  render();
}

function go(panel) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('visible'));
  const p = $(panel);
  if (p) p.classList.add('visible');

  document.querySelectorAll('.tabbar .tab').forEach(b => b.classList.remove('active'));
  const t = document.querySelector('.tabbar .tab[data-target="' + panel + '"]');
  if (t) t.classList.add('active');

  if (panel === 'home') renderHome();
  if (panel === 'sell') renderSell();
  if (panel === 'owed') renderOwed();
  if (panel === 'paid') renderPaid();
  if (panel === 'settings') renderSettings();
  if (panel === 'sale') renderSaleDetail();
}

function render() {
  setLang();
  $('bizName').textContent = db.biz || 'Auvera Business';
  $('bizChip').textContent = db.biz ? '✓ ' + db.biz : 'AUVERA';
  renderHome();
  renderOwed();
  renderPaid();
  updateLateBadge();
}

function renderHome() {
  let received = 0, unpaid = 0, lateCount = 0;
  let recentHTML = '', owedHTML = '', paidHTML = '';

  db.sales.forEach(s => {
    const amt = Number(s.amount) || 0;
    const statusPaid = !!s.paid;
    const card = '<div class="sale-card">' +
      '<div class="info"><b>' + escapeHtml(s.name) + '</b>' +
      '<div class="sub">' + (statusPaid ? 'Paid' : 'Unpaid') + '</div></div>' +
      '<b class="amt ' + (statusPaid ? 'paid' : 'unpaid') + '">R' + money(amt) + '</b>' +
      '</div>';
    recentHTML += card;
    if (statusPaid) {
      received += amt;
      paidHTML += card;
    } else {
      unpaid += amt;
      lateCount++;
      owedHTML += card;
    }
  });

  $('mReceived').textContent = 'R' + money(received);
  $('mUnpaid').textContent = 'R' + money(unpaid);
  $('mLate').textContent = lateCount;

  $('recentList').innerHTML = recentHTML || 'No sales recorded yet.';
  $('owedList').innerHTML = owedHTML || 'No unpaid balances.';
  $('paidList').innerHTML = paidHTML || 'No payments recorded.';
}

function renderOwed() {
  let html = '';
  db.sales.forEach(s => {
    if (s.paid) return;
    const overdue = daysFrom(s.due) < 0;
    const cls = 'sale-card ' + (overdue ? 'late' : '');
    const days = Math.abs(daysFrom(s.due));
    const dueText = overdue ? days + ' days overdue' : 'due in ' + days + ' days';
    html += '<div class="' + cls + '">' +
      '<div class="info"><b>' + escapeHtml(s.name) + '</b>' +
      '<div class="sub">' + escapeHtml(s.item) + ' • ' + dueText + '</div></div>' +
      '<b class="amt unpaid">R' + money(Number(s.amount) || 0) + '</b>' +
      '</div>';
  });
  $('owedList').innerHTML = html || 'No unpaid balances.';
}

function renderPaid() {
  let html = '';
  db.sales.forEach(s => {
    if (!s.paid) return;
    html += '<div class="sale-card">' +
      '<div class="info"><b>' + escapeHtml(s.name) + '</b>' +
      '<div class="sub">Paid</div></div>' +
      '<b class="amt paid">R' + money(Number(s.amount) || 0) + '</b>' +
      '</div>';
  });
  $('paidList').innerHTML = html || 'No payments recorded.';
}

function updateLateBadge() {
  let late = 0;
  db.sales.forEach(s => { if (!s.paid && daysFrom(s.due) < 0) late++; });
  const b = $('tabOwedBadge');
  if (b) {
    if (late > 0) { b.textContent = late; b.hidden = false; }
    else { b.hidden = true; }
  }
}

function renderSell() {
  $('fName').value = '';
  $('fAmount').value = '';
  $('fItem').value = '';
  $('fDue').value = addDays(0);
  $('fPaid').checked = false;
  $('fLang').value = db.lang;
  $('fBank').value = db.bank || '';
  $('fLink').value = db.link || '';
  $('voiceStatus').textContent = '';
  $('confirmBox').innerHTML = '';
}

function renderSettings() {
  $('sBiz').value = db.biz;
  $('sBank').value = db.bank;
  $('sLink').value = db.link;
  $('sLang').value = db.lang;
  $('sUi').value = db.ui;
}

/* ===== Escape HTML ===== */
function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

/* ===== Sale detail view ===== */
function saleCard(s) {
  const overdue = daysFrom(s.due) < 0 && !s.paid;
  const paid = !!s.paid;
  const paidLabel = paid ? 'Mark unpaid' : 'Mark paid';
  const paidClass = paid ? 'bad' : 'ok';

  let methodsHtml = METHODS.map(mth => {
    const checked = (mth[0] === (s.payMethod || 'eft')) ? ' checked' : '';
    return '<label class="method-row"><input type="radio" name="payMethod" value="' +
      mth[0] + '"' + checked + '><span>' + methodName(mth[0], s.lang || db.lang) + '</span></label>';
  }).join('');

  let exploreHtml = '';
  if ((s.payMethod === 'btc' || s.payMethod === 'usdt') && s.link) {
    const url = explorer(s.payMethod, s.link);
    if (url) {
      exploreHtml = '<a href="' + url + '" target="_blank" rel="noopener" class="btn gold full" style="margin-top:8px">View on explorer</a>';
    }
  }

  return '<div class="sale-detail">' +
    '<div class="detail-row"><span class="label">Customer</span><span class="value">' +
    escapeHtml(s.name) + '</span></div>' +
    '<div class="detail-row"><span class="label">Item</span><span class="value">' +
    escapeHtml(s.item) + '</span></div>' +
    '<div class="detail-row"><span class="label">Amount</span><span class="value">R' +
    money(Number(s.amount) || 0) + '</span></div>' +
    '<div class="detail-row"><span class="label">Due</span><span class="value">' +
    fmtDate(s.due) + (overdue ? ' — ' + Math.abs(daysFrom(s.due)) + ' days overdue' : '') +
    '</span></div>' +
    '<div class="detail-row"><span class="label">Status</span><span class="value">' +
    (paid ? 'Paid' : 'Unpaid') + '</span></div>' +
    '<div class="detail-row"><span class="label">Message language</span><span class="value">' +
    langName(s.lang || db.lang) + '</span></div>' +
    '<div class="detail-row"><span class="label">Payment method</span>' +
    '<div class="method-group">' + methodsHtml + '</div></div>' +
    '<div class="detail-row"><span class="label">Bank / details</span>' +
    '<input type="text" id="dBank" value="' + escapeHtml(s.bank || '') + '" placeholder="Bank / wallet"></div>' +
    '<div class="detail-row"><span class="label">Payment link / tx</span>' +
    '<input type="text" id="dLink" value="' + escapeHtml(s.link || '') + '" placeholder="PayShap link / BTC tx"></div>' +
    exploreHtml +
    '<div class="detail-actions">' +
    '<button class="btn ' + paidClass + '" id="btnPaid">' + paidLabel + '</button>' +
    '<button class="btn" id="btnWhatsApp">WhatsApp</button>' +
    '<button class="btn" id="btnSpeak">🔊 Speak</button>' +
    '<button class="btn bad" id="btnDelete">Delete</button>' +
    '</div>' +
    '<div class="msg" id="msgBox" hidden>' +
    '<summary id="msgTitle"></summary>' +
    '<div class="preview" id="msgPreview"></div>' +
    '</div>' +
    '</div>';
}

function renderSaleDetail() {
  const s = db.sales[ui.saleIndex];
  if (!s) { go('home'); return; }
  $('saleView').innerHTML = saleCard(s);

  $('#btnPaid').onclick = () => togglePaid(ui.saleIndex);
  $('#btnWhatsApp').onclick = () => sendWhatsApp(ui.saleIndex);
  $('#btnSpeak').onclick = () => speakSale();
  $('#btnDelete').onclick = () => deleteSale(ui.saleIndex);

  document.querySelectorAll('input[name="payMethod"]').forEach(r => {
    r.onchange = () => { s.payMethod = r.value; save(); };
  });

  $('#dBank').onchange = () => { s.bank = $('#dBank').value; save(); };
  $('#dLink').onchange = () => { s.link = $('#dLink').value; save(); };

  // Voice status chip
  $('voiceStatus').textContent = '';
}

/* ===== Actions ===== */
function newSale() {
  const name = $('fName').value.trim();
  const amount = $('fAmount').value.trim();
  const item = $('fItem').value.trim();
  const due = $('fDue').value || addDays(0);
  const paid = $('fPaid').checked;
  const lang = $('fLang').value;
  const bank = $('fBank').value.trim();
  const link = $('fLink').value.trim();

  if (!name || !amount) {
    $('voiceStatus').textContent = 'Please enter name and amount.';
    return;
  }

  const sale = {
    id: 's' + Date.now(),
    no: db.next++,
    name,
    item,
    amount: Number(amount),
    due,
    paid,
    lang,
    bank,
    link,
    payMethod: 'eft',
    created: addDays(0),
    invoiceSent: false,
    example: false
  };

  db.sales.push(sale);
  save();
  renderSell();
  go('home');
  toast('Sale saved');
  playClip('en-sale-saved', { fallbackText: 'Sale saved', lang: 'en' });
}

function openSale(idx) {
  ui.saleIndex = idx;
  ui.curSale = db.sales[idx];
  go('sale');
}

function togglePaid(idx) {
  const s = db.sales[idx];
  s.paid = !s.paid;
  save();
  openSale(idx);
  render();
}

function deleteSale(idx) {
  if (!confirm('Delete this sale?')) return;
  db.sales.splice(idx, 1);
  save();
  go('home');
  render();
}

function speakSale() {
  const s = db.sales[ui.saleIndex];
  if (!s) return;
  speak(s.name + ', ' + money(s.amount) + ' rand, due ' + fmtDate(s.due), {
    lang: s.lang === 'en' ? 'en-US' : (s.lang || db.lang)
  });
}

function sendWhatsApp(idx) {
  const s = db.sales[idx];
  let body = '';

  if (!s.paid) {
    const overdue = daysFrom(s.due) < 0;
    const key = overdue ? 'late' : (daysFrom(s.due) <= 1 ? 'soon' : 'invoice');
    const days = overdue ? Math.abs(daysFrom(s.due)) : 0;
    body = t(s.lang || db.lang, key, {
      name: s.name,
      no: s.no,
      biz: db.biz,
      item: s.item,
      amount: money(Number(s.amount) || 0),
      date: fmtDate(s.due),
      days: days
    });
  } else {
    body = t(s.lang || db.lang, 'receipt', {
      name: s.name,
      no: s.no,
      biz: db.biz,
      item: s.item,
      amount: money(Number(s.amount) || 0),
      date: fmtDate(s.due || '')
    });
  }

  const phone = s.phone || '';
  const num = phone.replace(/\D/g, '');
  const waNum = num.charAt(0) === '0' ? '27' + num.slice(1) : num;
  const url = 'https://wa.me/' + waNum + '?text=' + encodeURIComponent(body);
  window.location.href = url;
  s.invoiceSent = true;
  save();
}

/* ===== Read my money (TTS) ===== */
function readMyMoney() {
  let received = 0, unpaid = 0, lateCount = 0;
  db.sales.forEach(s => {
    const amt = Number(s.amount) || 0;
    if (s.paid) received += amt;
    else {
      unpaid += amt;
      if (daysFrom(s.due) < 0) lateCount++;
    }
  });
  speak('You have received R' + money(received) + ' this month. You are owed R' + money(unpaid) + '. ' + lateCount + ' payments are late.');
}

/* ===== Onboarding ===== */
function startOnboarding() {
  $('ob').hidden = false;
  showObStep('obWelcome');
}

function showObStep(id) {
  document.querySelectorAll('.ob-step').forEach(s => s.classList.remove('visible'));
  $(id).classList.add('visible');
}

function finishOnboarding() {
  const biz = $('obBiz').value.trim();
  const lang = $('obLang').value;
  const ui = $('obUi').value;

  db.biz = biz;
  db.lang = lang;
  db.ui = ui;
  db.sales = sample().sales;
  save();
  setLang();
  $('ob').hidden = true;
  go('home');
}

/* ===== Settings ===== */
function saveSettings() {
  db.biz = $('sBiz').value.trim();
  db.bank = $('sBank').value.trim();
  db.link = $('sLink').value.trim();
  db.lang = $('sLang').value;
  db.ui = $('sUi').value;
  save();
  setLang();
  go('home');
  toast('Settings saved');
}

/* ===== Toast ===== */
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.hidden = false;
  setTimeout(() => { el.hidden = true; }, 2000);
}

/* ===== Init ===== */
document.addEventListener('DOMContentLoaded', () => {
  load();

  if (!db.biz && db.sales.length === 0) {
    startOnboarding();
  } else {
    setLang();
    go('home');
  }

  // Nav tabs
  document.querySelectorAll('.tabbar .tab').forEach(tab => {
    tab.onclick = (e) => {
      const target = e.currentTarget.dataset.target;
      if (target) go(target);
    };
  });

  // Home tiles
  document.querySelectorAll('.panel#p-home .tile[data-target]').forEach(tile => {
    tile.onclick = () => go(tile.dataset.target);
  });

  // Voice sell tile
  $('btnVoiceTile').onclick = () => {
    voiceRec.start({ lang: 'en-US' });
  };

  // Read my money tile
  $('btnReadMoney').onclick = readMyMoney;

  // Sell form
  $('btnSaveSale').onclick = newSale;
  $('btnVoiceSale').onclick = () => {
    voiceRec.start({ lang: 'en-US' });
  };

  // Settings
  $('btnSaveSettings').onclick = saveSettings;
  $('btnSettings').onclick = () => go('settings');

  // Onboarding
  $('btnStart').onclick = () => showObStep('obBiz');
  $('btnNextBiz').onclick = () => showObStep('obLangs');
  $('btnFinish').onclick = finishOnboarding;
});

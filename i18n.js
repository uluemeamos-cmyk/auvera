// Auvera™ — i18n module
// Extracted from index.html monolith during reengineering.

// Supported languages: [code, name]
export const LANGS = [
  ['en', 'English'],
  ['pcm', 'Nigerian Pidgin'],
  ['ur', 'Urdu'],
  ['bn', 'Bengali'],
  ['so', 'Somali'],
  ['sw', 'Kiswahili'],
  ['am', 'Amharic']
];

// Message templates per language.
// Keys: invoice, soon, late, receipt
export const I = {
  en: {
    invoice: 'Hello {name}, invoice #{no} from {biz}: {item}, R{amount}. Please pay by {date}. Thanks!',
    soon: 'Hello {name}, reminder from {biz}: R{amount} for {item} (invoice #{no}) is due {date}. Thanks!',
    late: '{name}, payment of R{amount} for {item} (invoice #{no}) from {biz} is {days} days overdue. Please pay today. Thanks.',
    receipt: 'Thanks {name}! Receipt #{no} from {biz}: R{amount} for {item} received {date}. ✓ Verified by Auvera.'
  },
  pcm: {
    invoice: '{name}, you get invoice #{no} from {biz}: {item}, R{amount}. Pls pay before {date}. Thank you.',
    soon: '{name}, reminder from {biz}: you suppose pay R{amount} for {item} (invoice #{no}) before {date}. Thank you.',
    late: '{name}, money wey you suppose pay for {item} (invoice #{no}) from {biz} don pass {days} days. Pls pay today. Thank you.',
    receipt: 'Thank you {name}! Receipt #{no} from {biz}: R{amount} for {item} wey we collect {date}. ✓ Auvera verify am.'
  },
  ur: {
    invoice: 'سلام {name}، انوائس #{no} {biz} سے: {item}، R{amount}۔ براہِ کرم {date} سے قبل ادائیگی کریں۔ شکریہ۔',
    soon: 'سلام {name}، {biz} کی یاد دہانی: R{amount} {item} کے لیے (انوائس #{no}) {date} تک واجب ادا ہے۔ شکریہ۔',
    late: '{name}، {biz} سے {item} (انوائس #{no}) کا R{amount} {days} دن سےダー ہے۔ براہِ کرم آج ادائیگی کریں۔ شکریہ۔',
    receipt: 'شکریہ {name}! رسید #{no} {biz} سے: R{amount} {item} کے لیے {date} کو موصول ہوا۔ ✓ Auvera سے تصدیق شدہ۔'
  },
  bn: {
    invoice: 'নমস্কার {name}, {biz} থেকে ইনভয়েস #{no}: {item}, R{amount}। দয়া করে {date} এর মধ্যে পেমেন্ট করুন। ধন্যবাদ।',
    soon: 'নমস্কার {name}, {biz} থেকে রিমাইন্ডার: R{amount} {item}-এর জন্য (ইনভয়েস #{no}) {date} এর মধ্যে দরকার। ধন্যবাদ।',
    late: '{name}, {biz} থেকে {item}-এর (ইনভয়েস #{no}) R{amount} পেমেন্ট {days} দিন দেরি হয়েছে। অনুগ্রহ করে আজই পেমেন্ট করুন। ধন্যবাদ।',
    receipt: 'ধন্যবাদ {name}! রসিদ #{no} {biz} থেকে: R{amount} {item}-এর জন্য {date} তারিখে প্রাপ্ত হয়েছে। ✓ Auvera দিয়ে নিশ্চিত।'
  },
  so: {
    invoice: 'Asc {name}, qaansheegad #{no} ka timid {biz}: {item}, R{amount}. Fadlan bixi ka hor {date}. Mahadsanid!',
    soon: 'Asc {name}, xasuusin ka timid {biz}: R{amount} oo ah {item} (qaansheegad #{no}) waa in la bixiyaa {date}. Mahadsanid!',
    late: '{name}, lacagta R{amount} ee {item} (qaansheegad #{no}) ee {biz} waxay dib u dhacday {days} maalmood. Fadlan maanta bixi. Mahadsanid.',
    receipt: 'Mahadsanid {name}! Rasiidh #{no} ee {biz}: R{amount} oo ah {item} waa la helay {date}. ✓ Auvera ayaa xaqiijisay.'
  },
  sw: {
    invoice: 'Habari {name}, ankara #{no} kutoka {biz}: {item}, R{amount}. Tafadhali lipa kabla ya {date}. Asante!',
    soon: 'Habari {name}, ukumbusho kutoka {biz}: R{amount} kwa {item} (ankara #{no}) inatakiwa kulipwa {date}. Asante!',
    late: '{name}, malipo ya R{amount} kwa {item} (ankara #{no}) kutoka {biz} yamechelewa siku {days}. Tafadhali lipa leo. Asante.',
    receipt: 'Asante {name}! Risiti #{no} kutoka {biz}: R{amount} kwa {item} imepokelewa {date}. ✓ Imethibitishwa na Auvera.'
  },
  am: {
    invoice: 'ሰላም {name}፣ ከ{biz} የክፍያ ጥያቄ #{no}፦ {item}፣ R{amount}። እባክዎ እስከ {date} ይክፈሉ። እናመሰግናለን!',
    soon: 'ሰላም {name}፣ ከ{biz} ማስታወሻ፦ ለ{item} R{amount} (#{no}) እስከ {date} መከፈል አለበት። እናመሰግናለን!',
    late: '{name}፣ ለ{biz} የ{item} R{amount} (#{no}) ክፍያ በ{days} ቀን ዘግይቷል። እባክዎ ዛሬ ይክፈሉ። እናመሰግናለን።',
    receipt: 'እናመሰግናለን {name}! ከ{biz} ደረሰኝ #{no}፦ ለ{item} R{amount} በ{date} ተቀብለናል። ✓ በAuvera ተረጋግጧል።'
  }
};

// Payment methods: [id, nameKey, checkKey, howCheckedKey]
export const METHODS = [
  ['eft',   'm_eft',   'c_bank',   'h_bank'],
  ['payshap','m_payshap','c_bank',   'h_bank'],
  ['card',  'm_card',  'c_card',   'h_card'],
  ['cash',  'm_cash',  'c_cash',   'h_cash'],
  ['btc',   'm_btc',   'c_crypto', 'h_crypto'],
  ['usdt',  'm_usdt',  'c_crypto', 'h_crypto']
];

// Helper: template replacement
export function t(lang, key, vars) {
  let s = ((I[lang] && I[lang][key]) || (I.en && I.en[key]) || '');
  if (vars) {
    Object.keys(vars).forEach(k => {
      s = s.replace(new RegExp('{' + k + '}', 'g'), vars[k]);
    });
  }
  return s;
}

// Helper: method lookup by id
export function method(id) {
  return METHODS.filter(m => m[0] === id)[0] || METHODS[0];
}

// Helper: language name by id
export function langName(id) {
  return (LANGS.filter(l => l[0] === id)[0] || LANGS[0])[1];
}

// Helper: blockchain explorer URL
export function explorer(m, tx) {
  tx = (tx || '').trim();
  if (!tx) return '';
  if (m === 'btc') return 'https://mempool.space/tx/' + encodeURIComponent(tx);
  if (m === 'usdt') return 'https://tronscan.org/#/transaction/' + encodeURIComponent(tx);
  return '';
}
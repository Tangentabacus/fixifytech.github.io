const html = document.documentElement;
const themeButton = document.getElementById('theme-toggle');
function syncThemeButton() { if (themeButton) themeButton.setAttribute('aria-label', html.dataset.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'); }
syncThemeButton();
themeButton?.addEventListener('click', () => { html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('theme', html.dataset.theme); } catch (_) {} syncThemeButton(); });
document.querySelectorAll('[data-year]').forEach(e => e.textContent = new Date().getFullYear());
const menuButton = document.getElementById('nav-toggle');
const menu = document.getElementById('nav-links');
function closeMenu() { menu?.classList.remove('open'); menuButton?.setAttribute('aria-expanded','false'); menuButton?.setAttribute('aria-label','Open navigation'); }
menuButton?.addEventListener('click', () => { const open = menu.classList.toggle('open'); menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label',open ? 'Close navigation' : 'Open navigation'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu?.classList.contains('open')) { closeMenu(); menuButton.focus(); } });
document.addEventListener('click', e => { if (!e.target.closest('#main-nav')) closeMenu(); });
function route(scroll = true) {
  const home = document.getElementById('home-page'), resources = document.getElementById('resources');
  if (!home || !resources) return;
  const id = location.hash.slice(1) || 'home';
  home.hidden = id === 'resources'; resources.hidden = id !== 'resources';
  document.title = id === 'resources' ? 'Resources & Tools | Fixify Tech' : 'Fixify Tech | IT Solutions & Support in Anchorage, Alaska';
  document.querySelectorAll('.nav-links a').forEach(a => { if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
  closeMenu();
  const target = document.getElementById(id) || document.getElementById('home');
  if (scroll) { target.scrollIntoView({behavior:'instant',block:'start'}); target.setAttribute('tabindex','-1'); target.focus({preventScroll:true}); }
}
if (document.getElementById('home-page')) {
  window.addEventListener('hashchange', () => route());
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', () => { if (a.hash === location.hash) route(); closeMenu(); }));
  route(Boolean(location.hash));
}

// --- Utility: Copy text to clipboard ---
function copyToClipboard(text, btn) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = orig; }, 1200);
      }
    }).catch(() => {
      document.getElementById('pw-feedback').textContent = 'Select and copy the result manually.';
    });
  } else {
    document.getElementById('pw-feedback').textContent = 'Select and copy the result manually.';
  }
}

// --- Password/Key/Passphrase Generation ---
const PW_CHARSETS = {
  password: {
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  },
  hex: '0123456789abcdef',
  base64: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
  pin: '0123456789'
};

const WORD_LIST = [
  'apple','orange','banana','mango','chair','table','river','mountain','keyboard','window',
  'car','city','cloud','forest','ocean','coffee','pizza','guitar','laptop','phone',
  'star','space','rocket','zebra','panda','quartz','galaxy','ninja','sushi','robot',
  'sun','moon','light','dark','tree','leaf','stone','earth','fire','water',
  'wolf','fox','bear','lion','tiger','eagle','hawk','owl','fish','whale',
  'rose','daisy','lily','orchid','peach','plum','grape','berry','melon','kiwi',
  'cloud','rain','storm','wind','snow','ice','fog','mist','wave','surf',
  'book','pen','note','paper','brush','paint','art','music','song','dance',
  'code','byte','data','logic','math','prime','array','loop','stack','queue',
  'star','nova','comet','asteroid','planet','orbit','space','galaxy','cosmos','universe'
];

function getRandomChar(str) {
  const idx = crypto.getRandomValues(new Uint32Array(1))[0] % str.length;
  return str[idx];
}

function shuffle(str) {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

function generatePassword(opts) {
  let charset = '';
  let required = [];
  if (opts.type === 'password' || opts.type === 'wifi') {
    charset += PW_CHARSETS.password.lower;
    if (opts.uppercase) { charset += PW_CHARSETS.password.upper; required.push(PW_CHARSETS.password.upper); }
    if (opts.numbers) { charset += PW_CHARSETS.password.numbers; required.push(PW_CHARSETS.password.numbers); }
    if (opts.symbols) { charset += PW_CHARSETS.password.symbols; required.push(PW_CHARSETS.password.symbols); }
    if (opts.excludeSimilar) charset = charset.replace(/[Il1O0]/g, '');
    if (opts.excludeAmbig) charset = charset.replace(/[{}\[\]()/\\'"`~,;:.<>]/g, '');
    if (!opts.uppercase && !opts.numbers && !opts.symbols) required.push(PW_CHARSETS.password.lower);
  } else if (opts.type === 'hex') {
    charset = PW_CHARSETS.hex;
  } else if (opts.type === 'base64') {
    charset = PW_CHARSETS.base64;
  } else if (opts.type === 'pin') {
    charset = PW_CHARSETS.pin;
  }
  if (!charset) return '';
  let out = '';
  // Ensure at least one of each required type if requested
  if (opts.requireAll && required.length > 0) {
    required.unshift(PW_CHARSETS.password.lower);
    for (let set of required) {
      const allowed = [...set].filter(c => charset.includes(c)).join('');
      if (allowed) out += getRandomChar(allowed);
    }
  }
  while (out.length < opts.length) out += getRandomChar(charset);
  return shuffle(out).slice(0, opts.length);
}

function generatePassphrase(opts) {
  const count = opts.length;
  const array = new Uint32Array(count);
  crypto.getRandomValues(array);
  let words = [];
  for (let i = 0; i < count; i++) {
    let word = WORD_LIST[array[i] % WORD_LIST.length];
    if (opts.capitalize) word = word.charAt(0).toUpperCase() + word.slice(1);
    words.push(word);
  }
  let sep = opts.separator || '-';
  let phrase = words.join(sep);
  if (opts.addNumber) phrase += sep + crypto.getRandomValues(new Uint32Array(1))[0] % 100;
  if (opts.addSymbol) phrase += sep + '!@#$%^&*()'.charAt(crypto.getRandomValues(new Uint32Array(1))[0] % 10);
  return phrase;
}


function updatePwgenUI() {
  const type = document.getElementById('pwgen-type').value;
  const optionsPanel = document.getElementById('generator-options');
  if (optionsPanel) optionsPanel.hidden = type !== 'password' && type !== 'wifi';
  const lengthLabel = document.getElementById('length-label');
  if (lengthLabel) lengthLabel.textContent = type === 'passphrase' ? 'Words:' : 'Length:';
  const lenInput = document.getElementById('pw-length');
  const upper = document.getElementById('pw-uppercase');
  const nums = document.getElementById('pw-numbers');
  const syms = document.getElementById('pw-symbols');
  const exclSim = document.getElementById('pw-exclude-similar');
  const exclAmbig = document.getElementById('pw-exclude-ambig');
  const reqAll = document.getElementById('pw-require-all');
  // Show/hide options based on type
  if (type === 'password' || type === 'wifi') {
    upper.parentElement.style.display = '';
    nums.parentElement.style.display = '';
    syms.parentElement.style.display = '';
    exclSim.parentElement.style.display = '';
    exclAmbig.parentElement.style.display = '';
    reqAll.parentElement.style.display = '';
    lenInput.min = 8;
    lenInput.max = 64;
    if (lenInput.value < 8) lenInput.value = 16;
  } else if (type === 'pin') {
    upper.parentElement.style.display = 'none';
    nums.parentElement.style.display = 'none';
    syms.parentElement.style.display = 'none';
    exclSim.parentElement.style.display = 'none';
    exclAmbig.parentElement.style.display = 'none';
    reqAll.parentElement.style.display = 'none';
    lenInput.min = 4;
    lenInput.max = 12;
    if (lenInput.value < 4) lenInput.value = 4;
  } else if (type === 'hex' || type === 'base64') {
    upper.parentElement.style.display = 'none';
    nums.parentElement.style.display = 'none';
    syms.parentElement.style.display = 'none';
    exclSim.parentElement.style.display = 'none';
    exclAmbig.parentElement.style.display = 'none';
    reqAll.parentElement.style.display = 'none';
    lenInput.min = 8;
    lenInput.max = 64;
    if (lenInput.value < 8) lenInput.value = 16;
  } else if (type === 'passphrase') {
    upper.parentElement.style.display = 'none';
    nums.parentElement.style.display = 'none';
    syms.parentElement.style.display = 'none';
    exclSim.parentElement.style.display = 'none';
    exclAmbig.parentElement.style.display = 'none';
    reqAll.parentElement.style.display = 'none';
    lenInput.min = 3;
    lenInput.max = 10;
    if (lenInput.value < 3 || lenInput.value > 10) lenInput.value = 6;
  }
}

function handlePwgen() {
  const type = document.getElementById('pwgen-type').value;
  const lengthInput = document.getElementById('pw-length');
  const len = Math.max(Number(lengthInput.min), Math.min(Number(lengthInput.max), parseInt(lengthInput.value, 10) || Number(lengthInput.min)));
  lengthInput.value = len;
  const opts = {
    type,
    length: len,
    uppercase: document.getElementById('pw-uppercase').checked,
    numbers: document.getElementById('pw-numbers').checked,
    symbols: document.getElementById('pw-symbols').checked,
    excludeSimilar: document.getElementById('pw-exclude-similar').checked,
    excludeAmbig: document.getElementById('pw-exclude-ambig').checked,
    requireAll: document.getElementById('pw-require-all').checked,
    capitalize: true,
    separator: '-',
    addNumber: false,
    addSymbol: false
  };
  let pw = '';
  if (type === 'passphrase') {
    pw = generatePassphrase(opts);
  } else {
    pw = generatePassword(opts);
  }
  document.getElementById('pw-output').value = pw;
  updatePwStrength(pw);
}

function updatePwStrength(pw) {
  document.getElementById('pw-feedback').textContent = pw ? 'New result ready' : '';
  const isPhrase = document.getElementById('pwgen-type').value === 'passphrase';
  document.getElementById('pw-strength').textContent = isPhrase
    ? 'This tool uses a small word list. For important accounts, choose a random password or a password manager’s passphrase generator.'
    : 'Generated in your browser. Use a unique password for every account.';
}

function setupPasswordGenerator() {
  // Attach event listeners
  document.getElementById('gen-btn').addEventListener('click', handlePwgen);
  document.getElementById('pwgen-type').addEventListener('change', () => { updatePwgenUI(); handlePwgen(); });
  document.getElementById('pwgen-form').addEventListener('submit', e => { e.preventDefault(); handlePwgen(); });
  document.getElementById('pw-length').addEventListener('change', handlePwgen);
  [
    'pw-uppercase','pw-numbers','pw-symbols','pw-exclude-similar','pw-exclude-ambig','pw-require-all'
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', handlePwgen);
  });
  document.getElementById('copy-btn').addEventListener('click', function() {
    const val = document.getElementById('pw-output').value;
    copyToClipboard(val, this);
  });
  // Initial UI state
  updatePwgenUI();
  handlePwgen();
}

if (document.getElementById('pwgen-form')) setupPasswordGenerator();


// ===============================

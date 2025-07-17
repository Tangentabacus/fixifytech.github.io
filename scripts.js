// ===============================
// SPA Navigation, Nav Highlighting, and Hamburger Theme Logic
// ===============================

// --- SPA-aware Nav Highlighting ---
// Highlights the correct nav link based on SPA state or hash
function setActiveNavLink(hash) {
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => link.classList.remove('active'));
  // Always highlight Resources if resources section is visible (SPA page)
  const resourcesSection = document.getElementById('resources');
  if (resourcesSection && window.getComputedStyle(resourcesSection).display !== 'none') {
    const resLink = document.querySelector('.nav-links a[href="#resources"]');
    if (resLink) resLink.classList.add('active');
    return;
  }
  // Otherwise, highlight based on hash
  if (hash) {
    const link = document.querySelector('.nav-links a[href="' + hash + '"]');
    if (link) link.classList.add('active');
  }
}

// Handles navigation events (hashchange, initial load)
function handleNavigation(hash) {
  setActiveNavLink(hash);
}

// Listen for hash changes and update nav highlighting
window.addEventListener('hashchange', () => {
  handleNavigation(window.location.hash || '#home');
});

// On DOM load, set initial nav state and theme for hamburger/nav
document.addEventListener('DOMContentLoaded', () => {
  handleNavigation(window.location.hash || '#home');
  updateHamburgerAndNavTheme && updateHamburgerAndNavTheme();
});

// --- Hamburger and Nav Theme Update ---
// Updates hamburger menu and nav colors for current theme
function updateHamburgerAndNavTheme() {
  const navToggle = document.getElementById('nav-toggle');
  if (navToggle) {
    const hamburger = navToggle.querySelector('.hamburger');
    if (hamburger) {
      hamburger.style.background = getComputedStyle(document.body).getPropertyValue('--nav-text');
    }
  }
  const navLinks = document.getElementById('nav-links');
  if (navLinks) {
    navLinks.style.background = getComputedStyle(document.body).getPropertyValue('--nav-bg');
    navLinks.style.color = getComputedStyle(document.body).getPropertyValue('--nav-text');
  }
}
// Listen for custom themechange event
document.body.addEventListener('themechange', updateHamburgerAndNavTheme);
// --- SPA Section Show/Hide Logic ---
// SPA section show/hide logic for homepage/resources
function showSection(sectionId) {
  // Hide all SPA sections
  document.querySelectorAll('.spa-page').forEach(sec => sec.style.display = 'none');
  // Show the requested section
  const section = document.getElementById(sectionId);
  if (section) section.style.display = 'block';
  // Hide promo card if on resources page
  const promo = document.getElementById('resources-promo');
  if (promo) promo.style.display = (sectionId === 'resources') ? 'none' : 'block';
  // Show/hide main homepage sections
  const home = document.getElementById('home');
  const services = document.getElementById('services');
  const about = document.getElementById('about');
  if (sectionId === 'resources') {
    if (home) home.style.display = 'none';
    if (services) services.style.display = 'none';
    if (about) about.style.display = 'none';
  } else {
    if (home) home.style.display = 'block';
    if (services) services.style.display = 'block';
    if (about) about.style.display = 'block';
  }
}

// --- SPA Nav Link Click Handler ---
// Handles SPA nav link clicks for smooth transitions
function handleSpaNavClick(e) {
  const href = this.getAttribute('href');
  if (href === '#resources') {
    e.preventDefault();
    showSection('resources');
    window.scrollTo(0, 0);
    return;
  }
  if (href === '#home' || href === '#services' || href === '#about') {
    e.preventDefault();
    showSection('home'); // Always show all homepage sections
    // Scroll to the correct section
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
    return;
  }
  // Let default anchor behavior happen for other links
}

// --- Attach SPA Nav Handlers ---
// Attaches SPA nav click handlers to all anchor links
function attachSpaNavHandlers() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.removeEventListener('click', handleSpaNavClick); // Prevent duplicate handlers
    link.addEventListener('click', handleSpaNavClick);
  });
}

// Attach handlers on DOMContentLoaded and after any SPA navigation that might re-render links
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', attachSpaNavHandlers);
} else {
  attachSpaNavHandlers();
}

// --- Back to Home Button Logic for SPA ---
const backHomeBtn = document.getElementById('back-home-btn');
if (backHomeBtn) {
  backHomeBtn.addEventListener('click', function() {
    showSection('home');
    window.scrollTo(0, 0);
  });
}


// ===============================
// Modern Password Generator Logic (Rewritten)
// ===============================

// --- Utility: Copy text to clipboard ---
function copyToClipboard(text, btn) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = orig; }, 1200);
      }
    });
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
    for (let set of required) out += getRandomChar(set);
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
  if (opts.addNumber) phrase += sep + Math.floor(Math.random() * 100);
  if (opts.addSymbol) phrase += sep + '!@#$%^&*()'.charAt(Math.floor(Math.random() * 10));
  return phrase;
}

function getStrength(pw) {
  let score = 0;
  if (!pw) return 0;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 20) score++;
  return Math.min(score, 4);
}

function updatePwgenUI() {
  const type = document.getElementById('pwgen-type').value;
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
    if (lenInput.value < 3) lenInput.value = 4;
  }
}

function handlePwgen() {
  const type = document.getElementById('pwgen-type').value;
  const len = parseInt(document.getElementById('pw-length').value, 10);
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
  const bar = document.getElementById('pw-strength');
  if (!bar) return;
  const s = getStrength(pw);
  bar.value = s;
  bar.max = 4;
  bar.className = '';
  if (s === 1) bar.classList.add('weak');
  if (s === 2) bar.classList.add('fair');
  if (s === 3) bar.classList.add('good');
  if (s === 4) bar.classList.add('strong');
  const txt = document.getElementById('pw-feedback');
  if (txt) {
    txt.textContent = pw ? ['Weak','Fair','Good','Strong'][s-1] || '' : '';
  }
}

function setupPasswordGenerator() {
  // Attach event listeners
  document.getElementById('gen-btn').addEventListener('click', handlePwgen);
  document.getElementById('pwgen-type').addEventListener('change', updatePwgenUI);
  document.getElementById('pw-length').addEventListener('input', handlePwgen);
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

document.addEventListener('DOMContentLoaded', setupPasswordGenerator);


// ===============================
// Theme Toggle and Logo Logic
// ===============================

const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;
let isDark = true; // Default to dark mode

// --- Sets the logo image based on current theme ---
function setLogoForTheme(theme) {
  const logoImg = document.getElementById('logo-img');
  if (logoImg) {
    logoImg.src = theme === 'dark' ? 'media/logo-dark.png' : 'media/logo.png';
  }
}

// --- Sets the emoji for the theme toggle button ---
function setThemeToggleEmoji(theme) {
  if (themeToggle) {
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

// --- Theme toggle button click handler ---
themeToggle?.addEventListener('click', () => {
  isDark = !isDark;
  const theme = isDark ? 'dark' : 'light';
  html.setAttribute('data-theme', theme);
  setLogoForTheme(theme);
  setThemeToggleEmoji(theme);
  localStorage.setItem('theme', theme);
});

// --- Set initial theme and logo on page load ---
window.addEventListener('DOMContentLoaded', () => {
  let theme = 'dark';
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    theme = savedTheme;
    isDark = theme === 'dark';
  }
  html.setAttribute('data-theme', theme);
  setLogoForTheme(theme);
  setThemeToggleEmoji(theme);
});


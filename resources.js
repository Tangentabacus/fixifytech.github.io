// Advanced password generator
function generatePassword(length, opts = {}) {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  let chars = lower;
  if (opts.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (opts.numbers) chars += '0123456789';
  if (opts.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  if (!chars) chars = lower;
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);
  let pwd = '';
  for (let i = 0; i < length; i++) {
    pwd += chars[array[i] % chars.length];
  }
  return pwd;
}

const WORD_LIST = [
  'apple','orange','banana','mango','chair','table','river','mountain','keyboard','window',
  'car','city','cloud','forest','ocean','coffee','pizza','guitar','laptop','phone',
  'star','space','rocket','zebra','panda','quartz','galaxy','ninja','sushi','robot'
];

function generatePassphrase(count) {
  const array = new Uint32Array(count);
  window.crypto.getRandomValues(array);
  const words = [];
  for (let i = 0; i < count; i++) {
    words.push(WORD_LIST[array[i] % WORD_LIST.length]);
  }
  return words.join('-');
}

async function copyText(text, btn) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = original; }, 1500);
  } catch (err) {
    alert('Unable to copy');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const genBtn = document.getElementById('gen-btn');
  const copyBtn = document.getElementById('copy-btn');
  const lenInput = document.getElementById('pw-length');
  const output = document.getElementById('pw-output');
  const upperEl = document.getElementById('pw-uppercase');
  const numEl = document.getElementById('pw-numbers');
  const symEl = document.getElementById('pw-symbols');
  const wordsEl = document.getElementById('pw-words');
  const lenLabel = document.querySelector('.pw-length');

  if (!genBtn || !output || !lenInput) return;

  function updateLabel() {
    if (wordsEl && wordsEl.checked) {
      lenLabel.childNodes[0].nodeValue = 'Words:';
      lenInput.min = 2;
      lenInput.max = 10;
    } else {
      lenLabel.childNodes[0].nodeValue = 'Length:';
      lenInput.min = 8;
      lenInput.max = 64;
    }
  }

  updateLabel();
  wordsEl.addEventListener('change', updateLabel);

  genBtn.addEventListener('click', () => {
    let len = parseInt(lenInput.value, 10);
    if (wordsEl.checked) {
      if (isNaN(len) || len < 2) len = 2;
      if (len > 10) len = 10;
      output.value = generatePassphrase(len);
    } else {
      if (isNaN(len) || len < 8) len = 8;
      if (len > 64) len = 64;
      output.value = generatePassword(len, {
        uppercase: upperEl.checked,
        numbers: numEl.checked,
        symbols: symEl.checked
      });
    }
  });

  copyBtn.addEventListener('click', () => copyText(output.value, copyBtn));
});

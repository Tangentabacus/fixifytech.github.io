// Password generator script
function generatePassword(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);
  let pwd = '';
  for (let i = 0; i < length; i++) {
    pwd += chars[array[i] % chars.length];
  }
  return pwd;
}

document.addEventListener('DOMContentLoaded', () => {
  const genBtn = document.getElementById('gen-btn');
  const copyBtn = document.getElementById('copy-btn');
  const lenInput = document.getElementById('pw-length');
  const output = document.getElementById('pw-output');
  if (genBtn) {
    genBtn.addEventListener('click', () => {
      let len = parseInt(lenInput.value, 10);
      if (isNaN(len) || len < 8) len = 8;
      if (len > 64) len = 64;
      output.value = generatePassword(len);
    });
  }
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(output.value);
        const original = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = original; }, 1500);
      } catch (err) {
        alert('Unable to copy');
      }
    });
  }
});


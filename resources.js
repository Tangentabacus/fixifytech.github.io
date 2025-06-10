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
  if (!genBtn) return;
  genBtn.addEventListener('click', () => {
    const lenInput = document.getElementById('pw-length');
    const output = document.getElementById('pw-output');
    let len = parseInt(lenInput.value, 10);
    if (isNaN(len) || len < 8) len = 8;
    if (len > 64) len = 64;
    output.value = generatePassword(len);
  });
});

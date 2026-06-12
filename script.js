//  mock user
if (!localStorage.getItem('users')) {
  localStorage.setItem('users', JSON.stringify([
    { email: 'student@test.com', password: '123456', role: 'student', username: 'student' }
  ]));
}

function getUsers() { return JSON.parse(localStorage.getItem('users') || '[]'); }
function show(id, text, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = `msg ${type}`;
}
function hide(id) {
  const el = document.getElementById(id);
  if (el) el.className = 'msg hidden';
}
function togglePw(id, btn) {
  const el = document.getElementById(id);
  el.type = el.type === 'password' ? 'text' : 'password';
  btn.textContent = el.type === 'password' ? '👁' : '🙈';
}

// LOGIN

let failCount = 0;
function handleLogin() {
  const id  = document.getElementById('login-id')?.value.trim();
  const pw  = document.getElementById('login-pw')?.value;
  const btn = document.getElementById('login-btn');
  hide('login-error');
  if (!id || !pw) { show('login-error', 'Please fill in all fields.', 'error'); return; }
  const user = getUsers().find(u => (u.email === id || u.username === id) && u.password === pw);
  if (user) {
    localStorage.setItem('loggedInUser', JSON.stringify({ email: user.email, role: user.role }));
    const dest = { student: 'dashboard_student.html', teacher: 'dashboard_teacher.html', admin: 'dashboard_admin.html' };
    window.location.href = dest[user.role] || 'dashboard_student.html';
  } else {
    failCount++;
    show('login-error', 'Invalid email or password.', 'error');
    if (failCount >= 3) {
      btn.disabled = true;
      let s = 30;
      show('countdown', `Too many attempts. Try again in ${s}s.`, 'info');
      const t = setInterval(() => {
        s--;
        show('countdown', `Too many attempts. Try again in ${s}s.`, 'info');
        if (s <= 0) { clearInterval(t); btn.disabled = false; failCount = 0; hide('countdown'); }
      }, 1000);
    }
  }
}

// REGISTER

function validateReg() {
  const name    = document.getElementById('reg-name')?.value.trim()    ?? '';
  const email   = document.getElementById('reg-email')?.value.trim()   ?? '';
  const uname   = document.getElementById('reg-username')?.value.trim() ?? '';
  const pw      = document.getElementById('reg-pw')?.value             ?? '';
  const confirm = document.getElementById('reg-confirm')?.value        ?? '';
  const bar     = document.getElementById('pw-strength');
  const btn     = document.getElementById('reg-btn');
  if (bar) {
    if (!pw)           bar.className = 'strength-bar';
    else if (pw.length < 6) bar.className = 'strength-bar weak';
    else if (pw.length < 9) bar.className = 'strength-bar medium';
    else if (/[A-Z]/.test(pw) && /[0-9!@#$%]/.test(pw)) bar.className = 'strength-bar strong';
    else bar.className = 'strength-bar medium';
  }
  if (btn) btn.disabled = !(name.length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    && /^[a-zA-Z0-9_]{3,}$/.test(uname) && pw && pw === confirm);
}
function handleRegister() {
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const uname = document.getElementById('reg-username').value.trim();
  const pw    = document.getElementById('reg-pw').value;
  const role  = document.getElementById('reg-role').value;
  if (!role) { show('reg-success', 'Please select a role.', 'error'); return; }
  const users = getUsers();
  if (users.find(u => u.email === email)) { show('reg-success', 'Email already registered.', 'error'); return; }
  users.push({ name, email, username: uname, password: pw, role: role.toLowerCase() });
  localStorage.setItem('users', JSON.stringify(users));
  show('reg-success', 'Account created! Please login.', 'success');
  setTimeout(() => window.location.href = 'login.html', 2000);
}

// FORGOT PASSWORD

function handleForgot() {
  const email = document.getElementById('forgot-email')?.value.trim();
  if (!email) { show('forgot-msg', 'Please enter your email.', 'error'); return; }
  if (getUsers().find(u => u.email === email)) {
    console.log('http://localhost/reset?token=demo');
    show('forgot-msg', 'Reset link sent to console (demo).', 'success');
  } else {
    show('forgot-msg', 'Email not found.', 'error');
  }
}
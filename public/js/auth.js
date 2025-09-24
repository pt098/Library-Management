async function handleLogin(data) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Login failed');
  const payload = await res.json();
  localStorage.setItem('token', payload.token);
  window.location.href = '/app';
}

async function handleSignup(data) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Signup failed');
  // Redirect to login after signup
  window.location.href = '/login';
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.__PAGE__ === 'login') {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      try { await handleLogin(data); } catch (err) { alert(err.message); }
    });
  }
  if (window.__PAGE__ === 'signup') {
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      try { await handleSignup(data); } catch (err) { alert(err.message); }
    });
  }
});



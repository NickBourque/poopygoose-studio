// Where the sign-up form posts. Leave empty to fall back to a pre-filled email to the studio.
// Works with most hosted list providers (Buttondown, ConvertKit, Formspree…) that accept a POST with an `email` field.
const SIGNUP_ENDPOINT = '';
const STUDIO_EMAIL = 'hello@poopygoose.studio';

// The goose and his paper world live in paper-diorama.js (honks and plops happen in the scene).

/* ---------- sign-up ---------- */
const form = document.getElementById('signup');
const msg = document.getElementById('form-msg');
form.addEventListener('submit', async e => {
  e.preventDefault();
  const email = form.email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    msg.textContent = 'That email looks a bit scrambled. Try again?';
    form.email.focus();
    return;
  }
  if (!SIGNUP_ENDPOINT) {
    const body = `Hi Poopy Goose Studio,\n\nPlease add ${email} to the flock for dev updates.\n\nHonk!`;
    window.location.href = `mailto:${STUDIO_EMAIL}?subject=${encodeURIComponent('Add me to the flock')}&body=${encodeURIComponent(body)}`;
    msg.textContent = 'Your email app should open with a note to us. Hit send and you’re in!';
    return;
  }
  msg.textContent = 'Honking…';
  try {
    const res = await fetch(SIGNUP_ENDPOINT, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
    if (!res.ok) throw new Error(res.status);
    form.reset();
    msg.textContent = 'You’re in the flock! Watch your inbox for honks.';
  } catch {
    msg.textContent = `Something went sideways. Email us at ${STUDIO_EMAIL} instead?`;
  }
});

/* ---------- small things ---------- */
document.getElementById('year').textContent = new Date().getFullYear();
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

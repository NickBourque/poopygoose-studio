// Sign-ups go to a Kit form. The ID is the number in the form's embed code
// (app.kit.com/forms/<ID>/subscriptions). Leave it empty to fall back to a pre-filled email to the studio.
const KIT_FORM_ID = '10103804';
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
  if (!KIT_FORM_ID) {
    const body = `Hi Poopy Goose Studio,\n\nPlease add ${email} to the flock for dev updates.\n\nHonk!`;
    window.location.href = `mailto:${STUDIO_EMAIL}?subject=${encodeURIComponent('Add me to the flock')}&body=${encodeURIComponent(body)}`;
    msg.textContent = 'Your email app should open with a note to us. Hit send and you’re in!';
    return;
  }
  msg.textContent = 'Honking…';
  const button = form.querySelector('button');
  button.disabled = true;
  try {
    const body = new FormData();
    body.append('email_address', email);
    const res = await fetch(`https://app.kit.com/forms/${KIT_FORM_ID}/subscriptions`, {
      method: 'POST', headers: { Accept: 'application/json' }, body,
    });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    if (data.status === 'success') {
      form.reset();
      msg.textContent = 'You’re in the flock! Check your inbox to confirm.';
    } else if (data.status === 'quarantined' && data.url) {
      // Kit wants a quick are-you-human check before it adds this address.
      const link = Object.assign(document.createElement('a'), { href: data.url, target: '_blank', rel: 'noopener', textContent: 'one quick check' });
      msg.replaceChildren('Almost there! Kit needs ', link, ' to make sure you’re not a robot goose.');
    } else {
      throw new Error(data.errors?.messages?.join(' ') || 'not subscribed');
    }
  } catch {
    msg.textContent = `Something went sideways. Email us at ${STUDIO_EMAIL} instead?`;
  } finally {
    button.disabled = false;
  }
});

/* ---------- small things ---------- */
document.getElementById('year').textContent = new Date().getFullYear();
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

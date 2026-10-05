// Contact-form Worker for virginiacityfarmacy.com.
//
// It answers POST /api/contact (the route virginiacityfarmacy.com/api/* and
// www.virginiacityfarmacy.com/api/* in wrangler.jsonc). The site itself stays on
// Cloudflare Pages; only this one path comes here.
//
// Flow: check the request came from our own pages -> validate the fields ->
// verify the Turnstile token -> email the owner through Email Routing's
// send_email binding -> redirect the visitor to the thank-you page. The forms are
// plain HTML posts (no JavaScript needed), so results are redirects; on a
// problem the visitor is sent back to the form with ?error=<code>.
import { EmailMessage } from 'cloudflare:email';

const FORMS = {
  contact: { label: 'Contact form', page: '/contact' },
  wholesale: { label: 'Wholesale form', page: '/wholesale' },
};
const EMAIL_PATTERN = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/contact' || url.pathname === '/api/contact/') {
      if (request.method !== 'POST') {
        return new Response('Method not allowed.', { status: 405, headers: { allow: 'POST' } });
      }
      return handleContact(request, env, url);
    }
    return new Response('Not found.', { status: 404 });
  },
};

const redirect = (url, path) =>
  new Response(null, { status: 303, headers: { location: new URL(path, url).toString(), 'cache-control': 'no-store' } });

async function handleContact(request, env, url) {
  // Only accept posts that come from this site's own pages.
  const origin = request.headers.get('origin');
  if (origin) {
    let sameSite = false;
    try {
      sameSite = new URL(origin).host === url.host;
    } catch {
      sameSite = false;
    }
    if (!sameSite) return new Response('Forbidden.', { status: 403 });
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return new Response('The form data could not be read.', { status: 400 });
  }

  const field = (name) => String(form.get(name) ?? '').trim();
  const kind = field('form') in FORMS ? field('form') : 'contact';
  const back = (code) => redirect(url, `${FORMS[kind].page}?error=${code}`);

  // Honeypot: real visitors never see this field. Bots that fill it get a normal-looking success.
  if (field('website')) return redirect(url, '/thank-you');

  const name = field('name');
  const businessName = field('business_name');
  const email = field('email');
  const phone = field('phone');
  const message = field('message');

  if (!name || name.length > 200) return back('invalid');
  if (businessName.length > 200) return back('invalid');
  if (!EMAIL_PATTERN.test(email) || email.length > 254) return back('invalid');
  if (!phone || phone.length > 50) return back('invalid');
  if (!message || message.length > 5000) return back('invalid');

  if (!(await verifyTurnstile(field('cf-turnstile-response'), request, env))) return back('spam');

  try {
    const raw = buildEmail({ from: env.CONTACT_FROM, to: env.CONTACT_TO, kind, name, businessName, email, phone, message });
    await env.CONTACT_EMAIL.send(new EmailMessage(env.CONTACT_FROM, env.CONTACT_TO, raw));
  } catch (err) {
    console.error('Contact email failed:', err);
    return back('send');
  }

  return redirect(url, '/thank-you');
}

async function verifyTurnstile(token, request, env) {
  if (!token || !env.TURNSTILE_SECRET) {
    console.error('Turnstile skipped:', !token ? 'no token in the form post' : 'TURNSTILE_SECRET is not set');
    return false;
  }
  const body = new FormData();
  body.append('secret', env.TURNSTILE_SECRET);
  body.append('response', token);
  const ip = request.headers.get('cf-connecting-ip');
  if (ip) body.append('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
    const result = await res.json();
    if (!result.success) console.error('Turnstile rejected:', JSON.stringify(result['error-codes'] ?? []));
    return result.success === true;
  } catch (err) {
    console.error('Turnstile check failed:', err);
    return false;
  }
}

// Header values must stay on one line and be ASCII; anything else is sent as an RFC 2047 encoded word.
function encodeHeader(text) {
  const clean = text.replace(/[\r\n]+/g, ' ').trim();
  if (/^[\x20-\x7e]*$/.test(clean)) return clean;
  return `=?UTF-8?B?${toBase64(clean)}?=`;
}

function toBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function buildEmail({ from, to, kind, name, businessName, email, phone, message }) {
  const lines = [`Form: ${FORMS[kind].label}`, `Name: ${name}`];
  if (businessName) lines.push(`Business name: ${businessName}`);
  lines.push(`Email: ${email}`, `Phone: ${phone}`, '', 'Message:', message, '');
  const encodedBody = toBase64(lines.join('\n')).replace(/(.{76})/g, '$1\r\n');

  return [
    `From: Virginia City Farmacy Website <${from}>`,
    `To: <${to}>`,
    `Reply-To: <${email}>`,
    `Subject: ${encodeHeader(`VCFarmacy ${FORMS[kind].label} from ${name.slice(0, 60)}`)}`,
    `Message-ID: <${crypto.randomUUID()}@${from.split('@')[1]}>`,
    `Date: ${new Date().toUTCString().replace('GMT', '+0000')}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    encodedBody,
    '',
  ].join('\r\n');
}

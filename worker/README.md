# Contact form Worker

Handles the contact and wholesale forms (`POST /api/contact`). The site itself is a static
Cloudflare Pages project; only `virginiacityfarmacy.com/api/*` (and the `www` version) runs this Worker.
Pages can't use Email Routing's `send_email` binding, which is why this is a separate Worker.

What it does: same-origin check, honeypot, field validation, Turnstile verification, then an email to
`vcfarmacy@gmail.com` through Cloudflare Email Routing (Reply-To is the visitor), then a redirect to
`/thank-you`. On a problem it redirects back to the form with `?error=invalid|spam|send`, which
`contact-form.js` turns into a message.

## Requirements (Cloudflare dashboard)
- Email Routing enabled on `virginiacityfarmacy.com` (its MX/SPF/DKIM records added).
- `vcfarmacy@gmail.com` verified as a destination address (Email Routing > Destination addresses).
- The Turnstile widget "Virginia City Farmacy" allows `virginiacityfarmacy.com`.

## Deploy
From this folder:

```
npx wrangler deploy
npx wrangler secret put TURNSTILE_SECRET   # paste the secret of the "Virginia City Farmacy" widget
```

Pushes to GitHub only redeploy the static site. After changing anything in this folder, run
`npx wrangler deploy` again.

## Local test
Create `.dev.vars` (git-ignored) with Cloudflare's always-pass test secret, then `npx wrangler dev`:

```
TURNSTILE_SECRET=1x0000000000000000000000000000000AA
```

`wrangler dev` simulates the email binding and writes the message to a local file instead of sending it.

## Troubleshooting
- "invalid-input-secret" in `npx wrangler tail`: the wrong Turnstile secret was stored (this account also has an
  EpicSmokeSpot widget).
- Visitors land back on the form with the spam-check message: the Turnstile token was missing or rejected.
- Delivery fails: check that `vcfarmacy@gmail.com` still shows Verified in Email Routing.

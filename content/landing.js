// Landing-page content. Every claim here is checked against the voult,
// voult-sdk and voult-playground repos. Keep it that way when editing.

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Minimal highlighter for the static snippets below (JS + shell only).
const RULES = {
  js: [
    /(\/\/.*$)|('(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(import|from|const|await|async|if|new|return|export)\b|\b(\d+)\b|([A-Za-z_$][\w$]*)(?=\()/gm,
    ['tk-c', 'tk-s', 'tk-k', 'tk-n', 'tk-f'],
  ],
  bash: [/(#.*$)|('(?:[^'\\]|\\.)*')|(^(?:npm|npx|node|curl)\b)|(\s--?[\w-]+)/gm, ['tk-c', 'tk-s', 'tk-k', 'tk-n']],
};

function highlight(code, lang) {
  const [re, classes] = RULES[lang];
  return esc(code).replace(re, (m, ...groups) => {
    const i = groups.slice(0, classes.length).findIndex((g) => g);
    return `<span class="${classes[i]}">${m}</span>`;
  });
}

const snippet = (label, lang, code) => ({ label, lang, html: highlight(code.trim(), lang) });

// From voult/docs/integration/QUICK_START.md and the @voult/sdk README.
const quickstart = [
  snippet('server.js', 'js', `
import express from 'express';
import { createVoultRouter } from '@voult/express';

const app = express();

// Reads VOULT_CLIENT_ID, VOULT_CLIENT_SECRET and
// VOULT_SESSION_SECRET from the .env written by \`voult init\`.
app.use('/api/auth', createVoultRouter());

app.listen(3000);
`),
  snippet('client.js', 'js', `
// Cookie strategy: tokens live in httpOnly cookies, never in JS.
await fetch('/api/auth/email-login', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

const me = await fetch('/api/auth/user/me', { credentials: 'include' });
`),
  snippet('@voult/sdk', 'js', `
import voult from '@voult/sdk';

const auth = voult({
  clientId: process.env.VOULT_CLIENT_ID,
  clientSecret: process.env.VOULT_CLIENT_SECRET,
});

const result = await auth.signInWithEmailAndPassword(email, password);

if (result.mfaRequired) {
  await auth.verifyMfaLogin(result.mfaPendingToken, code);
}
`),
];

const install = 'npm install express @voult/express @voult/sdk';

// Subset of the routes createVoultRouter() mounts (@voult/express README).
const routes = [
  ['POST', '/register'],
  ['POST', '/email-login'],
  ['POST', '/username-login'],
  ['POST', '/sessions/refresh'],
  ['GET', '/user/me'],
  ['POST', '/user/forgot-password'],
  ['GET', '/user/verify-email'],
  ['POST', '/mfa/verify'],
  ['POST', '/logout'],
];

// "Why Voult": an illustrative in-house auth module, not real Voult code.
const inHouse = [
  'auth/password-hash.js',
  'auth/login.js',
  'auth/lockout.js',
  'auth/tokens/access-jwt.js',
  'auth/tokens/refresh-rotation.js',
  'auth/sessions/revoke.js',
  'auth/email/verify.js',
  'auth/email/reset-password.js',
  'auth/magic-link.js',
  'auth/oauth/google.js',
  'auth/oauth/github.js',
  'auth/oauth/…4 more providers',
  'auth/mfa/totp.js',
  'auth/mfa/backup-codes.js',
  'auth/passkeys/webauthn.js',
  'auth/audit-log.js',
  'middleware/rate-limit.js',
  'middleware/csrf.js',
];

// Login as it actually flows through @voult/express (cookie strategy).
const loginFlow = [
  { from: 0, to: 1, label: 'POST /api/auth/email-login', note: 'email + password' },
  { from: 1, to: 2, label: 'Authenticated with your client ID + secret', note: 'the secret never reaches the browser' },
  { at: 2, label: 'Checks lockout, verifies the bcrypt hash, issues an MFA challenge if enabled, writes an audit event' },
  { from: 2, to: 1, label: 'Access token + refresh token', note: 'short-lived JWT, rotating refresh token' },
  { from: 1, to: 0, label: 'Set-Cookie: httpOnly', note: 'refreshed via /sessions/refresh' },
];

const A = 'Available', P = 'Planned', W = 'In progress';
const capabilities = [
  {
    id: 'methods',
    title: 'Sign-in methods',
    body: 'Every method lands in the same user record and the same session model.',
    items: [
      ['Email + password', 'bcrypt-hashed, strength rules enforced', A],
      ['Username + password', 'register and log in by username', A],
      ['OAuth', 'Google, GitHub, Microsoft, Apple, Facebook, LinkedIn', A],
      ['Magic links', 'single-use, allowlisted redirect URIs', A],
      ['Passkeys', 'WebAuthn registration and sign-in', A],
      ['Email verification', 'unverified accounts can’t log in', A],
      ['Password reset', 'forgot / reset flow with emails sent by Voult', A],
      ['Account linking', 'connect several providers to one user', A],
    ],
  },
  {
    id: 'sessions',
    title: 'Sessions & security',
    body: 'Secure defaults that are on for every app, not settings you have to find.',
    items: [
      ['Access tokens', 'short-lived JWTs with token versioning', A],
      ['Refresh rotation', 'replaying an old token revokes every session', A],
      ['Session management', 'list and revoke sessions per user', A],
      ['MFA', 'TOTP with backup codes and attempt limits', A],
      ['Account lockout', 'after 5 failed password attempts', A],
      ['Rate limiting', 'Redis-backed limits on sensitive endpoints', A],
      ['CSRF + headers', 'CSRF tokens and Helmet security headers', A],
      ['IP allowlists', 'per app, with alerts for new IPs', A],
      ['Audit log', 'every auth event, tagged with a risk level', A],
    ],
  },
  {
    id: 'tooling',
    title: 'Developer tooling',
    body: 'Published packages today; the rest is on the road to launch.',
    items: [
      ['`@voult/sdk`', 'JavaScript client for Node and the browser', A],
      ['`@voult/express`', 'mountable auth router, cookie or bearer sessions', A],
      ['`@voult/cli`', '`voult init` writes .env and a session secret', A],
      ['Developer dashboard', 'apps, credentials, secret rotation, OAuth config', A],
      ['Documentation', 'quick start and API reference', W],
      ['Playground', 'try every flow against a real app', W],
      ['`@voult/react`', 'hooks and pre-built sign-in components', P],
      ['`voult doctor`', 'checks your integration end to end', P],
    ],
  },
];

// From voult/docs/dx (PHASE_1..3) and voult/docs/launch.
const roadmap = [
  {
    stage: 'Shipped',
    items: ['Core auth API: passwords, OAuth, magic links, MFA, passkeys', '`@voult/sdk`, `@voult/express` and `@voult/cli` on npm', 'Developer dashboard: apps, credentials, OAuth setup'],
  },
  {
    stage: 'In progress',
    items: ['Documentation and quick start', 'Dashboard and playground redesign', 'Terms and privacy policy for launch'],
  },
  {
    stage: 'Next',
    items: ['Private beta, then hardening before launch', 'Voult-hosted OAuth routes in `@voult/express`', '`@voult/react` and `voult doctor`'],
  },
  {
    stage: 'Later',
    items: ['`@voult/next` for Next.js', '`create-voult-app`', 'API version headers and deploy guides'],
  },
];

module.exports = { quickstart, install, routes, inHouse, loginFlow, capabilities, roadmap, highlight };

if (require.main === module) {
  const assert = require('assert');
  assert.strictEqual(
    highlight("const a = f('x'); // hi", 'js'),
    '<span class="tk-k">const</span> a = <span class="tk-f">f</span>(<span class="tk-s">\'x\'</span>); <span class="tk-c">// hi</span>'
  );
  assert.strictEqual(highlight('npx voult init --force', 'bash'), '<span class="tk-k">npx</span> voult init<span class="tk-n"> --force</span>');
  assert.ok(!highlight('a < b', 'js').includes('<b'));
  console.log('highlight ok');
}

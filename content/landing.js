// Landing-page content. Every claim here is checked against the voult,
// voult-sdk and voult-playground repos — keep it that way when editing.

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

const quickstart = [
  snippet('server.js', 'js', `
import express from 'express';
import { createVoultRouter } from '@voult/express';

const app = express();

// Register, login, logout, refresh, /me, password reset,
// email verification and MFA challenges — one router.
app.use('/api/auth', createVoultRouter());

app.listen(3000);
`),
  snippet('Terminal', 'bash', `
npm install express @voult/express @voult/sdk
npx voult init        # writes .env with your app credentials
node --env-file=.env server.js
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

const routes = [
  ['POST', '/register'],
  ['POST', '/email-login'],
  ['POST', '/sessions/refresh'],
  ['GET', '/user/me'],
  ['POST', '/user/forgot-password'],
  ['GET', '/user/verify-email'],
  ['POST', '/mfa/verify'],
  ['POST', '/logout'],
];

const problems = [
  'Password hashing', 'Access tokens', 'Refresh rotation', 'Session revocation',
  'OAuth callbacks', 'Account linking', 'Email verification', 'Password resets',
  'Magic links', 'TOTP + backup codes', 'Passkeys', 'Brute-force lockout',
  'Rate limiting', 'CSRF', 'Audit trails',
];

const features = [
  { icon: 'lock', title: 'Email & password', body: 'Sign up with email or username. Passwords hashed with bcrypt, strength rules enforced, unverified accounts gated.' },
  { icon: 'refresh', title: 'Sessions & tokens', body: 'Short-lived JWT access tokens and rotating refresh tokens, stored hashed and revocable per user.' },
  { icon: 'globe', title: 'OAuth, six providers', body: 'Google, GitHub, Microsoft, Apple, Facebook and LinkedIn — configured per app, with account linking.' },
  { icon: 'send', title: 'Magic links', body: 'Single-use passwordless sign-in links, redirected only to callback URLs you allowlist.' },
  { icon: 'mailcheck', title: 'Verification & recovery', body: 'Email verification and forgot/reset password flows, with the emails sent for you.' },
  { icon: 'phone', title: 'Multi-factor auth', body: 'TOTP enrollment, backup codes and an MFA challenge step on sign-in, with attempt limits.' },
  { icon: 'fingerprint', title: 'Passkeys', body: 'WebAuthn registration and sign-in with platform passkeys, alongside passwords or instead of them.' },
  { icon: 'scroll', title: 'Audit log', body: 'Logins, failures, resets and revocations recorded per app, each tagged with a risk level.' },
  { icon: 'dashboard', title: 'Developer dashboard', body: 'Create apps, copy API credentials, rotate client secrets and configure each OAuth provider.' },
];

const integrations = [
  { mark: 'JS', name: 'Node.js', detail: 'Runtime for @voult/express and @voult/sdk', status: 'Supported' },
  { mark: 'ex', name: 'Express', detail: 'Mountable router via @voult/express (4.x and 5.x)', status: 'Supported' },
  { mark: '{}', name: 'JavaScript SDK', detail: '@voult/sdk — Node and browser clients', status: 'Supported' },
  { mark: 'Re', name: 'React + Vite', detail: 'Works today against the Express router; the playground is built this way', status: 'Works today' },
  { mark: '⚛', name: '@voult/react', detail: 'Hooks and pre-built sign-in components', status: 'Planned' },
  { mark: 'N', name: 'Next.js', detail: 'First-class integration', status: 'Planned' },
];

const security = [
  { icon: 'hash', title: 'bcrypt password hashing', body: 'Plaintext passwords are never stored.' },
  { icon: 'refresh', title: 'Refresh-token reuse detection', body: 'Replaying a rotated refresh token revokes every session for that user and logs a critical event.' },
  { icon: 'ban', title: 'Account lockout', body: 'Five failed password attempts lock the account; MFA codes have their own attempt limit.' },
  { icon: 'gauge', title: 'Rate limiting', body: 'Sensitive endpoints are rate-limited, with a Redis-backed store.' },
  { icon: 'shield', title: 'CSRF + security headers', body: 'CSRF tokens on state-changing routes; Helmet sets standard security headers.' },
  { icon: 'globe', title: 'IP allowlists', body: 'Restrict where an app can be called from.' },
  { icon: 'key', title: 'Client secret rotation', body: 'Rotate an app’s secret from the dashboard; the secret stays server-side in your backend.' },
  { icon: 'scroll', title: 'Risk-scored audit log', body: 'High-risk actions — resets, unlinks, revocations — are flagged for review.' },
];

module.exports = { quickstart, routes, problems, features, integrations, security, highlight };

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

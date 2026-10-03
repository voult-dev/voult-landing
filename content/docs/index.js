// Public docs, copied from the voult and voult-sdk repos by `npm run docs:sync`.
// `src` is relative to the voult.dev folder that holds those repos. Order here is sidebar order.
module.exports = [
  { group: 'Getting started', slug: 'quickstart', title: 'Quickstart', src: 'voult/docs/integration/QUICK_START.md' },
  { group: 'Getting started', slug: 'errors', title: 'Error codes', src: 'voult/docs/integration/ERRORS.md' },

  { group: 'Packages', slug: 'express', title: '@voult/express', src: 'voult-sdk/packages/express/README.md' },
  { group: 'Packages', slug: 'sdk', title: '@voult/sdk', src: 'voult-sdk/packages/voult-sdk/README.md' },
  { group: 'Packages', slug: 'react', title: '@voult/react', src: 'voult-sdk/packages/react/README.md' },
  { group: 'Packages', slug: 'cli', title: '@voult/cli', src: 'voult-sdk/packages/cli/README.md' },

  { group: 'Guides', slug: 'mfa', title: 'MFA (TOTP)', src: 'voult/docs/security_imp/MFA_TOTP_GUIDE.md' },
  { group: 'Guides', slug: 'passkeys', title: 'Passkeys (WebAuthn)', src: 'voult/docs/security_imp/WEBAUTHN_GUIDE.md' },
  { group: 'Guides', slug: 'magic-links', title: 'Magic links', src: 'voult/docs/features/MAGIC_LINK_AUTHENTICATION_GUIDE.md' },
];

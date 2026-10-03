# Error codes

Every error code the Voult API returns, what it means, and what to do about it.

## How errors arrive

**JSON responses** (every `/api/*` route):

```json
{ "error": { "code": "INVALID_CREDENTIALS", "message": "Invalid email or password", "status": 401 } }
```

Branch on `code`. `message` is for humans and can change between releases; `status` repeats the HTTP status.

`@voult/sdk` throws these as typed errors with the same `code` and `status`. `@voult/express` passes them through to the browser as JSON, and `@voult/react` throws them as `VoultRequestError`.

**Hosted OAuth redirects.** When a sign-in started with `/api/oauth/:provider/authorize` fails after the user has left your site, Voult sends the browser back to your `redirectUri` with `?error=<CODE>&error_description=…&state=…` instead of JSON. The codes are the ones below. `@voult/express` renames the parameter to `voult_error` on its way to your page.

**Rate limits** answer `429` with `{ "error": "<message>" }` and no `code` yet. Treat any `429` as "slow down and retry later".

## Rules

- A code is never renamed and never reused for a different meaning. New failure cases get new codes.
- Codes may be added in any minor release. Handle unknown codes as a generic failure for that `status`.
- A code listed here is part of the public API. A test (`tests/errorCatalog.test.js`) fails the build if the API can return a code that isn't in this file.

## Client credentials and app

| Code | Status | Meaning | Fix |
|---|---|---|---|
| `CLIENT_ID_REQUIRED` | 401 | No `X-Client-Id` header. | Send your app's client ID on every request. `@voult/sdk` does this from `clientId`. |
| `CLIENT_SECRET_REQUIRED` | 401 | The route needs `X-Client-Secret` and none was sent. | Call this route from your server with the client secret. Never ship the secret to a browser. |
| `INVALID_CLIENT` | 401 | The client ID doesn't match an active app. | Copy the client ID from the dashboard again; check the app isn't disabled. |
| `INVALID_CLIENT_SECRET` | 401 | The client secret is wrong. | Copy it from the dashboard again. If you rotated it, update your server's env. |
| `APP_NOT_FOUND` | 404 | The app was deleted or deactivated. | Check the app in the dashboard. |
| `APP_NOT_ACTIVE` | 404 | Hosted OAuth: the app is missing or inactive. | Check the app in the dashboard. |
| `IP_NOT_ALLOWLISTED` | 403 | The app has an IP allowlist and the caller's IP isn't on it. | Add your server's IP or CIDR in the dashboard, or remove the allowlist. |
| `TOKEN_APP_MISMATCH` | 403 | The end-user access token was issued for a different app than the client ID sent. | Use tokens only with the app that issued them. |
| `FETCH_PROVIDER_VISIBILITY_FAILED` | 500 | Couldn't load which sign-in providers are visible (`GET /api/provider-visibility/:clientId`). | Retry; report it if it persists. |
| `CONFIG_ERROR` | 500 | Voult itself is misconfigured. | Not your bug. Retry later and report it if it persists. |

## Dashboard-only routes (audit logs, IP allowlist)

| Code | Status | Meaning | Fix |
|---|---|---|---|
| `DEVELOPER_AUTH_REQUIRED` | 401 | The route needs a signed-in Voult developer. | Use the dashboard, or sign in to it first. |
| `APP_ACCESS_DENIED` | 403 | The signed-in developer doesn't own this app. | Sign in with the account that owns the app. |
| `INVALID_IP_OR_CIDR` | 400 | The value isn't an IPv4 address or CIDR range. | Use e.g. `203.0.113.7` or `203.0.113.0/24`. |
| `IP_ALLOWLIST_EXISTS` | 409 | That IP or range is already on the allowlist. | Nothing to do. |
| `IP_ALLOWLIST_NOT_FOUND` | 404 | No allowlist entry with that ID. | Refresh the list; it may already be deleted. |
| `IP_ALERT_NOT_FOUND` | 404 | No IP alert with that ID. | Refresh the list. |

## Sign-up and sign-in

| Code | Status | Meaning | Fix |
|---|---|---|---|
| `VALIDATION_ERROR` | 400 | A required field is missing or malformed. `message` names it. | Fix the request body. |
| `WEAK_PASSWORD` | 400 | The password doesn't meet the rules (8+ characters, upper, lower, digit, one of `@$!%*?&`). | Show `PASSWORD_REQUIREMENTS_MESSAGE` from `@voult/sdk/validation` and ask again. |
| `INVALID_USERNAME` | 400 | Username isn't 3–30 letters, digits or underscores. | Ask for a different username. |
| `USER_EXISTS` | 409 | An account with this email already exists in this app. | Offer sign-in or password reset instead. |
| `USERNAME_TAKEN` | 409 | The username is in use in this app. | Ask for a different username. |
| `INVALID_CREDENTIALS` | 401 | Wrong email/username or password (also used when a password + MFA code pair is wrong). | Ask the user to try again. Don't reveal which part was wrong. |
| `ACCOUNT_LOCKED` | 423 | Too many failed password or MFA attempts; the account is locked for 15 minutes. | Tell the user to wait or reset their password. |
| `ACCOUNT_DISABLED` | 401 / 403 | The account was disabled by the user or the app. | Show a "this account is disabled" message; `POST /api/user/reenable` (with the user's access token) if your app allows it. |
| `EMAIL_NOT_VERIFIED` | 403 | The email (or the provider's email) isn't verified. | Ask the user to verify their email, or to verify it with the provider. |
| `EMAIL_REQUIRED` | 400 / 403 | The provider didn't share an email, and Voult needs one to create or match the account. | Ask the user to make an email visible at the provider (e.g. a public or primary email on GitHub). |
| `USER_NOT_FOUND` | 404 | No account matches (e.g. a provider login for someone who never registered). | Offer sign-up. |
| `UNAUTHORIZED` | 401 | The route needs an end-user access token and none (or an invalid or expired one) was sent. | Refresh the session (`refreshSession`), then retry; sign in again if that fails. |

## Sessions and tokens

Access tokens live 15 minutes (`ACCESS_TOKEN_TTL`), refresh tokens 30 days.

| Code | Status | Meaning | Fix |
|---|---|---|---|
| `INVALID_REFRESH_TOKEN` | 401 | The refresh token is unknown or was revoked. | Sign the user in again. |
| `REFRESH_TOKEN_EXPIRED` | 401 | The refresh token is older than 30 days. | Sign the user in again. |
| `REFRESH_TOKEN_REUSE_DETECTED` | 401 | A refresh token was used twice, so Voult revoked the whole session as a precaution. | Sign the user in again. If it keeps happening, two tabs or servers are refreshing the same token at once. |
| `SESSION_NOT_FOUND` | 404 | No session with that ID for this user. | Refresh the session list. |
| `INVALID_ID` | 400 | An ID in the URL isn't a valid ID. | Check the ID you passed. |

## MFA (TOTP)

| Code | Status | Meaning | Fix |
|---|---|---|---|
| `MFA_ALREADY_ENABLED` | 400 | MFA is already on. | Nothing to do. |
| `MFA_NOT_ENABLED` | 400 | MFA is off, so there's nothing to disable or verify. | Nothing to do. |
| `MFA_SETUP_EXPIRED` | 400 | The setup secret expired before it was confirmed. | Call MFA setup again and scan the new QR code. |
| `INVALID_MFA_TOKEN` | 400 / 401 | The 6-digit or backup code is wrong. | Ask for the code again. |
| `INVALID_MFA_SESSION` | 401 | The MFA-pending token from sign-in expired (5 minutes) or is invalid. | Start sign-in again. |

## Passkeys (WebAuthn)

| Code | Status | Meaning | Fix |
|---|---|---|---|
| `WEBAUTHN_CHALLENGE_EXPIRED` | 400 | The registration or sign-in challenge expired. | Request new options and try again. |
| `WEBAUTHN_REGISTRATION_FAILED` | 400 | The browser's registration response didn't verify. | Try again; check the page's origin matches the app's configured origin. |
| `WEBAUTHN_CREDENTIAL_EXISTS` | 409 | This passkey is already registered. | Nothing to do. |
| `WEBAUTHN_NOT_REGISTERED` | 400 | The account has no passkeys. | Offer another sign-in method or passkey registration. |
| `WEBAUTHN_CREDENTIAL_UNKNOWN` | 401 | The passkey used isn't registered to any account in this app. | Offer another sign-in method. |
| `WEBAUTHN_AUTHENTICATION_FAILED` | 401 | The passkey signature didn't verify. | Try again. |
| `WEBAUTHN_CREDENTIAL_NOT_FOUND` | 404 | No passkey with that ID on this account. | Refresh the passkey list. |

## Email links (magic link, verification)

| Code | Status | Meaning | Fix |
|---|---|---|---|
| `INVALID_OR_EXPIRED_TOKEN` | 400 | The magic-link token is wrong, used, or expired. | Send a new link. |
| `INVALID_VERIFICATION_LINK` | 400 | The email-verification link is malformed. | Send a new verification email. |
| `TOKEN_EXPIRED` | 400 | The email-verification link is used or expired. | Send a new verification email. |

## Account

| Code | Status | Meaning | Fix |
|---|---|---|---|
| `ACCOUNT_ALREADY_ACTIVE` | 400 | Reactivating an account that isn't disabled. | Nothing to do. |
| `ACCOUNT_ALREADY_DISABLED` | 400 | Disabling an account that's already disabled. | Nothing to do. |
| `NO_CHANGES_DETECTED` | 400 | The profile update contains no changes. | Nothing to do. |

## Hosted OAuth (`/api/oauth/*`)

These can arrive as JSON or as the `error` parameter on the redirect back to your `redirectUri`.

When the **provider** refuses (most often: the user pressed Cancel), its own lowercase OAuth 2.0 error is passed through unchanged, e.g. `access_denied`, with the provider's `error_description`. Those aren't Voult codes and aren't listed here; treat them as "sign-in didn't complete".

| Code | Status | Meaning | Fix |
|---|---|---|---|
| `INVALID_PROVIDER` | 400 | The provider name isn't supported. | Use a provider the app supports; `GET /api/apps/me` lists them with their status. |
| `PROVIDER_NOT_ENABLED` | 403 | The provider is turned off for this app. | Enable it in the dashboard. |
| `PROVIDER_DISABLED_FOR_THIS_APP` | 403 | Same as `PROVIDER_NOT_ENABLED`, raised at the callback. | Enable it in the dashboard. |
| `PROVIDER_NOT_CONFIGURED` | 400 | The provider is enabled but its client ID or secret is missing. | Add the provider credentials in the dashboard. `npx voult doctor` reports this. |
| `INVALID_INTENT` | 400 | `intent` isn't `authenticate`, `login` or `register`. Linking has its own route. | Fix `intent`; use `POST /api/oauth/:provider/link` to link. |
| `INVALID_STATE_PARAMETER` | 400 | Your `state` isn't a string of at most 256 characters. | Send a shorter string. |
| `INVALID_CALLBACK_URL` | 400 | The `redirectUri` isn't on the app's allowlist. | Add the exact URL in the dashboard (scheme, host, port and path must match). |
| `INVALID_OAUTH_STATE` | 400 | Voult's own state is missing, tampered with or older than 10 minutes. | Start the sign-in again. |
| `INVALID_LINK_STATE` | 400 | A linking state without a user. | Start linking again from a signed-in session. |
| `INVALID_OAUTH_CALLBACK` | 400 | The provider came back with neither an authorization code nor an error. | Start the sign-in again. |
| `PROVIDER_TOKEN_EXCHANGE_FAILED` | 400 | The provider rejected the code exchange. `message` has the provider's reason. | Check the provider credentials in the dashboard and the callback URL registered at the provider. |
| `PROVIDER_ID_NOT_FOUND` | 400 | The provider's profile had no user ID. | Retry; report it if it persists. |
| `PROVIDER_ALREADY_LINKED_TO_ANOTHER_USER` | 409 | That provider account is already linked to a different user in this app. | Sign in with that account, or unlink it there first. |
| `MISSING_PARAMETERS` | 400 | `POST /api/oauth/exchange` without `code` or `redirectUri`. | Send both. |
| `INVALID_OAUTH_CODE` | 400 | The one-time `voult_code` is wrong, used, or expired. | Start the sign-in again. Exchange the code once, right away. |
| `OAUTH_CALLBACK_FAILED` | 500 | Unexpected failure at the callback (redirect `error` only). | Retry; report it if it persists. |
| `INTERNAL_ERROR` | 500 | Unexpected server error (any route). | Retry; report it if it persists. |

## Provider token endpoints (`/api/auth/<provider>/*`)

Older routes where your app hands Voult a provider token or code directly. New integrations should use hosted OAuth.

| Code | Status | Meaning | Fix |
|---|---|---|---|
| `GOOGLE_NOT_CONFIGURED` | 400 | Google isn't enabled or configured for this app. | Enable and configure Google in the dashboard. |
| `GITHUB_NOT_CONFIGURED` | 400 | GitHub isn't fully configured for this app. | Add the GitHub credentials in the dashboard. |
| `LINKEDIN_NOT_CONFIGURED` | 400 | LinkedIn isn't fully configured for this app. | Add the LinkedIn credentials in the dashboard. |
| `LINKEDIN_NOT_ENABLED` | 400 | LinkedIn is turned off for this app. | Enable it in the dashboard. |
| `FACEBOOK_NOT_ENABLED` | 400 | Facebook is turned off for this app. | Enable it in the dashboard. |
| `MICROSOFT_NOT_ENABLED` | 400 | Microsoft is turned off for this app. | Enable it in the dashboard. |
| `APPLE_NOT_ENABLED` | 400 | Apple is turned off for this app. | Enable it in the dashboard. |
| `INVALID_GOOGLE_TOKEN` | 401 | The Google ID or access token didn't verify. | Get a fresh token from Google; check it was issued for the client ID in the dashboard. |
| `INVALID_GITHUB_CODE` | 400 | GitHub rejected the authorization code. | Codes are single-use and short-lived: start again. |
| `GITHUB_OAUTH_FAILED` | 400 | GitHub returned an error. `message` has GitHub's reason. | Check the GitHub app credentials and callback URL. |
| `INVALID_FACEBOOK_TOKEN` | 401 | The Facebook access token didn't verify. | Get a fresh token from Facebook. |
| `INVALID_MICROSOFT_ID_TOKEN` | 401 | The Microsoft ID token didn't verify. | Get a fresh token from Microsoft. |
| `MICROSOFT_TOKEN_EXCHANGE_FAILED` | 401 | Microsoft rejected the code exchange. | Check the Microsoft credentials and redirect URI. |
| `LINKEDIN_TOKEN_EXCHANGE_FAILED` | 401 | LinkedIn rejected the code exchange. | Check the LinkedIn credentials and redirect URI. |
| `LINKEDIN_PROFILE_FETCH_FAILED` | 401 | Couldn't read the LinkedIn profile with the token. | Retry; check the LinkedIn app's scopes. |
| `INVALID_APPLE_ID_TOKEN` | 401 | The Apple ID token didn't verify. | Get a fresh token from Apple. |
| `APPLE_TOKEN_EXCHANGE_FAILED` | 401 | Apple rejected the code exchange. | Check the Apple credentials. |

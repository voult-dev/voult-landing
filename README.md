# voult-landing

Pre-launch waitlist landing page for **[voult.dev](https://www.voult.dev/)** — a developer-first authentication platform.

Built using the **same stack and conventions as the [main voult.dev repo](https://github.com/DevOlabode/voult)**: Node.js + Express 5, EJS (with `ejs-mate` layouts), Bootstrap 5, Mongoose, Nodemailer over Brevo SMTP, Helmet, express-rate-limit, express-validator.

---

## What's on the page

1. **Hero** with a typewriter-style code snippet showing what the SDK feels like.
2. **Waitlist form** — email input that POSTs to `/api/waitlist`. On success:
   - the email is stored in **MongoDB** at `mongodb://127.0.0.1:27017/usersEmail`
   - a confirmation email is sent via **Brevo SMTP** (same transport as voult.dev's `config/mailer.js`)
3. **Fancy live countdown** to launch (configurable via the `LAUNCH_DATE` env var).
4. **MVP features grid** — Security, lightweight SDK + docs, smooth DX, rich developer portal, free MVP (no card), pre-built UI kits.
5. **Footer** with placeholder slots for your legal links (Terms, Privacy, Cookies, Security, Contact) — wire up the hrefs when your legal pages are ready.

---

## Project layout

```
voult-landing/
├── src/
│   └── index.js              # Express app entry (mirrors voult/src/index.js style)
├── config/
│   ├── database.js           # Mongoose connection to mongodb://127.0.0.1:27017/usersEmail
│   └── mailer.js             # Brevo SMTP transporter (copied 1:1 from voult/config/mailer.js)
├── models/
│   └── WaitlistEmail.js      # Mongoose schema for stored emails
├── routes/
│   └── waitlist.js           # POST /api/waitlist (validated + rate-limited)
├── services/
│   └── emailService.js       # sendWaitlistEmail() — same pattern as voult/services/emailService.js
├── views/
│   ├── layout/boilerplate.ejs   # ejs-mate layout (matches voult's pattern)
│   ├── home/landing.ejs         # the landing page
│   └── error/404.ejs
├── public/
│   ├── css/landing.css       # dark, developer-style design (Inter + JetBrains Mono)
│   └── js/
│       ├── countdown.js      # live launch countdown
│       └── waitlist.js       # form fetch + UX states
├── .env.example
├── .gitignore
└── package.json
```

---

## Getting started

### 1. Install dependencies

```bash
cd voult-landing
npm install
```

### 2. Start MongoDB locally

The app connects to `mongodb://127.0.0.1:27017/usersEmail` by default — exactly as you requested. Make sure MongoDB is running locally:

```bash
# macOS (brew)
brew services start mongodb-community

# or via docker
docker run -d -p 27017:27017 --name mongo mongo:7
```

### 3. Configure environment

```bash
cp .env.example .env
```

Then fill in `.env`:

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/usersEmail
LAUNCH_DATE=2026-11-21T09:00:00Z

BREVO_USER=your_brevo_smtp_user
BREVO_SMTP_KEY=your_brevo_smtp_key
MAIL_FROM="voult.dev" <olabodeoluwapelumi838@gmail.com>
```

You can reuse the same Brevo credentials you already use in the main voult.dev project (`BREVO_USER`, `BREVO_SMTP_KEY`).

### 4. Run

```bash
npm run dev     # nodemon
# or
npm start
```

Open <http://localhost:3000>.

---

## How email sending works (and how it mirrors voult.dev)

This is intentionally a **1:1 mirror** of the main repo's pattern:

| voult.dev                                | voult-landing                                |
|------------------------------------------|----------------------------------------------|
| `config/mailer.js` — Brevo transporter   | `config/mailer.js` — same Brevo transporter  |
| `services/emailService.js` — `welcomeEmail`, `verifyEndUsers`, etc. | `services/emailService.js` — `sendWaitlistEmail` |
| `transporter.sendMail({ from, to, subject, html })` | identical call shape |

When a visitor submits their email:

1. `POST /api/waitlist` is hit (`routes/waitlist.js`).
2. `express-validator` validates + normalizes the email; `express-rate-limit` blocks abuse (10/req per 10 min per IP).
3. The email is upserted into the **`waitlistemails`** collection inside the `usersEmail` MongoDB database.
4. `sendWaitlistEmail(email)` is called fire-and-forget — it uses the **exact same Brevo transporter** as voult.dev to deliver a dark-themed confirmation email.

If the email is already in the DB, the API returns a friendly "you're already on the list" message instead of erroring.

---

## Inspecting stored emails

```bash
mongosh
> use usersEmail
> db.waitlistemails.find().pretty()
```

Each document looks like:

```js
{
  _id: ObjectId("..."),
  email: "dev@example.com",
  source: "landing",
  userAgent: "...",
  ip: "127.0.0.1",
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

---

## Customizing

- **Launch date** → change `LAUNCH_DATE` in `.env` (ISO-8601, UTC recommended).
- **From address** → change `MAIL_FROM` in `.env`.
- **Footer legal links** → edit `views/home/landing.ejs`, in the `<footer>` block. Replace the `href="#"` placeholders with your real Terms / Privacy / Cookie / Security / Contact URLs.
- **Features copy** → edit the `.features-grid` block in `views/home/landing.ejs`.
- **Colors / theme** → all tokens live at the top of `public/css/landing.css` (`:root`).

---

## Deploying

Same pattern as voult.dev (Render, Railway, Fly, etc.). Required env vars in production:

- `NODE_ENV=production`
- `MONGO_URI` (point at a hosted MongoDB — Atlas works well)
- `BREVO_USER`, `BREVO_SMTP_KEY`, `MAIL_FROM`
- `LAUNCH_DATE`

---

## Pushing to GitHub

This sandbox can't push directly, but the project is ready to go. From your machine:

```bash
cd voult-landing
git init
git add .
git commit -m "feat: pre-launch landing page with waitlist + Brevo email"
git branch -M main
git remote add origin https://github.com/DevOlabode/voult-landing.git
git push -u origin main
```

---

## License

ISC — same as the main voult.dev repo.

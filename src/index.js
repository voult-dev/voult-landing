require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const ejsMate = require('ejs-mate');

const { connectDB } = require('../config/database');
const legalRoutes = require('../routes/legal');
const landing = require('../content/landing');
const docs = require('./docs');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(
  helmet({
    contentSecurityPolicy: false, // keep simple for CDN bootstrap/fonts
  })
);
app.locals.site = {
  launch: 'early 2027',
  // The playground link stays hidden ("Soon") until its URL is set.
  playgroundUrl: process.env.PLAYGROUND_URL || null,
  githubUrl: 'https://github.com/voult-dev',
  npmUrl: (pkg) => `https://www.npmjs.com/package/${pkg}`,
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Font files never change under the same name, so let browsers keep them.
app.use('/fonts', express.static(path.join(__dirname, '..', 'public', 'fonts'), { maxAge: '1y', immutable: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

const featureRoutes = express.Router();
const features = [
  { key: 'security', file: 'features/security' },
  { key: 'sdk-docs', file: 'features/sdk-docs' },
  { key: 'dx', file: 'features/dx' },
  { key: 'portal', file: 'features/portal' },
  { key: 'oauth', file: 'features/oauth' },
  { key: 'ui-kits', file: 'features/ui-kits' },
];
features.forEach((f) => {
  featureRoutes.get(`/${f.key}`, (req, res) => {
    res.render(f.file, { title: `${f.key} | voult.dev` });
  });
});

app.use('/features', featureRoutes);
// Waitlist is off for now. To bring it back: mount routes/waitlist.js at /api
// and re-add the form (see git history for views/partials/waitlist-form.ejs).
app.use('/', legalRoutes);

// Pages
app.get('/', (req, res) => {
  res.render('home/landing', {
    title: 'Voult | Authentication infrastructure for Node.js developers',
    ...landing,
  });
});

app.get('/about', (req, res) => {
  res.render('home/description', {
    title: 'About | voult.dev',
  });
});

app.get('/docs', (req, res) => res.redirect(`/docs/${docs.pages[0].slug}`));
app.get('/docs/:slug', (req, res, next) => {
  const page = docs.pages.find((p) => p.slug === req.params.slug);
  if (!page) return next();
  res.render('docs/page', { title: `${page.title} | Voult docs`, page, pages: docs.pages });
});

app.get('/teaser', (req, res) => {
  res.render('home/teaser', {
    title: 'voult.dev | Authentication, done properly.',
  });
});

// 404
app.use((req, res) => {
  res.status(404).render('error/404', { title: 'Not Found' });
});

(async () => {
  try {
    await connectDB();
  } catch (err) {
    console.warn('[db] continuing without database:', err.message);
  }
  // Express 5 passes listen errors (e.g. EADDRINUSE) here instead of throwing.
  app.listen(PORT, (err) => {
    if (err) {
      console.error(`[server] cannot listen on port ${PORT}: ${err.code || err.message}`);
      process.exit(1);
    }
    console.log(`[server] voult-landing running → http://localhost:${PORT}`);
  });
})();

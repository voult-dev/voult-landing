require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const ejsMate = require('ejs-mate');

const { connectDB } = require('../config/database');
const waitlistRoutes = require('../routes/waitlist');
const legalRoutes = require('../routes/legal');

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

const featureRoutes = express.Router();
const features = [
  { key: 'security', file: 'features/security' },
  { key: 'sdk-docs', file: 'features/sdk-docs' },
  { key: 'dx', file: 'features/dx' },
  { key: 'portal', file: 'features/portal' },
  { key: 'free', file: 'features/free' },
  { key: 'ui-kits', file: 'features/ui-kits' },
];
features.forEach((f) => {
  featureRoutes.get(`/${f.key}`, (req, res) => {
    res.render(f.file, { title: `${f.key} — voult.dev` });
  });
});

app.use('/features', featureRoutes);
app.use('/api', waitlistRoutes);
app.use('/', legalRoutes);

// Pages
app.get('/', (req, res) => {
  res.render('home/landing', {
    title: 'voult.dev - Authentication, done properly.',
  });
});

app.get('/about', (req, res) => {
  res.render('home/description', {
    title: 'About — voult.dev',
  });
});

app.get('/teaser', (req, res) => {
  res.render('home/teaser', {
    title: 'voult.dev — Authentication, done properly.',
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
  app.listen(PORT, () => {
    console.log(`[server] voult-landing running → http://localhost:${PORT}`);
  });
})();

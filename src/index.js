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

// API
app.use('/api', waitlistRoutes);
app.use('/', legalRoutes);

// Page
app.get('/', (req, res) => {
  const launchDate =
    process.env.LAUNCH_DATE ||
    new Date(Date.now() + 1000 * 60 * 60 * 24 * 150).toISOString();
  res.render('home/landing', {
    title: 'voult.dev — Authentication, done properly.',
    launchDate,
  });
});

app.get('/about', (req, res) => {
  res.render('home/description', { title: 'About voult.dev' });
});

// 404
app.use((req, res) => {
  res.status(404).render('error/404', { title: 'Not Found' });
});

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[server] voult-landing running → http://localhost:${PORT}`);
  });
})();

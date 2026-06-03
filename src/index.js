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
    contentSecurityPolicy: false, 
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
  res.render('home/teaser', {
    title: 'voult.dev — Authentication, done properly.',
  });
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

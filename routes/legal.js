const express = require('express');
const router = express.Router();

router.get('/privacy-policy', (req, res)=>{
    res.render('legal/privacyPolicy', {title : 'Privacy Policy'})
});

router.get('/contact-us', (req, res)=>{
    res.render('legal/contactUs', {title : 'Contact Us'})
})

module.exports = router;
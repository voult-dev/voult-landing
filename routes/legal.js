const express = require('express');
const router = express.Router();

router.get('/privacy-policy', (req, res)=>{
    res.render('legal/privacyPolicy', {title : 'Privacy Policy'})
})

module.exports = router;
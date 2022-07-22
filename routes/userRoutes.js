const express = require('express');
const router = express.Router();
const passport = require('passport');
const errorWrap = require('../errorUtils/errorWrap');
const users = require('../controllers/userControllers');

router.get('/register', users.renderRegisterForm);

router.post('/register', errorWrap(users.register));

router.get('/login', users.renderLoginForm);

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

router.get('/logout', users.logout);


// router.get('/logout', (req, res) => {
//     req.logout();
//     req.flash('success', 'Logged you out!')
//     res.redirect('/stations');
// });

module.exports = router;
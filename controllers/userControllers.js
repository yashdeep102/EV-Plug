const User = require('../models/userModel')

module.exports.renderRegisterForm = (req, res) => {
    res.render('./users/register');
};

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err) { return next(err) }
            req.flash('success', 'Welcome!');
            res.redirect('/stations');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
};

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/stations';
    // console.log(req.session);
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout = function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.flash('success', 'Logged you out!');
        res.redirect('/stations');
    });
};
export const isLogin = (req, res, next) => {
    if (req.session && req.session.user) {
        req.isLoggedIn = true;
        req.user = req.session.user;
    } else {
        req.isLoggedIn = false;
    }
    next();
}

export const restrictSignUpRoute = (req, res, next) => {
    if (req.session && req.isLoggedIn) {
        res.redirect('/');
        return;
    }
    next();
} 
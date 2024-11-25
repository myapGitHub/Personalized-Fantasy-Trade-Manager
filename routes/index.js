import path from 'path';
import * as authMiddleware from '../middlewares/auth.js';
import signupRoutes from './sign-up.js';


export const constructorMethod = (app) => {
    app.use('/sign-up', signupRoutes);
    app.use('/', (req,res) => {
        res.render('pages/home', {loggedIn: req.isLoggedIn, user: req.user});
        //res.render('pages/home', {loggedIn: true, user: req.user});
    });


    app.use('*', (req, res) => {
        res.redirect('/');
    });
};



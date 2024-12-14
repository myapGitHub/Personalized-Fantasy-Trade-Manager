import {Router} from 'express';
const router = Router();
import xss from 'xss';
import { userData } from '../data/index.js';



router.route('/').get(async (req, res) => {
    if (!req.body) return res.status(400).redirect('/dashboard'); 
    // #TODO ROUTE ERROR CHECKING
    let searchTerm = xss(req.query.searchUser);
    let currUserId = xss(req.query.currentUserId);
    console.log(searchTerm);
    console.log(currUserId);

    if (!searchTerm) {
        return res.render('pages/search-user', { error: 'Search term is required.' });
    }

    try {
        const resultArr = await userData.searchUser(currUserId, searchTerm);
        if (resultArr.length === 0) return res.render('pages/search-user', {empty: true, userId: req.session.user.userId});
        res.render('pages/search-user', {userIdArr: resultArr, userId: req.session.user.userId});

    } catch(e) {
        return res.status(400).render('pages/dashboard', {error: e, userId: req.session.user.userId});
    }

});


export default router;

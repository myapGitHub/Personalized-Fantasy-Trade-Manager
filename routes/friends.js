import {Router} from 'express';
import { userData } from '../data/index.js';
const router = Router();


router.route('/').get(async (req, res) => {
    return res.redirect('/friends/friends');
})


router.route('/friends').get(async (req, res) => {
    const currUserId = req.session.user.userId;

    try {
        const friendArr = await userData.getAllFriends(currUserId);
        console.log(friendArr);
        if (friendArr && friendArr.length === 0) {
            return res.render('pages/Friends/friend', {empty: true});
        }else if (friendArr && friendArr.length > 0){
            return res.render('pages/Friends/friend', {empty: false, friendsArr:friendArr });
        }
        res.status(400).render('pages/Friends/friend', {error: 'Something went getting friends'});
    } catch(e) {
        return res.status(400).render('pages/Friends/friend', {error: e});
    }
    res.status(400).render('pages/Friends/friends', {error: 'Something went wrong'});
});
router.route('/inbox').get(async (req, res) => {
    const currUserId = req.session.user.userId;

    try {
        const inboxArr = await userData.getInboxFriends(currUserId);
        console.log(inboxArr);
        if (inboxArr&& inboxArr.length === 0) {
            return res.render('pages/Friends/inbox', {empty: true});
        }else if (inboxArr&& inboxArr.length > 0){
            return res.render('pages/Friends/inbox', {empty: false, inboxArr:inboxArr});
        }
        res.status(400).render('pages/Friends/inbox', {error: 'Something went getting inbox'});
    } catch(e) {
        return res.status(400).render('pages/Friends/inbox', {error: e});
    }
    res.status(400).render('pages/Friends/inbox', {error: 'Something went wrong'});
});




export default router;

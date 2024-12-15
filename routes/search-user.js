import {Router} from 'express';
const router = Router();
import xss from 'xss';
import { userData } from '../data/index.js';
import { searchUser } from '../data/users.js';



router.route('/').get(async (req, res) => {
    if (!req.body) return res.status(400).redirect('/dashboard'); 
    // #TODO ROUTE ERROR CHECKING
    let searchTerm = xss(req.query.searchUser);
    let currUserId = xss(req.query.currentUserId);
    console.log(searchTerm);
    console.log(currUserId);

    if (!searchTerm || !currUserId) {
        return  res.status(400).redirect('/dashboard')
    }

    try {
        const resultArr = await userData.searchUser(currUserId, searchTerm);
        if (resultArr.length === 0) return res.render('pages/search-user', {empty: true, userId: req.session.user.userId});
        res.render('pages/search-user', {userIdArr: resultArr, userId: req.session.user.userId});

    } catch(e) {
        return res.status(400).render('pages/dashboard', {error: e, userId: req.session.user.userId});
    }

});

// router.route('/:userId').get(async (req, res) => {
//     if (!req.body) return res.status(400).redirect('/dashboard'); 
//     // #TODO ROUTE ERROR CHECKING
//     const requestUserId = xss(req.params.userId);
//     const currUser = req.session.user.userId;
//     console.log(currUser);
//     console.log(requestUserId);
//     if (!requestUserId) {
//         return  res.status(400).redirect('/dashboard')
//     }
//     try {
//         const profileStatus = await userData.profilePrivacyStatus(requestUserId);
//         if (!profileStatus) return res.render('pages/Profiles/private', {searchUser: requestUserId});
//         const {userId} = await userData.getUserProfile(requestUserId)
//         const friendStatus = await userData.friendStatus(currUser, requestUserId);
//         if (friendStatus === 'sent') {
//             return res.render('pages/Profiles/public', {userId: requestUserId, requested: true});
//         } else if (friendStatus === 'inbox') {
//             return res.render('pages/Profiles/public', {userId: requestUserId, inbox: true});
//         } else if (friendStatus === 'friend') {
//             return res.render('pages/Profiles/public', {userId: requestUserId, friends: true});
//         } else if (friendStatus === 'send') {
//             return res.render('pages/Profiles/public', {userId: requestUserId, send: true});
//         }
//         return res.status(400).render('pages/Profiles/public', {error: "Error: fetching friend status"});
//     } catch(e) {
//         console.log(e);
//         return res.status(400).render('pages/search-user', {error: e, userId: req.session.user.userId});
//     }

//});


router.route('/:userId').get(async (req, res) => {
    if (!req.body) return res.status(400).redirect('/dashboard'); 

    const requestUserId = xss(req.params.userId); 
    const currUser = req.session.user.userId; 

    console.log(currUser, requestUserId);

    if (!requestUserId) {
        return res.status(400).redirect('/dashboard');
    }

    try {
        // Check if the requested user's profile is private
        const profileStatus = await userData.profilePrivacyStatus(requestUserId);

        // Logic for private profile
        if (!profileStatus) {
            const friendStatus = await userData.friendStatus(currUser, requestUserId);

            if (friendStatus === 'sent') {
                return res.render('pages/Profiles/private', { userId: requestUserId, requested: true });
            } else if (friendStatus === 'inbox') {
                return res.render('pages/Profiles/private', { userId: requestUserId, inbox: true });
                // renders the public page since the users are friends might need to change if we decide
            } else if (friendStatus === 'friend') {
                return res.render('pages/Profiles/public', { userId: requestUserId, friends: true });
            } else if (friendStatus === 'send') {
                return res.render('pages/Profiles/private', { userId: requestUserId, send: true });
            }

            return res.status(400).render('pages/Profiles/private', { error: "Error: fetching friend status" });
        }

        // Logic for public profile
        const { userId } = await userData.getUserProfile(requestUserId);
        const friendStatus = await userData.friendStatus(currUser, requestUserId);

        if (friendStatus === 'sent') {
            return res.render('pages/Profiles/public', { userId: requestUserId, requested: true });
        } else if (friendStatus === 'inbox') {
            return res.render('pages/Profiles/public', { userId: requestUserId, inbox: true });
        } else if (friendStatus === 'friend') {
            return res.render('pages/Profiles/public', { userId: requestUserId, friends: true });
        } else if (friendStatus === 'send') {
            return res.render('pages/Profiles/public', { userId: requestUserId, send: true });
        }

        return res.status(400).render('pages/Profiles/public', { error: "Error: fetching friend status" });

    } catch (e) {
        console.error(e);
        return res.status(400).render('pages/search-user', { error: e.message || e, userId: req.session.user.userId });
    }
});



router.route('/:userId/add-friend').post(async (req, res) => {
    if (!req.body) return res.status(400).redirect('/dashboard'); 

    const sendToo = req.params.userId;
    const currUser = req.session.user.userId;

    if (!sendToo || !currUser) {
        return res.redirect('/dashboard');
    }

    try {
        //const profileStatus = await userData.profilePrivacyStatus(sendToo);
        //if (!profileStatus) return res.render('pages/Profiles/private', {searchUser: sendToo});
        const friendStatus = await userData.friendStatus(currUser, sendToo);
        if (friendStatus !== 'send') throw "Error: Sending Friend Request";

        const result = await userData.sendFriendRequest(currUser, sendToo);
        if (!result || !result.success) throw "Error: DB Friend Function";
        const newUrl = '/search-user/' + sendToo;
        res.redirect(newUrl);
    } catch(e) {
        console.log(e);
        return res.status(400).redirect('/dashboard');
    }

})

router.route('/:userId/accept-request').post(async (req,res) => {
    if (!req.body) return res.status(400).redirect('/dashboard'); 

    const sendToo = req.params.userId;
    const currUser = req.session.user.userId;

    if (!sendToo || !currUser) {
        return res.redirect('/dashboard');
    }

    try {
        const friendStatus = await userData.friendStatus(currUser, sendToo);
        if (friendStatus !== 'inbox') throw "Error: Accepting Friend Request";

        const result = await userData.AcceptOrDeclineFriendRequest(currUser, sendToo, 'accept');
        if (!result || !result.success) throw "Error: DB accept function";
        const newUrl = '/search-user/'+sendToo;
        res.redirect(newUrl);
    } catch(e) {
        console.log(e);
        return res.status(400).redirect('/dashboard');
    }
});
router.route('/:userId/decline-request').post(async (req,res) => {
    if (!req.body) return res.status(400).redirect('/dashboard'); 

    const sendToo = req.params.userId;
    const currUser = req.session.user.userId;

    if (!sendToo || !currUser) {
        return res.redirect('/dashboard');
    }

    try {
        const friendStatus = await userData.friendStatus(currUser, sendToo);
        if (friendStatus !== 'inbox') throw "Error: Accepting Friend Request";

        const result = await userData.AcceptOrDeclineFriendRequest(currUser, sendToo, 'decline');
        if (!result || !result.success) throw "Error: DB accept function";
        const newUrl = '/search-user/'+sendToo;
        res.redirect(newUrl);
    } catch(e) {
        console.log(e);
        return res.status(400).redirect('/dashboard');
    }
});

router.route('/:userId/remove-friend').post(async (req, res) => {
    if (!req.body) return res.status(400).redirect('/dashboard'); 

    const sendToo = req.params.userId;
    const currUser = req.session.user.userId;

    if (!sendToo || !currUser) {
        return res.redirect('/dashboard');
    }

    try {
        const friendStatus = await userData.friendStatus(currUser, sendToo);
        if (friendStatus !== 'friend') throw "Error: Accepting Friend Request";

        const result = await userData.removeFriend(currUser, sendToo);
        if (!result || !result.success) throw "Error: DB accept function";
        const newUrl = '/search-user/'+sendToo;
        res.redirect(newUrl); 

    } catch(e) {
        return res.status(400).redirect('/dashboard');
    }
});


export default router;

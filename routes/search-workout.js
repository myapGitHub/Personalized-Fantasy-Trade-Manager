import {Router} from 'express';
const router = Router();
import xss from 'xss';
import { searchData, userData } from '../data/index.js';

router.route('/:workoutId').get(async (req, res) => {
    if (!req.body) return res.status(400).redirect('/dashboard');
    const workoutId = xss(req.params.workoutId);
    const currUser = xss(req.session.user.userId);

    try {
        const { userId, workoutName, exercises, comments } = await searchData.getWorkoutInfoFromId(workoutId);
        const isWorkoutFavorited = await searchData.isWorkoutIdFavorited(currUser, workoutId);
        const friendStatus = await userData.friendStatus(currUser, userId);
        if (userId === currUser || friendStatus === 'friend') {
            return res.render('pages/Profiles/searchWorkoutPage', {
                userId,
                workoutName,
                exercises,
                comments,
                workoutId,
                isWorkoutFavorited
            });
        } else {
            const status = await userData.profilePrivacyStatus(userId);
            if (!status) {
                return res.render('pages/Profiles/seahcWorkoutPrivate');
            }
            return res.render('pages/Profiles/searchWorkoutPage', {
                userId,
                workoutName,
                exercises,
                comments,
                workoutId,
                isWorkoutFavorited
            });
        }
    } catch (e) {
        console.error(e);
        return res.status(400).redirect('/dashboard');
    }
});

router.route('/favorite').post(async (req, res) => {
    if (!req.body) return res.status(400).redirect('/dashboard');
    const workoutId = xss(req.body.data)
    if (!workoutId) return res.status(400).json({error: ""});

    try {
        const currUserId = req.session.user.userId;
        const result = await searchData.updateFavorite(currUserId, workoutId);
        console.log(result);
        return res.json(result);
    } catch(e) {
        console.log(e);
        return res.status(400).redirect('/dashboard');
    }
});


export default router;

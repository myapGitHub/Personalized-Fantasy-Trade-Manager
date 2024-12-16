// import {Router} from 'express';
// const router = Router();
// import xss from 'xss';
// import { searchData, userData } from '../data/index.js';

// router.route('/:workoutId').get(async (req, res) => {
//     if (!req.body) return res.status(400).redirect('/dashboard');
//     const workoutId = req.params.workoutId;
//     const currUser = req.session.user.userId;

//     try {
        
//         const {userId, workoutName, exercises, comments} = await searchData.getWorkoutInfoFromId(workoutId, currUserId);
//         if (userId === currUser) {
//             res.render('pages/Profiles/searchWorkoutPage', {
//                 userId: userId,
//                 workoutName: workoutName,
//                 exercises: exercises,
//                 comments: comments
//             })
//         }
//         return res.status(400).redirect('/dashboard');
//     } catch(e) {
//         return res.status(400).redirect('/dashboard');
//     }
// });


// export default router;

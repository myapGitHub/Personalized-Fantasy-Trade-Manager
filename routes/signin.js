import {Router} from 'express';
const router = Router();
import { userData } from '../data/index.js';
import xss from 'xss';



// Routes
router
    .route('/')
    .get(async (req, res) => {
        res.render('pages/Login-Signup/signin')
    })
    .post(async (req, res) => {
        const userIdSend = xss(req.body.userId);
        const passwordSend = xss(req.body.password);

        // checks login
        try {
            const {_id, userId, firstName, lastName, height, weight, age, gender, benchMax, squatMax, deadLiftMax, level, isPublic} = await userData.userLogin(userIdSend, passwordSend);
            req.session.user = {
                _id: _id,
                userId: userId,
                firstName: firstName,
                lastName: lastName,
                height: height,
                weight: weight,
                age: age,
                benchMax: benchMax,
                squatMax: squatMax,
                deadLiftMax: deadLiftMax,
                level: level,
                isPublic: isPublic
            };

            res.redirect('/dashboard');
        } catch(e) {
            return res.status(400).render('pages/Login-Signup/signin', {error: "Either the userId or password is invalid"});
        }
    });


export default router;



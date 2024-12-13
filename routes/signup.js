import {Router} from 'express';
const router = Router();
import { userData } from '../data/index.js';
import xss from 'xss';


// Routes for signup
router
    .route('/')
    .get(async (req, res) => {
        res.render('pages/Login-Signup/signup');
    })
    .post(async (req, res) => {
        // #TODO adding the error checking
        
        // cleanses the input useing xss
        const userId = xss(req.body.userId); 
        const password = xss(req.body.password);
        const firstName = xss(req.body.firstName);
        const lastName = xss(req.body.lastName);
        const height = xss(req.body.height);
        const weight = xss(req.body.weight);
        const age = xss(req.body.age);
        const gender = xss(req.body.gender);
        const level = xss(req.body.level);
        const benchMax = xss(req.body.benchMax);
        const squatMax = xss(req.body.squatMax);
        const deadLiftMax = xss(req.body.deadLiftMax);

        let success;
        try {
            success = await userData.signUp(
                userId,
                password,
                firstName,
                lastName,
                height,
                weight,
                age,
                gender,
                benchMax,
                squatMax,
                deadLiftMax,
                level
            );
        } catch(e) {
            return res.status(400).render('pages/Login-Signup/signup', {error: e,
                firstName: firstName,
                lastName: lastName,
                userId: userId,
                height: height,
                weight: weight,
                age: age,
                benchMax: benchMax,
                squatMax: squatMax,
                deadLiftMax: deadLiftMax

            });
        }

        if (!success.registrationCompleted) {
            return res.status(500).json({error: 'Internal Server Error'});
        }

        res.render('pages/Login-Signup/signup-confirmation')
    });

export default router;



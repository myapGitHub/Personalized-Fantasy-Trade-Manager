import {Router} from 'express';
import { workoutData } from '../data/index.js';
const router = Router();

// new Changes
import path from 'path';
import {static as staticDir} from 'express';



router.route('/').get(async (req, res) => {
    return res.json({error: "YOU SHOUD NOT BE HERE"});
})

router.route('/home').get(async (req, res) => {
    //res.render('pages/home');
    res.sendFile(path.resolve('static/homePage.html'));
    
})

router.route('/dashboard').get(async (req, res) => {
    if (!req.session.user) {
        return res.status(400).json({error: "Error: User session does not exsist"});
    }
    const userId = req.session.user.userId;
    const streakData = await workoutData.getUserStreak(userId);
    res.render('pages/dashboard', {
        userId: userId,
        streakCount: streakData.streakCount
    })
})

router.route('/signout').get(async (req, res) => {
    req.session.destroy();
    res.render('pages/Login-Signup/signout');
})

export default router




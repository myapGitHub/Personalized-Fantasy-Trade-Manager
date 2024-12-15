import {Router} from 'express';
const router = Router();
import { userData } from '../data/index.js';
import xss from 'xss';



router.route('/').get(async (req, res) => {
    //return res.json({error: "YOU SHOUD NOT BE HERE"});
    return res.redirect('/settings/account');
})

router.route('/account').get(async (req, res) => {
    res.render('pages/Settings/account', {
        userId: req.session.user.userId,
        maxBench: req.session.user.benchMax,
        maxSquat: req.session.user.squatMax,
        maxDeadLift: req.session.user.deadLiftMax,
        isPublic: req.session.user.isPublic
    })
})

router.route('/account').post(async (req, res) => {
    console.log('Request received at /settings/account');
    console.log('Request body:', req.body);

    const type = req.body.type;
    const updateField = xss(req.body.data);

    if (!type || !updateField) {
        return res.status(400).json({ error: "Type and data are required" });
    }
    try {
        // to change userId
        if (type === 'userId') {
            const id = req.session.user._id;
            const result = await userData.updateUserId(id,updateField);
            req.session.user.userId = updateField.toLowerCase();
            return res.json(result);
        // for the change profile status
        } else if (type === 'status') {
            const id= req.session.user._id;
            const {newStatus, completed}= await userData.updateProfileStatus(id, updateField);
            req.session.user.isPublic = newStatus; 
            const result = {newStatus: newStatus, completed: completed};
            return res.json(result);
        } else {
            return res.status(400).json({ error: "Invalid Type" });
        }
    } catch (e) {
        console.error('Error processing request:', e);
        return res.status(500).json({ error: e.toString() });
    }
});

router.route('/delete').get(async (req, res) => {
    res.render('pages/Settings/delete')
})
router.route('/delete').post(async (req, res) => {
    let succes;
    try {
        succes = await userData.deleteAccount(req.session.user.userId);
    } catch(e) {
        res.status(400).render('pages/Settings/delete', {error: "Failed to delete account"});
    }

    if (!succes.deletionCompleted) {
        return res.status(500).json({error: 'Internal Server Error'});
    }
    req.session.destroy(); 
    res.redirect('/home');
})

export default router;


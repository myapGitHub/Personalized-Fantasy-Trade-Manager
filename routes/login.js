import { Router } from "express"; 
const router = Router();
import { userData } from '../data/index.js';


router.get('/', (req, res) => {
    res.render('pages/login');
});

router.post('/', async (req, res) => {
    const loginData = req.body;
    if (!loginData || Object.keys(loginData).length === 0) {
        return res.status(400).json({error: "There is no requrest body"});
    }
    const user = loginData.loginUser;
    const password = loginData.loginPassword;

    
    let id;
    try {
        id = await userData.userLogin(user, password);
    } catch(e) {
        return res.render('pages/login', {error: e});
    }

    req.session.user = {userId: id}
    res.redirect('/private');
});


export default router;

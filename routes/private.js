import {Router} from 'express';
const router = Router();

router.get('/', (req, res)=> {
    res.render('pages/dashboard', {loggedIn: true})
})


export default router;
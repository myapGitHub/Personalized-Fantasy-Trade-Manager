import path from 'path';
import { Router } from "express"; 
const router = Router();
import { userData } from '../data/index.js';



router.get('/', (req, res)=> {
    res.sendFile(path.resolve('static/sign-up/page1.html'));
});

router.post('/', async (req,res) => {
    const signUpData = req.body;
    if (!signUpData || Object.keys(signUpData).length === 0) {
        return res.status(400).json({error: "There is no fields in the request body"});
    }

    const userName = signUpData.newUserName;
    const email = signUpData.newEmail
    const password = signUpData.newPassword;
    const firstName = signUpData.firstName;
    const lastName = signUpData.lastName;
    const height = signUpData.height;
    const weight = signUpData.weight;
    const age = signUpData.age;
    const gender = signUpData.gender;
    const benchMax = signUpData.benchMax;
    const squatMax = signUpData.squatMax;
    const deadLiftMax = signUpData.deadLiftMax;
    const level = signUpData['training-experience'];


    try {
         await userData.createUser(
            userName,
            email,
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
        //TODO NEED TO SEND BACK DATA SO FORM DOESNT RESET 
        return res.status(404).json({error: "Error Sign-up"});
    }
    return res.json({Success: "Signed-up"});
});

export default router;


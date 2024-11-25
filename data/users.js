import { users } from "../config/mongoCollections.js"; 
import bcrypt from 'bcrypt';

// checks username to make sure it is string, not empty, and unique in the database
const checkUserNameSignUp = async (userName) => {
    if (!userName) throw "No username provided";
    if (typeof userName !== 'string') throw "Not valid username";

    userName = userName.trim().toLowerCase();
    if (userName.length === 0) throw "Not valid username";

    const userCollection = await users();
    const user = await userCollection.findOne({ userName: userName }); // Fixed missing `await`

    if (user) throw "A user with that username already exists";

    return userName;
}

// checks to make sure the email has correct structure and is unique
const checkEmailSignUp = async (email) => {
    if (!email) throw "No email provided";
    if (typeof email !== 'string') throw "Not valid email";
    email = email.trim().toLowerCase();
    if (email.length === 0 || email.includes(' ')) throw "Not valid email";

    const splitOne = email.split('@');
    if (splitOne.length !== 2) throw "Not valid email";

    const username = splitOne[0];
    const domain = splitOne[1];

    if (username.length === 0) throw "Not valid email";

    const splitPeriod = domain.split('.');
    if (splitPeriod.length < 2) throw "Not valid email";

    for (const part of splitPeriod) {
        if (part.length === 0) throw "Not valid email";
    }

    const userCollection = await users();
    const user = await userCollection.findOne({ email: email }); // Fixed missing `await`

    if (user) throw "A user with that email exists";

    return email;
};

// checks the password to ensure it is a string and at least 8 characters, then hashes it
const checkPasswordAndHash = async (password) => {
    if (!password) throw "No password provided";
    if (typeof password !== 'string') throw "Password must be a string";
    if (password.trim().length < 8) throw "Password must be at least 8 characters";

    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
}

// checks to ensure input is a string and not empty
const checkStr = (str) => {
    if (!str) throw "No string provided";
    if (typeof str !== 'string' || str.trim().length === 0) throw "String cannot be empty";

    return str.trim();
}

// checks to ensure the input is a number
const checkNum = (num) => {
    if (num === undefined || num === null) throw "No number provided"; // Fixed to handle `null` or `undefined`
    if (typeof num !== 'number') throw "Not a valid number";
    if (isNaN(num)) throw "Not a valid number"; // Fixed logic
}

// checks gender to ensure it matches 'male', 'female', or 'other'
const checkGender = (gender) => {
    if (!gender) throw "No gender provided";
    if (typeof gender !== 'string' || gender.trim().length === 0) throw "Invalid gender type";
    gender = gender.trim();
    if (gender !== 'male' && gender !== 'female' && gender !== 'other') throw "Invalid gender option";

    return gender;
}

// checks experience level to ensure it matches 'beginner', 'intermediate', or 'advanced'
const checkExperience = (experience) => {
    if (!experience) throw "No experience provided"; // Fixed variable name
    if (typeof experience !== 'string' || experience.trim().length === 0) throw "Invalid experience type";
    experience = experience.trim();
    if (experience !== 'beginner' && experience !== 'intermediate' && experience !== 'advanced') throw "Invalid experience level";

    return experience;
}

// calculates estimated max lifts based on user data
const calculateMaxes = ({ experience, age, weight, height, gender }) => {
    const experienceMultipliers = {
        beginner: { bench: 0.6, squat: 1.0, deadlift: 1.2 },
        intermediate: { bench: 1.0, squat: 1.5, deadlift: 1.8 },
        advanced: { bench: 1.5, squat: 2.0, deadlift: 2.5 },
    };

    const genderMultipliers = {
        male: 1.0,
        female: 0.7,
        other: 0.85,
    };

    const ageAdjustment = (age) => {
        if (age < 18) return 0.8;
        if (age <= 35) return 1.0;
        if (age <= 50) return 0.9;
        return 0.8;
    };

    const multipliers = experienceMultipliers[experience];
    const genderMultiplier = genderMultipliers[gender];
    const ageMultiplier = ageAdjustment(age);

    const benchMax = weight * multipliers.bench * genderMultiplier * ageMultiplier;
    const squatMax = weight * multipliers.squat * genderMultiplier * ageMultiplier;
    const deadliftMax = weight * multipliers.deadlift * genderMultiplier * ageMultiplier;

    return {
        benchMax: Math.round(benchMax),
        squatMax: Math.round(squatMax),
        deadliftMax: Math.round(deadliftMax),
    };
};

// creates a new user
export const createUser = async (userName, email, password, firstName, lastName, height, weight, age, gender, benchMax, squatMax, deadLiftMax, level) => {
    userName = await checkUserNameSignUp(userName);
    email = await checkEmailSignUp(email);
    password = await checkPasswordAndHash(password);

    firstName = checkStr(firstName);
    lastName = checkStr(lastName);
    level = checkExperience(level);

    height = parseInt(height);
    weight = parseInt(weight);
    age = parseInt(age);

    checkNum(height);
    checkNum(weight);
    checkNum(age);

    gender = checkGender(gender);

    const { benchMax: estBenchMax, squatMax: estSquatMax, deadliftMax: estDeadLiftMax } = calculateMaxes({
        experience: level,
        age: age,
        weight: weight,
        height: height,
        gender: gender,
    });

    if (!benchMax) benchMax = estBenchMax;
    else checkNum(parseInt(benchMax));

    if (!squatMax) squatMax = estSquatMax;
    else checkNum(parseInt(squatMax));

    if (!deadLiftMax) deadLiftMax = estDeadLiftMax;
    else checkNum(parseInt(deadLiftMax));

    const newUser = {
        userName: userName,
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        height: height,
        weight: weight,
        age: age,
        gender: gender,
        benchMax: benchMax,
        squatMax: squatMax,
        deadLiftMax: deadLiftMax,
        experience: level,
    };

    const userCollection = await users();
    const newInsertUser = await userCollection.insertOne(newUser); // Fixed missing `await`
    if (!newInsertUser.insertedId) throw "Insert Failed";

};

import { ObjectId } from "mongodb";
import { users, workouts } from "../config/mongoCollections.js"; 
import bcrypt from 'bcrypt';



export const checkUserId = (userId) => {
    if (userId === undefined || userId === null) throw "userId is not supplied";
    if (typeof userId !== 'string' || userId.trim().length === 0) throw "userId not string or empty string";

    userId = userId.trim();
    if (userId.length < 5 || userId.length > 10) throw "user id has to be 2 >= or 10 <= in length"; 

    for (const char of userId) {
        if (!isNaN(char) && char !== ' ') {
            throw "userid contains number";
        }
    }
    return userId;
}
const checkPassword = async (password) => {
    if (password === undefined || password === null) throw "password is not supplied";
    if (typeof password !== 'string' || password.trim().length === 0) throw "passord is not string or emtpy";

    // NO TRIMING PASSWORD
    //password = password.trim();

    //password constraints
    let capitalLetter= false;
    let specialChar= false;
    let number= false;

    
    // object of special chars
    const specialChars = {
        "!": true, "@": true, "#": true, "$": true, "%": true, "^": true, "&": true,
        "*": true, "(": true, ")": true, "_": true, "+": true, "-": true, "=": true,
        "[": true, "]": true, "{": true, "}": true, "|": true, ";": true, ":": true,
        "'": true, ",": true, ".": true, "<": true, ">": true, "/": true, "?": true,
        "`": true, "~": true, "\"": true
    };

    if (password.length < 8) throw "password not long enough";
    for (const char of password) {
        if (char === ' ') throw "password has space";
        if (!isNaN(char)) number= true; 
        if (char <= 'Z' && char >='A') capitalLetter= true
        if (char in specialChars) specialChar = true;
    }

    if (!number || !capitalLetter || !specialChar) throw "password doesnt contain Captial Letter, Number or special character";

    const hash = await bcrypt.hash(password, 10);
    return hash;
}
const checkFirstOrLastName= (name) => {
    if (name === undefined || name === null) throw "first or last name not provided";
    if (typeof name !== 'string' || name.trim().length === 0) throw "first name or last name is not string or empty";
    name = name.trim();
    if (name.length < 2 || name.length > 25) throw "at least 2 characters long with a max of 25 characters.";

    for (const char of name) {
        if (!isNaN(char) && char !== ' ') {
            throw "last or first name cotains number";
        }
    }

    return name;
};


// checks to ensure the input is a number
const checkNum = (num) => {
    if (num === undefined || num === null) throw "No number provided"; // Fixed to handle `null` or `undefined`
    if (typeof num !== 'number') throw "Not a valid number";
    if (isNaN(num)) throw "Not a valid number"; // Fixed logic

    return num;
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
    console.log(experience);
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

export const signUp = async (
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
) => {
    // checsk to make sure the userId is valid
    userId = checkUserId(userId);
    // checks to make sure that the userId is not in db
    const userCollection = await users();
    let user = await userCollection.findOne({userId: userId.toLowerCase()});
    if (user) throw "User exists with that userId";
    // checks the password must cotain capital, specialchar
    password = await checkPassword(password);
    //checks the firstName and last
    firstName = checkFirstOrLastName(firstName); 
    lastName = checkFirstOrLastName(lastName);
    // checks the height
    height = checkNum(parseInt(height));
    // checks weight #TODO maybe add requirments
    weight = checkNum(parseInt(weight));
    // checks age #TODO maybe add requirments
    age = checkNum(parseInt(age));
    // checks the gender
    gender = checkGender(gender);
    // checks experience
    level = checkExperience(level);    
    const { benchMax: estBenchMax, squatMax: estSquatMax, deadliftMax: estDeadLiftMax } = calculateMaxes({
        experience: level,
        age: age,
        weight: weight,
        height: height,
        gender: gender,
    });
    // if no bechMax is supplied use the calc
    if (!benchMax) benchMax = estBenchMax;
    else checkNum(parseInt(benchMax));
    // if no squatMax is supplied use the calc
    if (!squatMax) squatMax = estSquatMax;
    else checkNum(parseInt(squatMax));
    // if no deadLiftMax is supplied use the calc
    if (!deadLiftMax) deadLiftMax = estDeadLiftMax;
    else checkNum(parseInt(deadLiftMax));
    // creates a new user obj to insert
    const newUser = {
        userId: userId.toLowerCase(),
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
        isPublic: true,
        friendRequest:  {},
        friendInbox:  {},
        friends: {},
        pastWorkouts: [],
        savedWorkouts: [],
    };
    // inserts the new user
    const newInsertUser = await userCollection.insertOne(newUser); 
    if (!newInsertUser.insertedId) throw "Insert Failed";

    return {registrationCompleted: true};
}

export const checkPasswordSignIn = (password) => {
    if (password === undefined || password === null) throw "password is not supplied";
    if (typeof password !== 'string' || password.trim().length === 0) throw "passord is not string or emtpy";

    // Trims PASSOWORD
    //password = password.trim();

    //password constraints
    let capitalLetter= false;
    let specialChar= false;
    let number= false;

    
    // object of special chars
    const specialChars = {
        "!": true, "@": true, "#": true, "$": true, "%": true, "^": true, "&": true,"*": true, "(": true, ")": true, "_": true, "+": true, "-": true, "=": true,
        "[": true, "]": true, "{": true, "}": true, "|": true, ";": true, ":": true,"'": true, ",": true, ".": true, "<": true, ">": true, "/": true, "?": true,"`": true, "~": true, "\"": true
    };

    if (password.length < 8) throw "password not long enough";
    for (const char of password) {
        if (char === ' ') throw "password has space :" + password;
        if (!isNaN(char)) number= true; 
        if (char <= 'Z' && char >='A') capitalLetter= true
        if (char in specialChars) specialChar = true;
    }

    if (!number || !capitalLetter || !specialChar) throw "password doesnt contain Captial Letter, Number or special character";

    
}
export const userLogin = async (userIdParam, password) => {
    // checks the userId valid
    userIdParam = checkUserId(userIdParam);
    // checks the password to be valid
   checkPasswordSignIn(password);

   const userCollection = await users();
   const validUserIdFinder = await userCollection.findOne({userId: userIdParam.toLowerCase()});
   
   // if there is no user with that id 
   if (!validUserIdFinder) throw "Either UserId or Password is Invalid";

   // gets the hashed password from the object 
   const foundHashedPassword = validUserIdFinder['password'];
   // compares the provided password and the one in the object
   const compareToSherlock = await bcrypt.compare(password, foundHashedPassword);
   if (!compareToSherlock) throw "Either the userId or password is invalid";

   const {_id, userId, firstName, lastName, height, weight, age, gender, benchMax, squatMax, deadLiftMax, level, isPublic, pastWorkouts, savedWorkouts} =  validUserIdFinder;
   // need to figure out what to return
   return {_id, userId, firstName, lastName, height, weight, age, gender, benchMax, squatMax, deadLiftMax, level, isPublic, pastWorkouts, savedWorkouts};

};



export const deleteAccount = async (userId) => {
    userId = checkUserId(userId);
    // deletes the user from user collection
    const userCollection = await users();
    const deleteProfile = await userCollection.deleteOne({userId: userId.toLowerCase()});
    if (deleteProfile.delettedCount === 0) {
        throw "No user found to delete";
    }
    // deletes all the user workout from collection
    const workoutCollection = await workouts();
    const deleteWorkouts = await workoutCollection.deleteMany({userId: userId.toLowerCase()});

    // returns confirmation that
    return {deletionCompleted: true}
}


export const updateUserId = async (id,updateUserId) => {
    id = checkId(id);
    updateUserId = checkUserId(updateUserId);
    
    // checks if a user with that id already exists 
    const userCollection = await users();
    const userExists = await userCollection.findOne({userId: updateUserId.toLowerCase()});

    if (userExists) throw "A user with that id exists";

    // checks if id in the db
    const userIdExists = await userCollection.findOne({_id: new ObjectId(id)});
    if (!userIdExists) throw 'A user with that id doesnt exist';

    const update = await userCollection.updateOne(
        {_id: new ObjectId(id)},
        {$set: {userId: updateUserId.toLowerCase()}}
    );

    return {changeSuccess: true};
}

const checkCurrStatus = (status) => {
    if (!status) throw "Must provide status";
    if (typeof status !== 'string' || status.trim().length === 0) throw "Status must be a string and not empty";
    if (status !== 'public' && status !== 'private') throw "Status must be 'public' or 'private'"

    return status;
}

const checkId = (id) => {
    if (!id) throw "ID must be supplied";
    if (typeof id !== 'string') throw "Id must be a string";
    if (id.trim().length === 0) throw "id cannot be empty"
    id = id.trim();

    if (!ObjectId.isValid(id)) throw 'invalid object id';

    return id

}

export const updateProfileStatus = async (id, currStatus) => {
    id = checkId(id);
    currStatus = checkCurrStatus(currStatus);

    const userCollection = await users();

    // checks to make sure the userId is valid in db
    const userExists = await userCollection.findOne({_id: new ObjectId(id)});
    if (!userExists) throw "A user with that id doesnt exists";

    let newStatus;
    if (currStatus === 'public') {
        newStatus = false;
    } else if (currStatus === 'private') {
        newStatus = true;
    } else {
        throw "Curr status must be 'private' or 'public'";
    }

    const update = await userCollection.updateOne(
        {_id: new ObjectId(id)},
        {$set: {isPublic: newStatus}}
    );

    return {newStatus, completed: true} 
}


export const searchUser = async (currUserId, searchUserId) => {
    // Validate inputs
    searchUserId = checkUserId(searchUserId);
    currUserId = checkUserId(currUserId);

    if (searchUserId.toLowerCase() === currUserId.toLowerCase()) {
        throw 'Cannot search for yourself';
    }
    const userCollection = await users();
    let foundSearchUserIdArr = [];
    // Find the exact match
    // add let exactMatchUser = await userCollection.findOne({ userId: searchUserId.toLowerCase(), isPublic: true }); if you want to only search private
    let exactMatchUser = await userCollection.findOne({ userId: searchUserId.toLowerCase()});
    if (exactMatchUser) {
        foundSearchUserIdArr.push(exactMatchUser.userId);
    }
    // .find({ userId: { $regex: searchUserId, $options: 'i' },isPublic: true }) if you only want to search private
    let similarMatches = await userCollection
        .find({ userId: { $regex: searchUserId, $options: 'i' }}) 
        .toArray();

    // Add similar matches to the array, avoiding duplicates
    for (let similar of similarMatches) {
        let { userId } = similar;
        if (
            userId.toLowerCase() !== currUserId.toLowerCase() && 
            !foundSearchUserIdArr.includes(userId) 
        ) {
            foundSearchUserIdArr.push(userId);
        }
    }

    return foundSearchUserIdArr;
};

// checks the privacy of the userProfile
export const profilePrivacyStatus = async (userId) => {
    // Error checking
    userId = checkUserId(userId);
    const userCollection = await users();
    const findUser = await userCollection.findOne({userId: userId.toLowerCase()});
    if (!findUser) throw "No user with the id exist";

    if (findUser.isPublic) return true;
    return false;
}

export const getUserProfile = async (requstUserId) => {
    // Error checking
    requstUserId = checkUserId(requstUserId);
    const userCollection = await users();
    const findUser = await userCollection.findOne({userId: requstUserId.toLowerCase()});
    if (!findUser) throw "No user with that id exist";

    // Can return more like workouts such whoever is doing that 
    const {userId} = findUser;
    return {userId};
}

const isUserIdInCollection = async (userId) => {
    const userCollection = await users();
    const findUser = await userCollection.findOne({userId: userId.toLowerCase()});
    if (!findUser) throw "No user with the id exists";

    
} 


// Options friend, already requested, nothing, pending
// friend = remove
// already requested = button that just says request
// nothing = add friend
// pending  = accept button
export const friendStatus = async (currUserId, requestUserId) => {
    // Error 
    currUserId = checkUserId(currUserId);
    requestUserId = checkUserId(requestUserId);

    await isUserIdInCollection(currUserId);
    await isUserIdInCollection(requestUserId);

    const userCollection = await users();
    const foundUser = await userCollection.findOne({userId: currUserId.toLowerCase()});
    if (!foundUser) throw "No user with the id exists";

    const {friendRequest, friendInbox, friends} = foundUser;

    if (requestUserId in friendRequest) {
        return 'sent';

    } else if (requestUserId in friendInbox) {
        return 'inbox';

    } else if (requestUserId in friends) {
        return 'friend';
    } else {
        return 'send';
    }
};


export const sendFriendRequest = async (currUserId, requestUserId) => {
    currUserId = checkUserId(currUserId);
    requestUserId = checkUserId(requestUserId);

    await isUserIdInCollection(currUserId);
    await isUserIdInCollection(requestUserId);

    const userCollection = await users();

    const currUser = await userCollection.findOne({ userId: currUserId.toLowerCase() });
    const requestedUser = await userCollection.findOne({ userId: requestUserId.toLowerCase() });

    if (!currUser || !requestedUser) throw "No user with the specified ID exists";

    // Add the friend request
    const updatedFriendRequest = { ...currUser.friendRequest, [requestUserId]: true };
    const updatedFriendInbox = { ...requestedUser.friendInbox, [currUserId]: true };

    // Update the database
    await userCollection.updateOne(
        { userId: currUserId.toLowerCase() },
        { $set: { friendRequest: updatedFriendRequest } }
    );

    await userCollection.updateOne(
        { userId: requestUserId.toLowerCase() },
        { $set: { friendInbox: updatedFriendInbox } }
    );

    return { success: true };
};


const checkAction = (action) => {
    if (!action) throw "Has to be accept or decline";
    if (typeof action !== 'string' || action.trim().length === 0) throw "has to be accept or decline";
    action = action.trim();
    if (action !== 'accept' && action !== 'decline') throw "Has to be accept or decline";
    return action;
}

export const AcceptOrDeclineFriendRequest = async (currUserId, requestUserId, action) => {
    currUserId = checkUserId(currUserId);
    requestUserId = checkUserId(requestUserId);
    action = checkAction(action);

    await isUserIdInCollection(currUserId);
    await isUserIdInCollection(requestUserId);

    const userCollection = await users();

    const currUser = await userCollection.findOne({ userId: currUserId.toLowerCase() });
    const requestedUser = await userCollection.findOne({ userId: requestUserId.toLowerCase() });

    if (!currUser || !requestedUser) throw "No user with the specified ID exists";

    if (action === 'accept') {
        if (currUser.friendInbox && currUser.friendInbox[requestUserId]) {
            delete currUser.friendInbox[requestUserId]; 
        }
        currUser.friends[requestUserId] = true; 

        if (requestedUser.friendRequest && requestedUser.friendRequest[currUserId]) {
            delete requestedUser.friendRequest[currUserId]; 
        }
        requestedUser.friends[currUserId] = true; 
    } else {
        if (currUser.friendInbox && currUser.friendInbox[requestUserId]) {
            delete currUser.friendInbox[requestUserId]; 
        }

        if (requestedUser.friendRequest && requestedUser.friendRequest[currUserId]) {
            delete requestedUser.friendRequest[currUserId]; 
        }
    }
    await userCollection.updateOne(
        { userId: currUserId.toLowerCase() },
        { $set: { friendInbox: currUser.friendInbox, friends: currUser.friends } }
    );

    await userCollection.updateOne(
        { userId: requestUserId.toLowerCase() },
        { $set: { friendRequest: requestedUser.friendRequest, friends: requestedUser.friends } }
    );

    return { success: true };
};

export const removeFriend = async (currUserId, requestUserId) => {
    currUserId = checkUserId(currUserId);
    requestUserId = checkUserId(requestUserId);

    await isUserIdInCollection(currUserId);
    await isUserIdInCollection(requestUserId);

    const userCollection = await users();

    const currUser = await userCollection.findOne({ userId: currUserId.toLowerCase() });
    const requestedUser = await userCollection.findOne({ userId: requestUserId.toLowerCase() });

    if (!currUser || !requestedUser) throw "No user with the specified ID exists";

    if (currUser.friends && currUser.friends[requestUserId]) {
        delete currUser.friends[requestUserId]; 
    }
    if (requestedUser.friends && requestedUser.friends[currUserId]) {
        delete requestedUser.friends[currUserId]; 
    }

    await userCollection.updateOne(
        { userId: currUserId.toLowerCase() },
        { $set: { friends: currUser.friends } }
    );

    await userCollection.updateOne(
        { userId: requestUserId.toLowerCase() },
        { $set: { friends: requestedUser.friends } }
    );

    return { success: true };
};


// import { ObjectId } from "mongodb";
// import { users, workouts } from "../config/mongoCollections.js"; 
// import { userData } from "./index.js";


// const checkWorkoutId = (id) => {
//     if (!id) throw "Must supply workout id";
//     if (typeof id !== 'string' || id.trim().length === 0) throw "id must be a string and not empty";
//     id = id.trim();
//     if (!ObjectId.isValid(id))"Must be valid objec id";

//     return id;
// }

// export const getWorkoutInfoFromId = async (workoutId) => {
//     workoutId = checkWorkoutId(workoutId);

//     const workoutCollection = await workouts();
//     const userCollection = await users();

//     const foundWorkout = await workoutCollection.findOne({_id: new ObjectId(workoutId)});
//     if (!foundWorkout) throw "Workoutid is invalid";

//     const {userId, workoutName, exercises, comments} = foundWorkout;

//     const foundUser = await userCollection.findOne({userId: userId.toLowerCase()});
//     if (!foundUserb) throw "ERROR USER NOT REGISTERED"

//     const {isPublic} = foundUser;
//     if (!isPublic) throw "User Profile is not Public";

//     return {userId, workoutName, exercises, comments};
// }


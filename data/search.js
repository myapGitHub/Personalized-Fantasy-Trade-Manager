import { ObjectId } from "mongodb";
import { users, workouts } from "../config/mongoCollections.js"; 
import { userData } from "./index.js";


export const checkWorkoutId = (id) => {
    if (!id) throw "Must supply workout id";
    if (typeof id !== 'string' || id.trim().length === 0) throw "id must be a string and not empty";
    id = id.trim();
    if (!ObjectId.isValid(id))"Must be valid objec id";

    return id;
}

export const getWorkoutInfoFromId = async (workoutId) => {
    workoutId = checkWorkoutId(workoutId);

    const workoutCollection = await workouts();
    const userCollection = await users();

    const foundWorkout = await workoutCollection.findOne({_id: new ObjectId(workoutId)});
    if (!foundWorkout) throw "Workoutid is invalid";

    const {userId, workoutName, exercises, comments} = foundWorkout;

    const foundUser = await userCollection.findOne({userId: userId.toLowerCase()});
    if (!foundUser) throw "ERROR USER NOT REGISTERED"

    // const {isPublic} = foundUser;
    // if (!isPublic) throw "User Profile is not Public";

    return {userId, workoutName, exercises, comments};
}

export const isWorkoutIdFavorited = async (currUserId, currWorkoutId) => {
    currUserId = userData.checkUserId(currUserId);
    currWorkoutId =  checkWorkoutId(currWorkoutId);

    const workoutCollection = await workouts();
    const userCollection = await users();
        
    const foundUser = await userCollection.findOne({userId: currUserId.toLowerCase()});
    if (!foundUser) throw "ERROR USER NOT REGISTERED"
    const {favoriteWorkout} = foundUser;

    const foundWorkout = await workoutCollection.findOne({_id: new ObjectId(currWorkoutId)});
    if (!foundWorkout) throw "Workoutid is invalid";

    for (const workoutId of favoriteWorkout) {
        if (currWorkoutId === workoutId) return true;
    }
    return false;
}
export const updateFavorite = async (currUserId, currWorkoutId) => {
    currUserId = userData.checkUserId(currUserId);
    currWorkoutId = checkWorkoutId(currWorkoutId);

    const workoutCollection = await workouts();
    const userCollection = await users();

    const foundUser = await userCollection.findOne({ userId: currUserId.toLowerCase() });
    if (!foundUser) throw "ERROR: User not registered";

    const foundWorkout = await workoutCollection.findOne({ _id: new ObjectId(currWorkoutId) });
    if (!foundWorkout) throw "ERROR: Workout ID is invalid";

    const isFavorite = foundUser.favoriteWorkout?.includes(currWorkoutId);

    if (isFavorite) {
        await userCollection.updateOne(
            { userId: currUserId.toLowerCase() },
            { $pull: { favoriteWorkout: currWorkoutId } } 
        );
        return { success: true, favorite: false }; 
    } else {
        await userCollection.updateOne(
            { userId: currUserId.toLowerCase() },
            { $addToSet: { favoriteWorkout: currWorkoutId } }
        );
        return { success: true, favorite: true }; 
    }
};


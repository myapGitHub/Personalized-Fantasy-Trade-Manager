// This data file should export all functions using the ES6 standard as shown in the lecture code
import axios from "axios";
import { workouts } from "../config/mongoCollections.js";
import { users } from "../config/mongoCollections.js"; // for creating workout plan, need user details
import { ObjectId } from "mongodb";
import validateDate from "validate-date";
import { getUserProfile, profilePrivacyStatus } from "./users.js";
import { userData } from "./index.js";

const workoutCollection = await workouts();


//Creates a workout with workoutType, userId (who created the workout), and exercises, and a description of the workout
/* Old workout system */
const createWorkout = async (workoutType, userId, exercises, description) => {
  //Check args exist
  checkExists(workoutType);
  checkExists(userId);
  checkExists(exercises);
  checkExists(description);
  //Check valid strings
  checkString(workoutType);
  workoutType = workoutType.trim();
  checkStringLength(workoutType);
  checkString(description);
  description = description.trim();
  checkId(userId);
  checkArray(exercises);
  checkEmptyArray(exercises);

  for (let exercise of exercises) {
    checkString(exercise);
    exercise = exercise.trim();
    checkStringLength(exercise);
  }

  let newWorkout = {
    workoutType: workoutType,
    userId: userId,
    ratings: {
      totalRating: 0,
      count: 0,
    },
    exercises: exercises,
    comments: [],
    description: description,
  };

  const insertInfo = await workoutCollection.insertOne(newWorkout);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw new Error(" Could not add workout");

  const newId = insertInfo.insertedId.toString();

  const workout = await getWorkoutById(newId);
  return workout;
};

// Creates a workout with workouts based on preferences. 
/* New workout system, replaces createWorkout */
const createWorkoutPlan = async (userId, workoutName, workoutType, exercises, rating) => {
  console.log(exercises)
  // For now, workout type and name remain the same
/*
  userId: user's id
  workoutName: name of workout: string (text input)
  workoutType: type of workout (dropdown of options): string (dropdown input)
  exercises: [
    {
      name (exercise name): string (dropdown input)
      sets: num 
      reps: num
      weight (lb): num
    }
  ] 
  rating (level of difficulty of workout): number 
  // all required attributes
*/

  console.log("User Id: " + userId);
  console.log("Workout Name: " + workoutName);
  console.log("Workout type: " + workoutType);
  console.log("Exercises: " + exercises);
  console.log("Rating: " + rating);

  

  // Check args exist
  checkExists(userId);
  checkExists(workoutName);
  checkExists(workoutType);
  checkExists(exercises);
  checkExists(rating);

  //Check valid strings
  checkString(workoutName);
  workoutName = workoutName.trim();
  checkString(workoutType);
  workoutType = workoutType.trim();

  // Check user Id
  checkId(userId);

  // Check number
  checkNumber(rating);
  checkArray(exercises);
  checkEmptyArray(exercises);


  for (let exercise of exercises) {
    checkString(exercise.name);
    exercise.name = exercise.name.trim();
    checkStringLength(exercise.name);

    checkNumber(exercise.sets);
    if (checkWholeNumber(exercise.sets)) {
      throw new Error("Sets not an integer");
    }

    checkNumber(exercise.reps);
    if (checkWholeNumber(exercise.reps)) {
      throw new Error("Reps not an integer");
    }

    checkNumber(exercise.weight);
    // no need to check if weight is integer.
    
  }

  if (checkWholeNumber(rating)) {
    throw new Error("Rating is not an integer");
  }

  if (rating < 1 || rating > 5) {
    throw new Error("Rating should be between 1-5");
  }

  let newWorkout = {
    userId: userId,
    workoutName: workoutName,
    workoutType: workoutType,
    exercises: exercises,
    rating: rating,
    comments: [],
  };

  const insertInfo = await workoutCollection.insertOne(newWorkout);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw new Error(" Could not add workout");

  const newId = insertInfo.insertedId.toString();

  const userCollection = await users();

  let pastWorkouts = await getAllWorkoutsOfUserBilly(userId);
  console.log(pastWorkouts);
  pastWorkouts.push(newId);
  await userCollection.findOneAndUpdate({userId: userId}, {$set:{savedWorkouts : pastWorkouts}});

  const workout = await getWorkoutById(newId);
  console.log("Workout from Data: " + newWorkout);
  return workout;

}


// Calculate suggested weight based on user's stats for each exercise
const calculateSuggestedWeightForExercise = (user, workout, exercise) => {
  // for now exerciseName falls under workoutType subcategory
  // if no maxes included, just go off of experience level for specific workout
  // if (userId.experience 
  // Assumption: signup data is validated, userId's object attributes are all valid
  // with maxes included
  // let experienceForLift = '';
  // if workout type selection doesn't match a filled in max, then go off of experience
  
  // console.log("User Id is: " + user.userId);
  // // console.log("Workout Id is: " + workoutId); 
  
  // console.log("User Id Maxes are");

  // console.log("Bench Max" + user.benchMax);
  // console.log("Squat Max" + user.squatMax);
  // console.log("Deadlift Max" + user.deadliftMax);

  // console.log('Exercise' + user.experience);

  //   let suggestedExercise = {
  //     name: exercise.name,
  //     sets: exercise.sets,
  //     reps: exercise.reps,
  //     weight: 1
  // }

  console.log("User Max squat: " + user.squatMax);

  let calculatedMax = -1;
  if (workout.workoutType === 'Bench') {
    if (!user.benchMax) { 
      if (user.experience === 'Advanced') {
        let advancedMultiplier = 1.75;
        calculatedMax = advancedMultiplier * user.weight;
      }
      else if (user.experience === 'Intermediate') {
        let intermediateMultiplier = 1.25;
        calculatedMax = intermediateMultiplier * user.weight;
      }
      else {
        let beginnerMultiplier = .5;
        calculatedMax = beginnerMultiplier * user.weight;
      }
    }
    else { // go off experience level selection by default
      calculatedMax = user.benchMax;
    }
  }
  if (workout.workoutType === 'Squat') {
    if (!user.squatMax) {
      if (user.experience === 'Advanced') {
        let advancedMultiplier = 2.25;
        calculatedMax = advancedMultiplier * user.weight;
      } 
      else if (user.experience === 'Intermediate') {
        let intermediateMultiplier = 1.5;
        calculatedMax = intermediateMultiplier * user.weight;
      } 
      else {
        let beginnerMultiplier = 0.75;
        calculatedMax = beginnerMultiplier * user.weight;
      }
    }
    else {
      calculatedMax = user.squatMax;
    }
  }
  if (workout.workoutType === 'Deadlift') {
    if (!user.deadliftMax) {
      if (user.experience === 'Advanced') {
        let advancedMultiplier = 2.5;
        calculatedMax = advancedMultiplier * user.weight;
      } 
      else if (user.experience === 'Intermediate') {
        let intermediateMultiplier = 2;
        calculatedMax = intermediateMultiplier * user.weight;
      } 
      else {
        let beginnerMultiplier = 1;
        calculatedMax = beginnerMultiplier * user.weight;
      }
    }
    else {
      calculatedMax = user.deadliftMax;
    }
  }
  if (calculatedMax < 0) {
    throw new Error("Error computing formula for exercise");
  }
  // const maxWeightBench = userId.benchMax ? userId.benchMax : benc
  // const maxWeightSquat = userId.benchMax ? userId.squatMax : 
  // const maxWeightDeadlift = userId.benchMax ? userId.deadliftMax : 
  // max = experienceMultiplier * userId.weight; // not correct
  // experience multiplier
  // 
 //  calculatedMax has to be placed into a calculation for number of reps which will be consistent
  let liftPercentage = .75; // percent of projected max for a workout
  let percentOfMax = -1; 
  switch(exercise.reps) {
    case 1:
      percentOfMax = 1;
      break;
    case 2:
      percentOfMax = .95;
      break;
    case 3:
      percentOfMax = .925;
      break;
    case 4:
      percentOfMax = .9;
      break;
    case 5:
      percentOfMax = .875;
      break;
    case 6:
      percentOfMax = .85;
      break;
    case 7:
      percentOfMax = .825;
      break;
    case 8:
      percentOfMax = .8;
      break;
    case 9:
      percentOfMax = .775;
      break;
    case 10:
      percentOfMax = .75;
      break;
    default:
      percentOfMax = 1; // if no result
      break;
  }
  // https://stackoverflow.com/questions/34077449/fastest-way-to-cast-a-float-to-an-int-in-javascript
  let liftWeight = ~~(liftPercentage * calculatedMax * percentOfMax) // .75 is working sets percentage of max
  let suggestedExercise = {
    name: exercise.name,
    sets: exercise.sets,
    reps: exercise.reps,
    weight: liftWeight
  }



  return suggestedExercise; // returns the whole exercise object for one exercise
}


export const getProjectedMaxes = async (userId) => {
  const userCollection = await users();
  const workoutCollection = await workouts();
  
  const recentWorkouts = await workoutCollection
    .find({ userId: userId.toLowerCase() }) 
    .sort({ date: -1 }) // get most recent date
    .toArray();

  if (!recentWorkouts || recentWorkouts.length === 0) {
    return null;
  }

  // Get most recent workout for each type (SBD)
  const latestBench = recentWorkouts.find(w => w.type === 'Bench');
  const latestSquat = recentWorkouts.find(w => w.type === 'Squat');
  const latestDeadlift = recentWorkouts.find(w => w.type === 'Deadlift');

  const calculateAdjustedMax = (workout) => {
    if (!workout) return null;
    
    const projectedMax = workout.weight * (1 + 0.0333 * workout.reps);
    
    // adjust projectedMax based on rating
    let adjustment = 1;
    if (workout.rating === 1) adjustment = 1.05;
    else if (workout.rating === 2) adjustment = 1.025;
    // 3 is just 1
    else if (workout.rating === 4) adjustment = 0.975;
    else if (workout.rating === 5) adjustment = 0.95;
    
    return Math.round(projectedMax * adjustment);
  };

  const projections = {
    projBenchMax: calculateAdjustedMax(latestBench),
    projSquatMax: calculateAdjustedMax(latestSquat),
    projDeadliftMax: calculateAdjustedMax(latestDeadlift)
  };

  // Update user with projections
  await userCollection.updateOne(
    { userId: userId.toLowerCase() },
    { $set: { projections: projections } }
  );

  return projections;
};


//Get user streak based on userId

const getUserStreak = async (userId) => {
  checkExists(userId);
  checkId(userId)
  const userCollection = await users();
  const user = await userCollection.findOne({ userId: userId.toLowerCase() });

  if (!user) throw "Error: User not found.";

  let streakCount = 0;
  let lastStreakDate = null;

  if(user.streakCount) streakCount = user.streakCount;

  if(user.lastStreakDate) lastStreakDate = user.lastStreakDate;

  return {
    streakCount: streakCount,
    lastStreakDate: lastStreakDate,
  };
};


//Updates user streak dpepending on when they create a workout
//https://stackoverflow.com/questions/2627473/how-to-calculate-the-number-of-days-between-two-dates
const updateUserStreak = async (userId) => {
  checkExists(userId);
  checkId(userId);

  const userCollection = await users();
  const user = await userCollection.findOne({ userId: userId.toLowerCase() });

  if (!user) {
    throw "Error: User not found.";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  let lastStreakDate = null;
  if (user.lastStreakDate) {
    lastStreakDate = new Date(user.lastStreakDate);
    lastStreakDate.setHours(0, 0, 0, 0);
  }

  let streakCount = 0;
  if (user.streakCount) {
    streakCount = user.streakCount;
  }

  if (lastStreakDate) {
    const differenceInDays =
      (today.getTime() - lastStreakDate.getTime()) / (1000 * 60 * 60 * 24);

    if (differenceInDays === 1) {
      streakCount += 1;
    } else if (differenceInDays > 1) {
      streakCount = 1;
    }
  } else {
    streakCount = 1;
  }

  const updateInfo = await userCollection.updateOne(
    { userId: userId.toLowerCase() },
    {
      $set: {
        streakCount: streakCount,
        lastStreakDate: today,
      },
    }
  );

  if (updateInfo.matchedCount === 0) {
    throw "Error: Could not update user's streak.";
  }

  return streakCount;
};



//Gets all workouts in the database
const getAllPublicWorkouts = async (userId) => {
  const workoutCollection = await workouts();
  const workoutList = await workoutCollection.find({}).toArray();

  if (!workoutList) throw new Error(" Could not get all workouts");

  let resultList = [];
  for (const workout of workoutList) {
    console.log(workout.userId);
    const status = await userData.profilePrivacyStatus(workout.userId);
    const friendStatus = await userData.friendStatus(userId, workout.userId);
    if (status || friendStatus === 'friend' || userId === workout.userId){
      const result = await findByWorkoutIdExercisesOnlyBilly(workout._id);
      resultList.push(result);
    }
  }

  return resultList;
};

//Gets a specific workout based on workout id that is passed in
const getWorkoutById = async (id) => {
  checkExists(id);
  checkString(id);
  id = id.trim();
  checkStringLength(id);
  console.log(id, id.length)
  if (!ObjectId.isValid(id)) throw new Error(" invalid object ID");
  const workoutCollection = await workouts();
  const workout = await workoutCollection.findOne({ _id: new ObjectId(id) });
  if (workout === null) throw new Error(" No workout with that id");
  workout._id = workout._id.toString();
  // console.log(`This is : ${workout}`);
  return workout;
};

//Removes workout based on workout id that is passed in
const removeWorkout = async (id) => {
  checkExists(id);
  if (!id) throw new Error(" You must provide an id to search for");
  checkString(id);
  id = id.trim();
  checkStringLength(id);
  if (!ObjectId.isValid(id)) throw new Error(" Invalid object ID");
  const workoutCollection = await workouts();
  const deletionInfo = await workoutCollection.findOneAndDelete({
    _id: new ObjectId(id),
  });

  if (!deletionInfo) {
    throw `Error: Could not delete workout with id of ${id}`;
  }
  return `${deletionInfo.workoutType} with exercises
  ${deletionInfo.exercises} have been successfully deleted!`;
};

//Updates workout based on id that is passed in
//Here if needed, from what I see our core features dont require it,
//but if there is use then feel free
const updateWorkout = async (workoutId, workoutType, exercises, comments) => {
  checkExists(workoutId);
  checkExists(workoutType);
  checkExists(exercises);

  checkString(workoutId);
  workoutId = workoutId.trim();
  checkStringLength(workoutId);
  checkId(workoutId);

  checkString(workoutType);
  workoutType = workoutType.trim();
  checkStringLength(workoutType);
  checkArray(exercises);
  checkEmptyArray(exercises);

  // for (let exercise of exercises) {
  //   checkString(exercise);
  //   exercise = exercise.trim();
  //   checkStringLength(exercise);
  // }

  const updatedWorkout = {
    workoutType: workoutType,
    exercises: exercises,
    comments: comments,
  };
  const workoutCollection = await workouts();
  const updatedInfo = await workoutCollection.findOneAndUpdate(
    { _id: new ObjectId(workoutId) },
    { $set: updatedWorkout },
    { returnDocument: "after" }
  );
  const userCollection = await users(); 

  if (!updatedInfo) {
    throw new Error(" Could not update workout successfully");
  }
  updatedInfo._id = updatedInfo._id.toString();
  return updatedInfo;
};

//Gets all workouts of a specific user based on passed in userId
const getWorkouts = async (userId) => {
  const user = await getUserProfile(userId);
  const workoutList = user.savedWorkouts;
  
  const results = [];
  if(workoutList){
    for (const workout of workoutList) {
      results.push(getWorkoutById(workout._id))
    }
  }
  return results;
};

/*
const getSavedWorkouts = async (userId) => {
  const user = await getUserProfile(userId);
  const workoutList = user.savedWorkouts;
  
  const results = [];
  if(workoutList){
    for (const workout of workoutList) {
      results.push(getWorkoutById(workout._id))
    }
  }
  return results;
};*/

////////////////
const getAllWorkoutsOfUserBilly = async (userId) => {
  const workoutCollection = await workouts();
  const workoutList = await workoutCollection.find({}).toArray();

  if (!workoutList) throw new Error(" Could not get all workouts");

  const resultList = [];

  for (const workout of workoutList) {
    if (workout.userId === userId) {
      const nameID = await findByWorkoutIdExercisesOnlyBilly(workout._id);
      resultList.push(nameID);
    }
  }

  return resultList;
};

async function findByWorkoutIdExercisesOnlyBilly(workoutId) {
  if (!workoutId) throw "You must provide a workout ID";
  const workoutCollection = await workouts();
  const foundWorkout = await workoutCollection.findOne(
    { _id: workoutId }
  );

  if (!foundWorkout) throw "Workout not found";

  return {
    foundWorkout
  };
}
////////////////////

const rateWorkout = async (workoutId, userRating) => {
  checkExists(workoutId);
  checkExists(userRating);
  checkId(workoutId);
  if (typeof userRating !== "number" || userRating < 1 || userRating > 5) {
    throw new Error(" Rating must be a number between 1 and 5.");
  }

  const workoutCollection = await workouts();

  const workout = await workoutCollection.findOne({
    _id: new ObjectId(workoutId),
  });
  if (!workout) throw new Error(" Workout not found.");

  let newTotal = (workout.ratings.totalRating || 0) + userRating;
  let newCount = (workout.ratings.count || 0) + 1;
  let averageRating = newTotal / newCount;

  const updateInfo = await workoutCollection.updateOne(
    { _id: new ObjectId(workoutId) },
    {
      $set: {
        "ratings.totalRating": newTotal,
        "ratings.count": newCount,
      },
    }
  );

  if (updateInfo.matchedCount === 0) {
    throw new Error(" Could not update workout rating.");
  }

  return {
    workoutId: workoutId,
    averageRating: averageRating.toFixed(2),
  };
};

function checkId(id) {
  if (!id) throw new Error(" You must provide an id to search for");
  if (typeof id !== "string") throw new Error(" id must be a string");
  id = id.trim();
  if (id.length === 0)
    throw new Error(" id cannot be an empty string or just spaces");
  return id;
}

function checkStringWithName(strVal, varName) {
  if (!strVal) throw `Error: You must supply a ${varName}!`;
  if (typeof strVal !== "string") throw `Error: ${varName} must be a string!`;
  strVal = strVal.trim();
  if (strVal.length === 0)
    throw `Error: ${varName} cannot be an empty string or string with just spaces`;
  if (!isNaN(strVal))
    throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
  return strVal;
}

//Todo You can use this file for any helper functions you may need. This file is optional and you don't have to use it if you do not want to.
//Helper Functions
function checkString(input) {
  if (typeof input !== "string") {
    throw new Error(`${JSON.stringify(input)} is not a string`);
  }
}

function checkExists(input) {
  if (input == null || input == undefined) {
    throw new Error("Error: Input does not exist");
  }
}

function checkZeroLen(input) {
  if (input.length === 0) {
    throw new Error(" Input length is 0");
  }
}

let checkNumber = (input) => {
  if (typeof input !== "number") {
    throw new Error(`${input} is not a number`);
  }
  if (isNaN(input)) {
    throw new Error(" Input contains NaN");
  }
};

let checkNull = (input) => {
  if (typeof input === "undefined" && input === null) {
    throw new Error(" Passed null");
  }
};

let checkEmptyArray = (input) => {
  if (input.length === 0) {
    throw new Error(" Passed empty array");
  }
};
let checkLengthIsTwo = (input) => {
  if (input.length !== 2) {
    throw new Error(" Passed incorrect size array");
  }
};
let checkArray = (input) => {
  if (!Array.isArray(input)) {
    throw new Error(" Not an array");
  }
};

let checkStringLength = (input) => {
  let trimmed = input.trim().length;
  if (trimmed === 0) {
    throw new Error(" String length is 0");
  }
};
let checkStringAndNumber = (input) => {
  // if (isNaN(input)) {
  //   throw new Error(" Input contains NaN";
  // }
  if (typeof input !== "string" && typeof input !== "number") {
    throw new Error(" Element is not a String or Number");
  }
};

let checkArrBool = (input) => {
  if (!Array.isArray(input)) {
    return false;
  } else {
    return true;
  }
};

let checkLenAtLeastTwo = (input) => {
  if (input.length < 2) {
    throw new Error(" Array/String input length is less than 2");
  }
};

let checkPrimObjArr = (input) => {
  if (
    typeof input !== "number" &&
    typeof input !== "boolean" &&
    typeof input !== "string" &&
    typeof input !== "null" &&
    typeof input !== "undefined" &&
    typeof input !== "object" &&
    !Array.isArray(input)
  ) {
    throw new Error(" Input or Element is not a Primitive, Object, or Array");
  }
  if (typeof input === "number" && isNaN(input)) {
    throw new Error(" Element is NaN");
  }
};

// let checkString = (input) => {
//   if (typeof input !== "string") {
//     throw new Error(" Input is not a String";
//   }
// };

let checkWithinBounds = (min, max) => {
  if (min < 1 || min > max) {
    throw new Error(" Min not within bounds");
  }
};
let checkUndef = (input) => {
  if (input == undefined) {
    throw new Error(" Passed undefined");
  }
};

let checkObj = (input) => {
  if (typeof input !== "object") {
    throw new Error(" Element is not an object");
  }
};

let checkObjectEmpty = (input) => {
  if (Object.keys(input).length === 0) {
    throw new Error(" Object is empty");
  }
};

let checkFunc = (input) => {
  if (typeof input !== "function") {
    throw new Error(" Input is not a function");
  }
};

let checkWholeNumber = (input) => {
  if (!Number.isInteger(input)) {
    throw new Error(" Input is not an integer");
  }
};

let checkPos = (input) => {
  checkNumber(input);
  if (input < 0) {
    throw new Error(" Input is negative");
  }
};

function trimAll(...parameters) {
  for (let i = 0; i < parameters.length; i++) {
    parameters[i] = parameters[i].trim();
  }
  return parameters;
}

//Given a workoutId, returns the id and the workoutType
async function findByWorkoutIdExercisesOnly(workoutId) {
  if (!workoutId) throw "You must provide a workout ID";
  const workoutCollection = await workouts();
  const foundWorkout = await workoutCollection.findOne(
    { _id: workoutId },
    { projection: { _id: 1, workoutType: 1 } }
  );

  if (!foundWorkout) throw "Workout not found";

  return {
    _id: foundWorkout._id.toString(),
    workoutType: foundWorkout.workoutType,
  };
}

function checkValidObjId(id) {
  if (!ObjectId.isValid(id)) throw new Error(" invalid object ID");
}

function checkValidDate(date) {
  if (!validateDate(date, "boolean", "MM/DD/YYYY")) {
    throw new Error(" Date is not in MM/DD/YYYY");
  }
  const [month, day, year] = date.split("/").map(Number);
  let givenDate = new Date(year, month - 1, day);
  if (
    givenDate.getFullYear() !== year &&
    givenDate.getMonth() !== month - 1 &&
    givenDate.getDate() !== day
  ) {
    throw new Error(" Date does not logically exist");
  }
  const currentDate = new Date();
  if (givenDate > currentDate) {
    throw new Error(" Date is in the future");
  }
}

function checkBool(bool) {
  if (typeof bool !== "boolean") {
    throw new Error(" Input is not a bool");
  }
}

export default {
  getAllWorkoutsOfUserBilly,
  //getSavedWorkouts,
  createWorkout,
  createWorkoutPlan,
  calculateSuggestedWeightForExercise,
  getProjectedMaxes,
  getAllPublicWorkouts,
  getWorkoutById,
  removeWorkout,
  updateWorkout,
  //getPastWorkouts,
  rateWorkout,
  getUserStreak,
  updateUserStreak,
};
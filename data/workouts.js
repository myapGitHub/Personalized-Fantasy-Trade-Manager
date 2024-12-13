// This data file should export all functions using the ES6 standard as shown in the lecture code
import axios from "axios";
import { workouts } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import validateDate from "validate-date";

const workoutCollection = await workouts();

//Creates a workout with workoutType, userId (who created the workout), and exercises, and a description of the workout
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

//Gets all workouts in the database
const getAllWorkouts = async () => {
  const workoutCollection = await workouts();
  const workoutList = await workoutCollection.find({}).toArray();

  if (!workoutList) throw new Error(" Could not get all workouts");

  const resultList = [];

  for (const workout of workoutList) {
    const nameID = await findByWorkoutIdExercisesOnly(workout._id);
    resultList.push(nameID);
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
    throw `Error: Could not delete team with id of ${id}`;
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

  for (let exercise of exercises) {
    checkString(exercise);
    exercise = exercise.trim();
    checkStringLength(exercise);
  }

  const updatedWorkout = {
    workoutType: workoutType,
    exercises: exercises,
    comments: comments,
  };
  console.log({workoutId})
  const workoutCollection = await workouts();
  const updatedInfo = await workoutCollection.findOneAndUpdate(
    { _id: new ObjectId(workoutId) },
    { $set: updatedWorkout },
    { returnDocument: "after" }
  );

  if (!updatedInfo) {
    throw new Error(" Could not update workout successfully");
  }
  updatedInfo._id = updatedInfo._id.toString();
  return updatedInfo;
};

//Gets all workouts of a specific user based on passed in userId
const getAllWorkoutsOfUser = async (userId) => {
  const workoutCollection = await workouts();
  const workoutList = await workoutCollection.find({}).toArray();

  if (!workoutList) throw new Error(" Could not get all workouts");

  const resultList = [];

  for (const workout of workoutList) {
    if (workout.userId === userId) {
      const nameID = await findByWorkoutIdExercisesOnly(workout._id);
      resultList.push(nameID);
    }
  }

  return resultList;
};

//////////////
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
///////////////

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
    throw new Error(" Input is not a string");
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
    throw new Error(" Element is not a number");
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

function checkValidStateAbbreviation(state) {
  checkLengthIsTwo(state);

  const validStates = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
  ];
  state = state.toUpperCase();

  if (!validStates.includes(state)) {
    throw new Error(" State is not valid");
  }
}

function checkYearFounded(yearFounded) {
  checkNumber(yearFounded);
  const today = new Date();
  let todayYear = today.getFullYear();
  if (yearFounded < 1850 || yearFounded > todayYear) {
    throw new Error(" Invalid yearFounded");
  }
}

function checkPlayers(players) {
  //   console.log(`Checking Players: `);
  checkArray(players);
  checkEmptyArray(players);
  for (let player of players) {
    checkObj(player);
    checkObjectEmpty(player);
    let properKeys = ["firstName", "lastName", "position"];
    let playerKeys = Object.keys(player);
    //Learned something new, for future me
    //.every() checks if every element from properKeys satisfies the () condition
    //In this case, it is that playerKeys has all the keys of ProperKeys
    //Use negation to check if at least one is missing, then we throw error
    if (
      playerKeys.length !== 3 ||
      !properKeys.every((key) => playerKeys.includes(key))
    ) {
      throw new Error(" Each player must have firstName, lastName, and position as keys");
    }
    for (let key in player) {
      checkExists(player[key]);
      checkString(player[key]);
      player[key] = player[key].trim();
      checkStringLength(player[key]);
    }
  }
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

function checkTeam(
  name,
  sport,
  yearFounded,
  city,
  state,
  stadium,
  championshipsWon,
  players
) {
  //Check args exist
  //   checkExists(id);
  checkExists(name);
  checkExists(sport);
  checkExists(yearFounded);
  checkExists(city);
  checkExists(state);
  checkExists(stadium);
  checkExists(championshipsWon);
  checkExists(players);

  //Check valid strings
  function checkArgsString() {
    // checkExists(id);
    checkString(name);
    checkString(sport);
    checkString(city);
    checkString(state);
    checkString(stadium);
  }
  checkArgsString();
  function trimAll() {
    // id = id.trim();
    name = name.trim();
    sport = sport.trim();
    city = city.trim();
    state = state.trim();
    stadium = stadium.trim();
  }
  trimAll();
  function checkStrLength() {
    // checkStringLength(id);
    checkStringLength(name);
    checkStringLength(sport);
    checkStringLength(city);
    checkStringLength(state);
    checkStringLength(stadium);
  }
  checkStrLength();
  //   if (!ObjectId.isValid(id)) throw new Error(" invalid object ID";
  checkValidStateAbbreviation(state);
  checkYearFounded(yearFounded);
  function checkChampsWon() {
    checkNumber(championshipsWon);
    checkPos(championshipsWon);
    checkWholeNumber(championshipsWon);
  }
  checkChampsWon();
  checkPlayers(players);
}

async function checkGame(
  teamId,
  gameDate,
  opposingTeamId,
  homeOrAway,
  finalScore,
  win
) {
  checkExists(teamId);
  checkExists(gameDate);
  checkExists(opposingTeamId);
  checkExists(homeOrAway);
  checkExists(finalScore);
  checkExists(win);

  checkString(teamId);
  checkString(gameDate);
  checkString(opposingTeamId);
  checkString(homeOrAway);
  checkString(finalScore);

  teamId = teamId.trim();
  gameDate = gameDate.trim();
  opposingTeamId = opposingTeamId.trim();
  homeOrAway = homeOrAway.trim();
  finalScore = finalScore.trim();

  checkStringLength(teamId);
  checkStringLength(gameDate);
  checkStringLength(opposingTeamId);
  checkStringLength(homeOrAway);
  checkStringLength(finalScore);

  checkValidObjId(teamId);
  let mainTeam;
  try {
    mainTeam = await teamFun.getTeamById(teamId);
  } catch (e) {
    throw e;
  }

  // let date = new Date(gameDate);
  checkValidDate(gameDate);

  let opposingTeam;
  try {
    opposingTeam = await teamFun.getTeamById(opposingTeamId);
  } catch (e) {
    throw e;
  }

  if (homeOrAway !== "Home" && homeOrAway !== "Away") {
    throw new Error(" Not Home or Away");
  }

  let finalScoreCheck = finalScore.split("");
  checkWholeNumber(parseInt(finalScoreCheck[0]));
  checkWholeNumber(parseInt(finalScoreCheck[2]));
  if (
    parseInt(finalScoreCheck[0]) < 0 ||
    parseInt(finalScoreCheck[2]) < 0 ||
    parseInt(finalScoreCheck[0]) === parseInt(finalScoreCheck[2]) ||
    finalScoreCheck[1] !== "-"
  ) {
    throw new Error(" finalScore is not in proper format");
  }

  checkBool(win);

  if (mainTeam.sport !== opposingTeam.sport) {
    throw new Error(" Teams do not play the same sport");
  }

  if (mainTeam._id === opposingTeam._id) {
    throw new Error(" Team cannot play itself");
  }
}
export default {
  createWorkout,
  getAllWorkouts,
  getWorkoutById,
  removeWorkout,
  updateWorkout,
  getAllWorkoutsOfUser,
  getAllWorkoutsOfUserBilly,
  rateWorkout,
};
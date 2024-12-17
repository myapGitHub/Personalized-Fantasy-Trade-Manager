import { Router } from "express";
import { workoutData } from "../data/index.js";
import { userData } from "../data/index.js";
import workouts from "../data/workouts.js";
import xss from "xss";
import { ObjectId } from "mongodb";
import { users } from "../config/mongoCollections.js";
import bcrypt from "bcrypt";

const router = Router();

router.get("/", async (req, res) => {
  res.redirect("/workouts/workoutsPage");
});

router.post("/", async (req, res) => {
  try {
    console.log(req.body);

    // let { workoutName, workoutType, exerciseName, sets, reps, weight, rating} = xss(req.body);
    if (!req.session.user) {
      throw `Error: User is not valid`;
    }
    checkExists(req.session.user.userId);
    checkExists(req.body.workoutName);
    checkExists(req.body.workoutType);
    checkExists(req.body.exerciseName);
    checkExists(req.body.sets);
    checkExists(req.body.reps);
    checkExists(req.body.weight);
    checkExists(req.body.rating);
    checkNumber(parseInt(req.body.sets));
    checkNumber(parseInt(req.body.reps));
    checkNumber(parseInt(req.body.weight));

    const userId = req.session.user.userId;

    const workoutName = xss(req.body.workoutName);
    const workoutType = xss(req.body.workoutType);
    //const exerciseName = xss(req.body.exerciseName);
    let exerciseNames = req.body.exerciseName;
    const sets = parseInt(xss(req.body.sets));
    const reps = parseInt(xss(req.body.reps));
    const weight = parseFloat(xss(req.body.weight));
    const rating = parseInt(xss(req.body.rating));
    const info = req.body;
    //const exercises = []

    if (!Array.isArray(exerciseNames)) {
      exerciseNames = [exerciseNames]; // Convert to array if it's not
    }
    //for (let i = 0; i < info.exerciseName.length; i++) {
    // let exercise = {name: info.exerciseName[i], sets, reps, weight, rating}
    // exercises.push(exercise)
    //}
    const exercises = exerciseNames.map((name) => ({
      name: xss(name),
      sets: sets,
      reps: reps,
      weight: weight
      // rating: rating, // rating should only be for the workout
    }));
    // const exercises = [{
    //   name: exerciseName,
    //   sets: sets,
    //   reps: reps,
    //   weight: weight
    // }];

    const date = new Date(); // Create the date
    console.log("Date being passed:", date); // Add this log to verify

    const updatedStreak = await workoutData.updateUserStreak(userId);
    console.log(updatedStreak);
    console.log(exercises);
    await workoutData.createWorkoutPlan(
      userId,
      workoutName,
      workoutType,
      exercises,
      rating
    );
    // await workoutData.createWorkoutPlan({
    //   userId, workoutName, workoutType, exercises, rating, createdAt: new Date().toISOString()
    // });
    res.redirect("/workouts/userWorkouts");
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: e });
  }
});

router.get("/public", async (req, res) => {
  try {
    const userId = req.session.user.userId;
    const results = await workoutData.getAllPublicWorkouts(userId);
    const streakData = await workoutData.getUserStreak(userId);

    // const date = new Date();

    // console.log(results)
    res.render("pages/Workouts/allWorkouts", { workouts: results });

    // res.render("pages/Workouts/allWorkouts", {
    //   workouts: results,
    //   userId: userId,
    // })
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

router.get("/userWorkouts", async (req, res) => {
  try {
    const userId = req.session.user.userId;
    const results = await workoutData.getAllWorkoutsOfUserBilly(userId);
    const streakData = await workoutData.getUserStreak(userId);
    // console.log(results)
    res.render("pages/Workouts/savedWorkouts", {
      title: "userWorkouts",
      workouts: results,
    });
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

router.get("/insights", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  try {
    const userId = req.session.user.userId;
    const userProfile = await userData.getUserProfile(userId);
    const projectionData = await workoutData.getProjectedMaxAndDiff(userId);
    if (!projectionData) {
      return res.render("pages/workouts/insights", {
        title: "Workout Insights",
        loggedIn: true,
        noWorkouts: true,
      });
    }
    // format data to pass into insight handlebars
    const viewData = {
      title: "Workout Insights",
      loggedIn: true,
      currentMaxes: projectionData.allMaxes,
      mostRecentWorkout: {
        type: projectionData.workoutType,
        currentMax: projectionData.currentMax,
        projectedMax: projectionData.projectedMax,
        differential: projectionData.differential
      },
      // hasProjection: true
    };
    res.render("pages/workouts/insights", viewData);
  } catch (e) {
    res.status(500).render('error', { error: e.message });
  }
});


router.get("/workoutsPage", async (req, res) => {
  try {
    if (!req.session.user || !req.session.user.userId) {
      console.log(req.session.user);
      console.log(req.session.user.userId);
      return res.redirect("/login");
    }

    const userId = req.session.user.userId;
    const streakData = await workoutData.getUserStreak(userId);
    //   console.log("Session data:", req.session);
    //   console.log("Session user:", req.session.user);
    //   console.log("Reached /create route");
    // console.log(streakData);
    // console.log("HELOALFOIMASOIFMOASFMN")
    res.render("pages/workouts/workoutsPage", {
      loggedIn: true,
      streakCount: streakData.streakCount,
    });
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

router.get("/createWorkout", (req, res) => {
  try {
    if (!req.session.user || !req.session.user.userId) {
      console.log(req.session.user);
      console.log(req.session.user?.userId);
      return res.redirect("/login");
    }
    res.render("pages/workouts/createWorkout", { loggedIn: true });
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

router.post("/createWorkout", async (req, res) => {
  const workout = xss(req.body);

  // console.log("THis is the workoutA DSFSADF")
  // console.log(workout);

  if (!req.session.user || !req.session.user.userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  const userId = xss(req.session.user.userId);

  if (!workout || Object.keys(workout).length === 0) {
    return res
      .status(400)
      .json({ error: "There are no fields in the request body" });
  }

  try {
    checkExists(workout);
    checkExists(workout.exerciseName);
    checkExists(workout.sets);
    checkExists(workout.reps);
    checkExists(workout.weight);
    const exercises = [
      {
        name: workout.exerciseName,
        sets: parseInt(workout.sets),
        reps: parseInt(workout.reps),
        weight: parseFloat(workout.weight),
      },
    ];

    const dateAndTime = new Date().toUTCString();

    // const newWorkout = await workoutData.createWorkoutPlan(
    //   userId,
    //   workout.workoutName,
    //   workout.workoutType,
    //   exercises,
    //   workout.rating,
    //   dateAndTime
    // );

    const newWorkout = await workoutData.createWorkoutPlan(
      userId,
      workout.workoutName,
      workout.workoutType,
      exercises,
      workout.rating
    );

    // const updatedStreak = await workoutData.updateUserStreak(userId);

    // console.log("ALOFNKSDNFKAJNFKJDN")

    // console.log("Updated Streak: ", updatedStreak);
    // console.log("New Workout in Routes: " + newWorkout);
    res.redirect(`/workouts/${newWorkout._id}`);
  } catch (e) {
    res
      .status(500)
      .render("pages/workouts/createWorkout", { error: e.message });
  }
});

router.get("/copy/:id", async (req, res) => {
  // try {
  const workout = await workoutData.getWorkoutById(req.params.id);

  const user = req.session.user;

  const exercises = workout.exercises;
  const nameOfWorkoutToClone = workout.workoutName;
  const typeOfWorkoutToClone = workout.workoutType;
  const exercisesWithSuggestions = [];
  for (let exercise of exercises) {
    let exerciseWithSuggestedWeights =
      await workoutData.calculateSuggestedWeightForExercise(
        user,
        workout,
        exercise
      );
    let updatedExercise = {
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exerciseWithSuggestedWeights.weight,
    };
    exercisesWithSuggestions.push(updatedExercise);
  }
  res.render("pages/workouts/createWorkout", {
    loggedIn: true,
    prefill: {
      workoutName: `${nameOfWorkoutToClone} Copy`,
      workoutType: typeOfWorkoutToClone,
      exercises: exercisesWithSuggestions,
    },
  });
  // }
  // catch {
  //   res.render('pages/')
  // }
});

router.get("/:id&u=:userId"),
  async (req, res) => {
    const workout = await workoutData.getWorkoutById(req.params.id);
    res.render("/pages/Workouts/getWorkoutById", { workout: workout });
  };

router.get("/:id"),
  async (req, res) => {
    // planning to add an id for the workouts user after users
    try {
      const id = xss(req.params.id);
      const workout = await workoutData.getWorkoutById(id);
      res.redirect(`/${id}&u=${workout.userId}`);
    } catch (e) {
      console.log(error.message);
      res.status(400).json({ error: e });
    }
  };

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await workoutData.removeWorkout(id);
    res.redirect("/userWorkouts");
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: e });
  }
});

router.route("/favorited").get(async (req, res) => {
  const currUserId = req.session.user.userId;
  try {
    const workoutObjArr = await userData.getAllFavoritedWorkouts(currUserId);
    console.log(workoutObjArr);
    if (workoutObjArr.length !== 0) {
      return res.render("pages/Favorite/favoriteWorkout", {
        workouts: workoutObjArr,
      });
    } else {
      return res.render("pages/Favorite/favoriteWorkoutEmpty");
    }
  } catch (e) {
    console.log(e);
    res.status.redirect("/dashboard");
  }
});

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

function checkValidRange(input, min, max, fieldName) {
  if (!input) {
    throw new Error("A valid number is not provided");
  }
  if (input < min || input > max) {
    throw new Error(
      `${fieldName} is required to be betweeen ${min} and ${max}`
    );
  }
}

export const checkUserId = (userId) => {
  if (userId === undefined || userId === null) throw "userId is not supplied";
  if (typeof userId !== "string" || userId.trim().length === 0)
    throw "userId not string or empty string";

  userId = userId.trim();
  if (userId.length < 5 || userId.length > 10)
    throw "user id has to be 2 >= or 10 <= in length";

  for (const char of userId) {
    if (!isNaN(char) && char !== " ") {
      throw "userid contains number";
    }
  }
  return userId;
};

const checkPassword = async (password) => {
  if (password === undefined || password === null)
    throw "password is not supplied";
  if (typeof password !== "string" || password.trim().length === 0)
    throw "passord is not string or emtpy";

  // NO TRIMING PASSWORD
  //password = password.trim();

  //password constraints
  let capitalLetter = false;
  let specialChar = false;
  let number = false;

  // object of special chars
  const specialChars = {
    "!": true,
    "@": true,
    "#": true,
    $: true,
    "%": true,
    "^": true,
    "&": true,
    "*": true,
    "(": true,
    ")": true,
    _: true,
    "+": true,
    "-": true,
    "=": true,
    "[": true,
    "]": true,
    "{": true,
    "}": true,
    "|": true,
    ";": true,
    ":": true,
    "'": true,
    ",": true,
    ".": true,
    "<": true,
    ">": true,
    "/": true,
    "?": true,
    "`": true,
    "~": true,
    '"': true,
  };

  if (password.length < 8) throw "password not long enough";
  for (const char of password) {
    if (char === " ") throw "password has space";
    if (!isNaN(char)) number = true;
    if (char <= "Z" && char >= "A") capitalLetter = true;
    if (char in specialChars) specialChar = true;
  }

  if (!number || !capitalLetter || !specialChar)
    throw "password doesnt contain Captial Letter, Number or special character";

  const hash = await bcrypt.hash(password, 10);
  return hash;
};

const checkFirstOrLastName = (name) => {
  if (name === undefined || name === null)
    throw "first or last name not provided";
  if (typeof name !== "string" || name.trim().length === 0)
    throw "first name or last name is not string or empty";
  name = name.trim();
  if (name.length < 2 || name.length > 25)
    throw "at least 2 characters long with a max of 25 characters.";

  for (const char of name) {
    if (!isNaN(char) && char !== " ") {
      throw "last or first name cotains number";
    }
  }

  return name;
};

// checks to ensure the input is a number
const checkNum = (num) => {
  if (num === undefined || num === null) throw "No number provided"; // Fixed to handle `null` or `undefined`
  if (typeof num !== "number") throw "Not a valid number";
  if (isNaN(num)) throw "Not a valid number"; // Fixed logic

  return num;
};

// checks gender to ensure it matches 'male', 'female', or 'other'
const checkGender = (gender) => {
  if (!gender) throw "No gender provided";
  if (typeof gender !== "string" || gender.trim().length === 0)
    throw "Invalid gender type";
  gender = gender.trim();
  if (gender !== "male" && gender !== "female" && gender !== "other")
    throw "Invalid gender option";
  return gender;
};
// checks experience level to ensure it matches 'beginner', 'intermediate', or 'advanced'
const checkExperience = (experience) => {
  console.log(experience);
  if (!experience) throw "No experience provided"; // Fixed variable name
  if (typeof experience !== "string" || experience.trim().length === 0)
    throw "Invalid experience type";
  experience = experience.trim();
  if (
    experience !== "beginner" &&
    experience !== "intermediate" &&
    experience !== "advanced"
  )
    throw "Invalid experience level";

  return experience;
};

export default router;

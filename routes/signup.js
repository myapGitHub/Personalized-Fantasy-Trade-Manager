import { Router } from "express";
const router = Router();
import { userData } from "../data/index.js";
import xss from "xss";
import { ObjectId } from "mongodb";
import { users, workouts } from "../config/mongoCollections.js";
import bcrypt from "bcrypt";

// Routes for signup
router
  .route("/")
  .get(async (req, res) => {
    res.render("pages/Login-Signup/signup");
  })
  .post(async (req, res) => {
    // #TODO adding the error checking

    // cleanses the input useing xss
    const userId = xss(req.body.userId);
    const password = xss(req.body.password);
    const firstName = xss(req.body.firstName);
    const lastName = xss(req.body.lastName);
    const height = xss(req.body.height);
    const weight = xss(req.body.weight);
    const age = xss(req.body.age);
    const gender = xss(req.body.gender);
    const level = xss(req.body.level);
    const benchMax = xss(req.body.benchMax);
    const squatMax = xss(req.body.squatMax);
    const deadLiftMax = xss(req.body.deadLiftMax);

    let success;
    try {
      checkExists(req.body);
      checkExists(req.body.userId);
      checkExists(req.body.password);
      checkExists(req.body.firstName);
      checkExists(req.body.lastName);
      checkExists(req.body.height);
      checkExists(req.body.weight);
      checkExists(req.body.age);
      checkExists(req.body.gender);
      checkExists(req.body.level);

      checkId(req.body.userId);
      checkString(req.body.firstName);
      req.body.firstName = req.body.firstName.trim();
      checkStringLength(req.body.firstName);
      checkString(req.body.lastName);
      req.body.lastName = req.body.lastName.trim();
      checkStringLength(req.body.lastName);
      req.body.height = checkNum(parseInt(req.body.height));
      checkValidRange(parseFloat(req.body.height), 40, 300, "Height");
      req.body.weight = checkNum(parseInt(req.body.weight));
      checkValidRange(parseFloat(req.body.weight), 10, 700, "Weight");
      req.body.age = checkNum(parseInt(req.body.age));
      checkValidRange(parseFloat(req.body.age), 0, 120, "Age");

      if (req.body.benchMax) {
        checkExists(req.body.benchMax);
        req.body.benchMax = checkNum(parseInt(req.body.benchMax));
        checkValidRange(parseInt(req.body.benchMax), 1, 1500, "Bench Max");
      }
      if (req.body.squatMax) {
        checkExists(req.body.squatMax);
        req.body.squatMax = checkNum(parseInt(req.body.squatMax));
        checkValidRange(parseInt(req.body.squatMax), 1, 1500, "Squat Max");
      }

      if (req.body.deadLiftMax) {
        checkExists(req.body.deadLiftMax);
        req.body.deadLiftMax = checkNum(parseInt(req.body.deadLiftMax));
        checkValidRange(
          parseInt(req.body.deadLiftMax),
          1,
          1500,
          "DeadLife Max"
        );
      }

      checkGender(req.body.gender);
      checkExperience(req.body.level);

      success = await userData.signUp(
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
      );
    } catch (e) {
      return res.status(400).render("pages/Login-Signup/signup", {
        error: e,
        firstName: firstName,
        lastName: lastName,
        userId: userId,
        height: height,
        weight: weight,
        age: age,
        benchMax: benchMax,
        squatMax: squatMax,
        deadLiftMax: deadLiftMax,
      });
    }

    if (!success.registrationCompleted) {
      return res.status(500).json({ error: "Internal Server Error" });
    }

    res.render("pages/Login-Signup/signup-confirmation");
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

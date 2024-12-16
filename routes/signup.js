import { Router } from "express";
const router = Router();
import { userData } from "../data/index.js";
import xss from "xss";

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
    errors.push("A valid number is not provided");
  }
  if (input < min || input > max) {
    errors.push(`${fieldName} is required to be betweeen ${min} and ${max}`);
  }
}

export default router;

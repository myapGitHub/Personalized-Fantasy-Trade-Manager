// validation function
const checkPasswordSignIn = (password, errors) => {
  if (!errors) errors = [];
  if (password === undefined || password === null) {
    errors.push("Password is not supplied");
  } else if (typeof password !== "string" || password.trim().length === 0) {
    errors.push("Password is not a string or is empty");
  } else {
    // Trims password
    password = password.trim();

    let capitalLetter = false;
    let specialChar = false;
    let number = false;

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

    if (password.length < 8) {
      errors.push("Password is not long enough");
    } else {
      for (const char of password) {
        if (char === " ") {
          errors.push("Password has spaces");
        }
        if (!isNaN(char)) number = true;
        if (char <= "Z" && char >= "A") capitalLetter = true;
        if (char in specialChars) specialChar = true;
      }

      if (!number || !capitalLetter || !specialChar) {
        errors.push(
          "Password doesn't contain a capital letter, number, or special character"
        );
      }
    }
  }
};

const checkFirstOrLastName = (name, errors, fieldName) => {
  if (!errors) errors = [];
  if (name === undefined || name === null) {
    errors.push(`${fieldName} is not provided`);
  } else if (typeof name !== "string" || name.trim().length === 0) {
    errors.push(`${fieldName} is not a string or is empty`);
  } else {
    name = name.trim();
    if (name.length < 2 || name.length > 25) {
      errors.push(
        `${fieldName} must be at least 2 characters long and not more than 25 characters`
      );
    }

    for (const char of name) {
      if (!isNaN(char) && char !== " ") {
        errors.push(`${fieldName} contains numbers`);
      }
    }
  }
};

const checkNum = (num, errors, fieldName) => {
  if (!errors) errors = [];
  if (num === undefined || num === null) {
    errors.push(`${fieldName} is not provided`);
  } else if (typeof num !== "number") {
    errors.push(`${fieldName} is not a valid number`);
  } else if (isNaN(num)) {
    errors.push(`${fieldName} is not a valid number`);
  }
};

const checkGender = (gender, errors) => {
  if (!errors) errors = [];
  if (!gender) {
    errors.push("Gender is not provided");
  } else if (typeof gender !== "string" || gender.trim().length === 0) {
    errors.push("Gender is not a string or is empty");
  } else {
    gender = gender.trim();
    if (gender !== "male" && gender !== "female" && gender !== "other") {
      errors.push("Gender must be 'male', 'female', or 'other'");
    }
  }
};

const checkUserId = (userId, errors) => {
  if (!errors) errors = [];
  if (userId === undefined || userId === null) {
    errors.push("User ID is not provided");
  } else if (typeof userId !== "string" || userId.trim().length === 0) {
    errors.push("User ID is not a string or is empty");
  } else {
    userId = userId.trim();
    if (userId.length < 5 || userId.length > 10) {
      errors.push("User ID must be between 5 and 10 characters");
    }

    for (const char of userId) {
      if (!isNaN(char) && char !== " ") {
        errors.push("User ID contains numbers");
      }
    }
  }
};

const checkExperience = (experience, errors) => {
  if (!errors) errors = [];
  if (!experience) {
    errors.push("Experience level is not provided");
  } else if (typeof experience !== "string" || experience.trim().length === 0) {
    errors.push("Experience level is not a valid string or is empty");
  } else {
    experience = experience.trim();
    if (
      experience !== "beginner" &&
      experience !== "intermediate" &&
      experience !== "advanced"
    ) {
      errors.push(
        "Experience level must be 'beginner', 'intermediate', or 'advanced'"
      );
    }
  }
};

function checkValidRange(input, min, max, errors, fieldName) {
  if (!errors) {
    errors = [];
  }
  if (!input) {
    errors.push("A valid number is not provided");
  }
  if (input < min || input > max) {
    errors.push(`${fieldName} is required to be betweeen ${min} and ${max}`);
  }
}

const signupForm = document.getElementById("signup-form");
const signinForm = document.getElementById("signin-form");

// submit listner for the signup form
if (signupForm) {
  signupForm.addEventListener("submit", (event) => {
    const errorDiv = document.getElementById("error");
    errorDiv.innerHTML = "";

    // Gather input value
    const userId = document.getElementById("userId");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const firstName = document.getElementById("firstName");
    const lastName = document.getElementById("lastName");
    const height = document.getElementById("height");
    const weight = document.getElementById("weight");
    const age = document.getElementById("age");
    const gender = document.getElementById("gender");
    const benchMax = document.getElementById("benchMax");
    const squatMax = document.getElementById("squatMax");
    const deadLiftMax = document.getElementById("deadLiftMax");
    const level = document.getElementById("level");

    // Remove current errors
    let currUl = signupForm.querySelector("ul");
    if (currUl) {
      currUl.remove();
    }
    let errors = [];
    // Validation of all fields
    if (!userId.value) {
      errors.push("Must provide User ID");
    } else {
      checkUserId(userId.value, errors);
    }

    if (!password.value) {
      errors.push("Must provide Password");
    } else {
      checkPasswordSignIn(password.value, errors);
    }

    if (!confirmPassword.value) {
      errors.push("Must confirm Password");
    } else {
      if (confirmPassword.value !== password.value) {
        errors.push("Password and Confirm Password must match");
      } else {
        checkPasswordSignIn(confirmPassword.value, errors);
      }
    }
    if (!firstName.value) {
      errors.push("Must provide First Name");
    } else {
      checkFirstOrLastName(firstName.value, errors, "First Name");
    }

    if (!lastName.value) {
      errors.push("Must provide Last Name");
    } else {
      checkFirstOrLastName(lastName.value, errors, "Last Name");
    }

    if (!height.value) {
      errors.push("Must provide Height");
    } else {
      console.log(`Checking hieght`);
      checkNum(parseFloat(height.value), errors, "Height");
      checkValidRange(parseFloat(height.value), 40, 300, errors, "Height");
    }

    if (!weight.value) {
      errors.push("Must provide Weight");
    } else {
      checkNum(parseFloat(weight.value), errors, "Weight");
      checkValidRange(parseFloat(weight.value), 10, 700, errors, "Weight");
    }
    if (!age.value) {
      errors.push("Must provide Age");
    } else {
      checkNum(parseInt(age.value), errors, "Age");
      checkValidRange(parseFloat(age.value), 0, 120, errors, "Age");
      console.log(age);
    }

    if (!gender.value) {
      errors.push("Must provide Gender");
    } else {
      checkGender(gender.value, errors);
    }

    if (benchMax.value) {
      checkNum(parseInt(benchMax.value), errors, "Bench Max");
      checkValidRange(parseInt(benchMax.value), 1, 1500, errors, "Bench Max");
    }
    if (squatMax.value) {
      checkNum(parseInt(squatMax.value), errors, "Squat Max");
      checkValidRange(parseInt(squatMax.value), 1, 1500, errors, "Squat Max");
    }
    if (deadLiftMax.value) {
      checkNum(parseInt(deadLiftMax.value), errors, "Deadlift Max");
      checkValidRange(
        parseInt(deadLiftMax.value),
        1,
        1500,
        errors,
        "DeadLife Max"
      );
    }

    if (!level.value) {
      errors.push("Must provide experience");
    } else {
      checkExperience(level.value, errors);
    }

    if (errors.length > 0) {
      let myUL = document.createElement("ul");
      event.preventDefault();

      for (const error of errors) {
        let myLi = document.createElement("li");
        myLi.classList.add("error");
        myLi.innerHTML = error;
        myUL.appendChild(myLi);
      }
      signupForm.appendChild(myUL);
    }
  });
}

// Submit listener for the signin form
if (signinForm) {
  signinForm.addEventListener("submit", (event) => {
    const userId = document.getElementById("userId");
    const password = document.getElementById("password");
    const errorDiv = document.getElementById("login-error");
    errorDiv.innerHTML = "";

    // Remove current errors
    let currUl = signinForm.querySelector("ul");
    if (currUl) {
      currUl.remove();
    }

    let errors = [];
    // Validate userId
    if (!userId.value) {
      errors.push("Must provide User ID");
    } else {
      checkUserId(userId.value, errors);
    }

    // Validate password
    if (!password.value) {
      errors.push("Must provide Password");
    } else {
      checkPasswordSignIn(password.value, errors);
    }

    // If errors exist, prevent submission and display errors
    if (errors.length > 0) {
      event.preventDefault(); // Prevent form submission

      let myUL = document.createElement("ul");

      for (const error of errors) {
        let myLi = document.createElement("li");
        myLi.classList.add("error");
        myLi.innerHTML = error;
        myUL.appendChild(myLi);
      }

      // Append errors to the form
      signinForm.appendChild(myUL);
    }
  });
}

const form = document.getElementById('server-form');
const errorDiv = document.getElementById('error');

// Validation functions
const isValidUserName = (userName) => {
    userName = userName.trim();
    if (userName.length === 0) return false;
    for (const char of userName) {
        if (!(char >= 'a' && char <= 'z') && !(char >= 'A' && char <= 'Z') && !(char >= '0' && char <= '9')) {
            return false; 
        }
    }
    return true;
};

const isValidEmail = (email) => {
    email = email.trim();
    if (email.length === 0 || email.includes(' ')) return false;

    const splitOne = email.split('@');
    if (splitOne.length !== 2) return false;

    const username = splitOne[0];
    const domain = splitOne[1];

    if (username.length === 0) return false;

    const splitPeriod = domain.split('.');
    if (splitPeriod.length < 2) return false;

    for (const part of splitPeriod) {
        if (part.length === 0) return false;
    }

    return true;
};

const isValidPassword = (password) => password.length >= 8;

const checkIsProperNumber = (val) => typeof val === 'number' && !isNaN(val);

const isValidExperience = (experience) => {
    const validExperiences = ['beginner', 'intermediate', 'advanced'];
    return validExperiences.includes(experience);
};

// Show error message
const showError = (message) => {
    errorDiv.innerHTML = message;
};

// Clear error message
const clearError = () => {
    errorDiv.innerHTML = '';
};

// Event listener for form submission
form.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default submission

    clearError(); // Clear previous errors

    // Gather input values
    const username = document.getElementById('newUserName').value.trim();
    const email = document.getElementById('newEmail').value.trim();
    const password = document.getElementById('newPassword').value.trim();

    // Validate username
    if (!isValidUserName(username)) {
        showError('Invalid username: Only letters and numbers are allowed.');
        return;
    }

    // Validate email and password
    if (!isValidEmail(email)) {
        showError('Invalid email format.');
        return;
    }

    if (!isValidPassword(password)) {
        showError('Password must be at least 8 characters long.');
        return;
    }

    // Gather personal data
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const height = parseInt(document.getElementById('height').value.trim());
    const weight = parseInt(document.getElementById('weight').value.trim());
    const age = parseInt(document.getElementById('age').value.trim());
    const gender = document.getElementById('gender').value;

    // Validate personal data
    if (firstName.length === 0) {
        showError('First name cannot be empty.');
        return;
    }
    if (lastName.length === 0) {
        showError('Last name cannot be empty.');
        return;
    }
    if (!checkIsProperNumber(height)) {
        showError('Height must be a valid number.');
        return;
    }
    if (!checkIsProperNumber(weight)) {
        showError('Weight must be a valid number.');
        return;
    }
    if (!checkIsProperNumber(age)) {
        showError('Age must be a valid number.');
        return;
    }

    // Gather and validate training experience
    const trainingExperience = document.getElementById('training-experience').value;
    if (!isValidExperience(trainingExperience)) {
        showError('Invalid training experience selected.');
        return;
    }

    // Gather Current Gym Stats
    const benchMax = parseInt(document.getElementById('benchMax').value.trim() || 0);
    const squatMax = parseInt(document.getElementById('squatMax').value.trim() || 0);
    const deadliftMax = parseInt(document.getElementById('deadliftMax').value.trim() || 0);

    // Validate optional gym stats
    if (benchMax && !checkIsProperNumber(benchMax)) {
        showError('Bench Max must be a valid number.');
        return;
    }
    if (squatMax && !checkIsProperNumber(squatMax)) {
        showError('Squat Max must be a valid number.');
        return;
    }
    if (deadliftMax && !checkIsProperNumber(deadliftMax)) {
        showError('Deadlift Max must be a valid number.');
        return;
    }

    // If validation passes, submit the form
    form.submit();
});

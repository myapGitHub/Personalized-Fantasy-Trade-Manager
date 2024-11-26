const form = document.getElementById('login-form');
const errorDiv = document.getElementById('login-error');

// Show error message
const showError = (message) => {
    errorDiv.innerHTML = message;
};
const clearError = () => {
    errorDiv.innerHTML = "";
}
const isValidPassword = (pwrd) => {
    if (!pwrd) return false;
    if (typeof pwrd !== 'string' || pwrd.trim().length === 0 ) return false;
    if (pwrd.length < 8) return false;

    return true;
}
const isValidStr = (str) => {
    if (!str) return false
    if (typeof str !== 'string' || str.trim().length === 0) return false;

    return true;
}
form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearError();

    const firstParam= document.getElementById('sign-in-username-or-email').value
    const password = document.getElementById('sign-in-password').value

    if (!isValidStr(firstParam) || !isValidPassword(password)) {
        showError('Error: Invalid username or password');
    }
    form.submit();
});





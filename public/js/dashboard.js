// helper functions
const checkUserId = (userId) => {
    if (userId === undefined || userId === null) throw "userId is not supplied";
    if (typeof userId !== 'string' || userId.trim().length === 0) throw "userId not string or empty string";

    userId = userId.trim();
    if (userId.length < 5 || userId.length > 10) throw "user id has to be 2 >= or 10 <= in length"; 

    for (const char of userId) {
        if (!isNaN(char) && char !== ' ') {
            throw "userid contains number";
        }
    }
    return userId;
}

// gets access the the input for searching a user
const searchUserForm = document.getElementById('search-user-form');

// event listener to check the userId; 
if (searchUserForm) {
    searchUserForm.addEventListener('submit', (event) => {
        let errorDiv = document.getElementById('search-user-error');
        errorDiv.hidden = true;
        errorDiv.innerHTML = '';

        let searchUserInput = document.getElementById('searchUser')
        let currentUserId = document.getElementById('currentUserId');

        

        if (!searchUserInput.value || !currentUserId.value) {
            event.preventDefault();
            errorDiv.innerHTML = 'Supply UserId';
            errorDiv.hidden = false;
        }
        try {
            searchUserInput = checkUserId(searchUserInput.value);
            currentUserId = checkUserId(currentUserId.value);
            if (searchUserInput === currentUserId) throw "Cannot search for your own userId"
        } catch(e) {
            event.preventDefault();
            errorDiv.innerHTML = e;
            errorDiv.hidden = false;
        }

    });
}


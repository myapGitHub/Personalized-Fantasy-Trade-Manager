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
// form for deleting account
const deleteForm = document.getElementById('delete-account');


// Account deletion form listner
if (deleteForm) {
    deleteForm.addEventListener('submit', (event) => {
        const errorDiv = document.getElementById('error');
        const confrimMessage = document.getElementById('confirm-delete');
        errorDiv.innerHTML='';

        if (!confrimMessage.value || confrimMessage.value !== 'delete account!') {
            event.preventDefault();
            errorDiv.innerHTML = 'Incorrect Confirmation Message';
        }
    });
}

// Ajax settings update
const changeUserIdForm = document.getElementById('change-userId');
// const changeBenchMaxForm = document.getElementById('change-benchMax');
// const changeSquatMaxForm = document.getElementById('change-squatMax');
// const changeDeadLiftMaxForm = document.getElementById('change-deadLiftMax');

if (changeUserIdForm) {
    changeUserIdForm.addEventListener('submit', async (event) => {
        const errorDiv = document.getElementById('userId-error');
        event.preventDefault();

        errorDiv.innerHTML = '';
        errorDiv.hidden = true;

        let userId = document.getElementById('userId').value;

        // Validate userId
        try {
            userId = checkUserId(userId);
        } catch (e) {
            errorDiv.innerHTML = e;
            errorDiv.hidden = false;
            return;
        }

        let requestConfig = {
            method: 'POST',
            url: '/settings/account',
            contentType: 'application/json',
            data: JSON.stringify({
                type: 'userId',
                data: userId
            })
        };

        try {
            const response = await $.ajax(requestConfig);

            // Check for response validity
            if (response && response.changeSuccess) {
                errorDiv.innerHTML = "Successfully Updated!";
                errorDiv.hidden = false;
            } else {
                errorDiv.innerHTML = "Update not Successful";
                errorDiv.hidden = false;
            }
        } catch (e) {
            const errorMessage = e.responseJSON?.error || "An unknown error occurred.";
            errorDiv.innerHTML = errorMessage;
            errorDiv.hidden = false;
        }
    });
}


// Code for the make private make public
const statusButton = document.getElementById('account-status-btn');
if (statusButton) {
    statusButton.addEventListener('click', async () => {
        const errorDiv = document.getElementById('account-status-error');
        let currStatus = statusButton.dataset.status;

        // empty and hide any current errors
        errorDiv.innerHTML = '';
        errorDiv.hidden = true;

        if (!currStatus || (currStatus !== 'public' && currStatus !== 'private')) {
            errorDiv.innerHTML = "Error Occured";
            errorDiv.hidden = false;
            return
        }
        let requestConfig = {
            method: 'POST',
            url: '/settings/account',
            contentType: 'application/json',
            data: JSON.stringify({
                type: 'status',
                data: currStatus
            })
        }
        try {
            const response = await $.ajax(requestConfig);
            // Check for response validity
            if (response && response.completed) {
                // Update the button
                const newStatus = response.newStatus ? 'public' : 'private'; 
                statusButton.dataset.status = newStatus;
                statusButton.textContent = newStatus === 'public' ? 'Make Private' : 'Make Public';
        
                errorDiv.innerHTML = "Successfully Updated!";
                errorDiv.hidden = false;
            } else {
                errorDiv.innerHTML = "Update not Successful";
                errorDiv.hidden = false;
            }
        } catch (e) {
            const errorMessage = e.responseJSON?.error || "An unknown error occurred.";
            errorDiv.innerHTML = errorMessage;
            errorDiv.hidden = false;
        }
    });
}



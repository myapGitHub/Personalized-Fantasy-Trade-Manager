
const checkWorkoutId = (id) => {
    if (!id) return false 
    if (typeof id !== 'string' || id.trim().length === 0) return false 
    id = id.trim();

    return true
}

const favoriteButton = document.getElementById('favorited-workout');

if (favoriteButton) {
    favoriteButton.addEventListener('click', async () => {
        const errorDiv = document.getElementById('favorited-error');
        let currStatusArr = favoriteButton.dataset.status.split('-');

        errorDiv.innerHTML = '';
        errorDiv.hidden = true;
        console.log(currStatusArr)

        if (!currStatusArr || currStatusArr.length !== 2 || 
            (currStatusArr[0] !== 'favorited' && currStatusArr[0] !== 'favorite') || 
            !checkWorkoutId(currStatusArr[1])) {
            errorDiv.innerHTML = "Error Occurred";
            errorDiv.hidden = false;
            return;
        }


        const workoutId = currStatusArr[1];

        let requestConfig = {
            method: 'POST',
            url: '/search-workout/favorite',
            contentType: 'application/json',
            data: JSON.stringify({
                type: 'favorite',
                data: workoutId
            })
        };
        try {
            const response = await $.ajax(requestConfig);

            if (response && response.success) {
                const newStatus = response.favorite ? 'favorited' : 'favorite';
                favoriteButton.dataset.status = `${newStatus}-${workoutId}`;
                favoriteButton.textContent = response.favorite ? 'Remove From Favorites' : 'Favorite Workout';

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


document.addEventListener("DOMContentLoaded", () => {
    const addExerciseButton = document.getElementById("addExercise");
    if (addExerciseButton) {
        addExerciseButton.addEventListener("click", addExercise);
    }

    const removeButtons = Array.from(document.getElementsByClassName("workoutRemove"));
    removeButtons.forEach(button => {
        button.addEventListener("click", remove);
    });

    const copyButtons = Array.from(document.getElementsByClassName("workoutClone"));
    copyButtons.forEach(button => {
        button.addEventListener("click", copyWorkout);
    });
});

async function remove(e) {
    try {
        await fetch(`/workouts/${e.target.dataset.id}`, {
            method: "DELETE"
        });
        window.location.reload();
    } catch (error) {
        console.log(error.message);
    }
}

async function copyWorkout(e) {
    e.preventDefault();
    try {
        const workoutId = e.target.dataset.id;
        window.location.href = `/workouts/copy/${workoutId}`;
    } catch (error) {
        console.log(error.message);
    }
}

function addExercise(e) {
    e.preventDefault();
    const exerciseBlock = document.getElementById("createWorkout-form");
    const newInput = document.createElement("div");
    newInput.classList.add("exercise");
    newInput.innerHTML = `
        <br>
        <div>
            <label for="exercises">Exercises:</label>
            <select id="exerciseName" name="exerciseName" required>
                <option value="Bench">Bench</option>
                <option value="Squat">Squat</option>
                <option value="Deadlift">Deadlift</option>
            </select>
            <label for="sets">Sets:</label>
            <select id="sets" name="sets" required>
                <option value=1>1</option>
                <option value=2>2</option>
                <option value=3>3</option>
                <option value=4>4</option>
                <option value=5>5</option>
                <option value=6>6</option>
            </select>
            <label for="reps">Reps:</label>
            <select id="reps" name="reps" required>
                <option value=1>1</option>
                <option value=2>2</option>
                <option value=3>3</option>
                <option value=4>4</option>
                <option value=5>5</option>
                <option value=6>6</option>
            </select>
            <input type="number" id="weight" name="weight" placeholder="Enter weight (lbs)" required>
        </div>
        <div>
            <label for="rating">Difficulty Rating:</label>
            <select id="rating" name="rating" required>
                <option value=1>1</option>
                <option value=2>2</option>
                <option value=3>3</option>
                <option value=4>4</option>
                <option value=5>5</option>
            </select>
        </div>`;
    exerciseBlock.appendChild(newInput);
}





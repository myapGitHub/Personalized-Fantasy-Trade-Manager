const removeButtons = Array.from(document.getElementsByClassName("workoutRemove"))

removeButtons.forEach(button => {
    button.addEventListener("click", remove)
})

async function remove(e) {
    try {
        await fetch(`/workouts/${e.target.dataset.id}`, {
            method: "DELETE"
        })  
        window.location.reload()
    } catch (error) {
        console.log(error.message)
    }
}

const copyButtons = Array.from(document.getElementsByClassName("workoutClone"))

copyButtons.forEach(button => {
  button.addEventListener("click", copyWorkout);
})

async function copyWorkout(e) {
  e.preventDefault();
  try {
      const workoutId = e.target.dataset.id;
      window.location.href = `/workouts/copy/${workoutId}`
  } catch (error) {
      console.log(error.message)
  }
}


document.getElementById("addExercise").addEventListener("click", addExercise)
function addExercise(e) {
    e.preventDefault()
    const exerciseBlock = document.getElementById("createWorkout-form");
    const newInput = document.createElement("div")
    newInput.classList.add("exercise")
    newInput.innerHTML = 
    `<br>
    <div>
    <label for="exercises">Exercises:</label>

            <select
              {{!-- type="dropdown" --}}
              id="exerciseName"
              name="exerciseName"
              {{!-- placeholder="Select Exercise" --}}
              required
            >
              <option value="Bench">Bench</option>
              <option value="Squat">Squat</option>
              <option value="Deadlift">Deadlift</option>
            </select>
            
            <label for="sets">Sets:</label>
            <select
              type="number"
              id="sets"
              name="sets"
              {{!-- placeholder="Select Option" --}}
              required
            >
              <option value=1>1</option>
              <option value=2>2</option>
              <option value=3>3</option>
              <option value=4>4</option>
              <option value=5>5</option>
              <option value=6>6</option>
              <option value=7>7</option>
              <option value=8>8</option>
              <option value=9>9</option>
              <option value=10>10</option>
          </select>

          <label for="reps">Reps:</label>
          <select
              type="number"
              id="reps"
              name="reps"
              {{!-- placeholder="Select Option" --}}
              required
            >
              <option value=1>1</option>
              <option value=2>2</option>
              <option value=3>3</option>
              <option value=4>4</option>
              <option value=5>5</option>
              <option value=6>6</option>
              <option value=7>7</option>
              <option value=8>8</option>
              <option value=9>9</option>
              <option value=10>10</option>
              <option value=11>11</option>
              <option value=12>12</option>
              <option value=13>13</option>
              <option value=14>14</option>
              <option value=15>15</option>
              <option value=16>16</option>
              <option value=17>17</option>
              <option value=18>18</option>
              <option value=19>19</option>
              <option value=20>20</option>
          </select>

          <input
            type="number"
            id="weight"
            name="weight"
            placeholder="Enter weight (lbs)"
            required
          >
        </div>`
      exerciseBlock.appendChild(newInput)
}

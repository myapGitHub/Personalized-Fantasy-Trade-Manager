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
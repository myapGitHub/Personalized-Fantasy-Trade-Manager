const likeArray = Array.from(document.getElementsByClassName("likebutton"))
const dislikeArray = Array.from(document.getElementsByClassName("dislikebutton"))

likeArray.forEach(el => {
    el.addEventListener("click", incrementLikes)
})

async function incrementLikes(e)  {
    const commentId = e.target.dataset.id.slice(11)
    const workoutId = e.target.dataset.workoutid
    console.log({commentId,workoutId})
    try {
        const response = await fetch(`/comments/${commentId}/${workoutId}/likes`, {
            method: "POST",
            headers: {"Content-Type": "applications/json"}
        })
        // if (response.ok) {
            window.location.reload()
        // }
    } catch (error) {
        console.log(error.message)
    }
}

dislikeArray.forEach(el => {
    el.addEventListener("click", incrementDislikes)
})

async function incrementDislikes(e)  {
    const commentId = e.target.dataset.id.slice(14)
    const workoutId = e.target.dataset.workoutid
    try {
        const response = await fetch(`/comments/${commentId}/${workoutId}/dislikes`, {
            method: "POST",
            headers: {"Content-Type": "applications/json"}
        })
        // if (response.ok) {
            window.location.reload()
        // }
    } catch (error) {
        console.log(error.message)
    }
}
const likeArray = Array.from(document.getElementsByClassName("likebutton"));
const dislikeArray = Array.from(document.getElementsByClassName("dislikebutton"));

likeArray.forEach(el => {
    el.addEventListener("click", toggleLike);
});

dislikeArray.forEach(el => {
    el.addEventListener("click", toggleDislike);
});

async function toggleLike(e) {
    const commentId = e.target.dataset.id.slice(11);
    const workoutId = e.target.dataset.workoutid;
    try {
        await fetch(`/comments/${commentId}/${workoutId}/toggle-like`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });
        window.location.reload();
    } catch (error) {
        console.error(error.message);
    }
}

async function toggleDislike(e) {
    const commentId = e.target.dataset.id.slice(14);
    const workoutId = e.target.dataset.workoutid;
    try {
        await fetch(`/comments/${commentId}/${workoutId}/toggle-dislike`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });
        window.location.reload();
    } catch (error) {
        console.error(error.message);
    }
}

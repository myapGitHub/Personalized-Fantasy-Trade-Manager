import { Router } from "express";
import { workoutData } from "../data/index.js";
import workoutFuncs from "../data/workouts.js";
import { workouts } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";


const router = Router();
const workoutCollection = await workouts();


router.get("/:id", async (req, res) => {
    const id = req.params.id
    try {
        const workout = await workoutFuncs.getWorkoutById(id)
        // const workout = await workoutCollection.findOne({ _id: new ObjectId(id) });
        res.render("pages/Workouts/comments.handlebars", {title: "comment", comments: workout.comments, id, loggedIn: true})
    } catch (error) {
        console.log(error.message)
    }
})

router.post("/:id", async (req, res) => {
    const workoutId = req.params.id
    const text = req.body.comment
    const date = new Date()
    const userId = req.session.user.userId
    const likes = 0
    const dislikes = 0
    const commentId = uuidv4()
    const comment = {workoutId, text, date, userId, likes, dislikes, commentId}
    try {
        const workout = await workoutCollection.findOne({ _id: new ObjectId(workoutId) })
        workout.comments.push(comment)
        await workoutFuncs.updateWorkout(workoutId, workout.workoutType, workout.exercises, workout.comments)
        res.redirect(`/comments/${workoutId}`)
    } catch (error) {
       console.log(error.message) 
    }
})

router.post("/:commentId/:workoutId/likes", async (req, res) => {
    const commentId = req.params.commentId
    const workoutId = req.params.workoutId
    try {
        const workout = await workoutCollection.findOne({_id: new ObjectId(workoutId)})
        for (let i=0; i < workout.comments.length; i++) {
            if (commentId === workout.comments[i].commentId) {
                workout.comments[i].likes++
                break
            }
        }
        const updatedWorkout = await workoutFuncs.updateWorkout(workoutId, workout.workoutType, workout.exercises, workout.comments)
        res.redirect(`/comments/${workoutId}`)
    } catch (error) {
        
    }
})

router.post("/:commentId/:workoutId/dislikes", async (req, res) => {
    const commentId = req.params.commentId
    const workoutId = req.params.workoutId
    try {
        const workout = await workoutCollection.findOne({_id: new ObjectId(workoutId)})
        for (let i=0; i < workout.comments.length; i++) {
            if (commentId === workout.comments[i].commentId) {
                workout.comments[i].dislikes++
                break
            }
        }
        const updatedWorkout = await workoutFuncs.updateWorkout(workoutId, workout.workoutType, workout.exercises, workout.comments)
        res.redirect(`/comments/${workoutId}`)
    } catch (error) {
        
    }
})

export default router;
import { Router } from "express";
import { workoutData } from "../data/index.js";
import workoutFuncs from "../data/workouts.js";
import { workouts } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";


const router = Router();
const workoutCollection = await workouts();


router.get("/:id", async (req, res) => {
    const id = req.params.id
    try {
        const workout = await workoutFuncs.getWorkoutById(id)
        // const workout = await workoutCollection.findOne({ _id: new ObjectId(id) });
        res.render("pages/Workouts/comments.handlebars", {title: "comments", comments: workout.comments, id})
    } catch (error) {
        console.log(error.message)
    }
})

router.post("/:id", async (req, res) => {
    const id = req.params.id
    try {
        const workout = await workoutCollection.findOne({ _id: new ObjectId(id) })
        workout.comments.push(req.body.comment)
        workoutFuncs.updateWorkout(id, workout.workoutType, workout.exercises, workout.comments)
        res.redirect(`/comments/${id}`)
    } catch (error) {
       console.log(error.message) 
    }
})

export default router;
import { Router } from "express";
import { workoutData } from "../data/index.js";
import workoutFuncs from "../data/workouts.js";
import { workouts } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import xss from "xss"

const router = Router();
const workoutCollection = await workouts();

router.get("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const workout = await workoutFuncs.getWorkoutById(id);
        res.render("pages/Workouts/comments.handlebars", {
            title: "comment",
            comments: workout.comments,
            id,
            loggedIn: true
        });
    } catch (error) {
        console.error(error.message);
    }
});

router.post("/:id", async (req, res) => {
    const workoutId = req.params.id;
    const text = req.body.comment;
    const date = new Date();
    const userId = xss(req.session.user.userId);
    const likes = 0;
    const dislikes = 0;
    const commentId = uuidv4();
    const comment = { workoutId, text, date, userId, likes, dislikes, commentId, likedBy: [], dislikedBy: [] };

    try {
        const workout = await workoutCollection.findOne({ _id: new ObjectId(workoutId) });
        console.log(workout)
        workout.comments.push(comment);
        await workoutFuncs.updateWorkout(workoutId, workout.workoutType, workout.exercises, workout.comments);
        res.redirect(`/comments/${workoutId}`);
    } catch (error) {
        console.error(error.message);
    }
});

router.post("/:commentId/:workoutId/toggle-like", async (req, res) => {
    const { commentId, workoutId } = req.params;
    const userId = req.session.user.userId;

    try {
        const workout = await workoutCollection.findOne({ _id: new ObjectId(workoutId) });

        for (let comment of workout.comments) {
            if (comment.commentId === commentId) {
                if (!comment.likedBy) comment.likedBy = [];
                if (!comment.dislikedBy) comment.dislikedBy = [];

                if (comment.likedBy.includes(userId)) {
                    comment.likes--;
                    comment.likedBy = comment.likedBy.filter(id => id !== userId);
                } else {
                    if (comment.dislikedBy.includes(userId)) {
                        comment.dislikes--;
                        comment.dislikedBy = comment.dislikedBy.filter(id => id !== userId);
                    }
                    comment.likes++;
                    comment.likedBy.push(userId);
                }
                break;
            }
        }

        await workoutFuncs.updateWorkout(workoutId, workout.workoutType, workout.exercises, workout.comments);
        res.redirect(`/comments/${workoutId}`);
    } catch (error) {
        console.error(error.message);
    }
});

router.post("/:commentId/:workoutId/toggle-dislike", async (req, res) => {
    const { commentId, workoutId } = req.params;
    const userId = req.session.user.userId;

    try {
        const workout = await workoutCollection.findOne({ _id: new ObjectId(workoutId) });

        for (let comment of workout.comments) {
            if (comment.commentId === commentId) {
                if (!comment.dislikedBy) comment.dislikedBy = [];
                if (!comment.likedBy) comment.likedBy = [];

                if (comment.dislikedBy.includes(userId)) {
                    comment.dislikes--;
                    comment.dislikedBy = comment.dislikedBy.filter(id => id !== userId);
                } else {
                    if (comment.likedBy.includes(userId)) {
                        comment.likes--;
                        comment.likedBy = comment.likedBy.filter(id => id !== userId);
                    }
                    comment.dislikes++;
                    comment.dislikedBy.push(userId);
                }
                break;
            }
        }

        await workoutFuncs.updateWorkout(workoutId, workout.workoutType, workout.exercises, workout.comments);
        res.redirect(`/comments/${workoutId}`);
    } catch (error) {
        console.error(error.message);
    }
});

export default router;

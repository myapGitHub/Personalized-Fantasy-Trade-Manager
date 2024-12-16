import { Router } from "express";
import { workoutData } from "../data/index.js";
import workoutFuncs from "../data/workouts.js";
import { workouts } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import xss from "xss";

const router = Router();
const workoutCollection = await workouts();

const isValidObjectId = (id) => {
    return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
};

router.get("/:id", async (req, res) => {
    const id = xss(req.params.id);

    if (!isValidObjectId(id)) {
        return res.status(400).send("Invalid workout ID.");
    }

    try {
        const workout = await workoutFuncs.getWorkoutById(id);
        if (!workout) {
            return res.status(404).send("Workout not found.");
        }

        res.render("pages/Workouts/comments.handlebars", {
            title: "Comment",
            comments: workout.comments,
            id,
            loggedIn: true,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error while fetching comments.");
    }
});

router.post("/:id", async (req, res) => {
    const workoutId = xss(req.params.id);
    const text = xss(req.body.comment);
    const date = new Date();
    const userId = xss(req.session.user?.userId || "");

    if (!isValidObjectId(workoutId)) {
        return res.status(400).send("Invalid workout ID.");
    }
    if (!text) {
        return res.status(400).send("Comment text cannot be empty.");
    }
    if (!userId) {
        return res.status(401).send("User not authenticated.");
    }

    const commentId = uuidv4();
    const comment = {
        workoutId,
        text,
        date,
        userId,
        likes: 0,
        dislikes: 0,
        commentId,
        likedBy: [],
        dislikedBy: [],
    };

    try {
        const workout = await workoutCollection.findOne({ _id: new ObjectId(workoutId) });
        console.log(workout);
        workout.comments.push(comment);
        await workoutFuncs.updateWorkout(workoutId, workout.workoutType, workout.exercises, workout.comments);
        // REMOVE THIS FOR OLD VERSION
        res.redirect(`/search-workout/${workoutId}`);
        // res.redirect(`/comments/${workoutId}`);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error while adding comment.");
    }
});

router.post("/:commentId/:workoutId/toggle-like", async (req, res) => {
    const commentId = xss(req.params.commentId);
    const workoutId = xss(req.params.workoutId);
    const userId = xss(req.session.user?.userId || "");

    if (!isValidObjectId(workoutId)) {
        return res.status(400).send("Invalid workout ID.");
    }
    if (!userId) {
        return res.status(401).send("User not authenticated.");
    }

    try {
        const workout = await workoutCollection.findOne({ _id: new ObjectId(workoutId) });
        for (let comment of workout.comments) {
            if (comment.commentId === commentId) {
                if (!comment.likedBy) comment.likedBy = [];
                if (!comment.dislikedBy) comment.dislikedBy = [];

                if (comment.likedBy.includes(userId)) {
                    comment.likes--;
                    comment.likedBy = comment.likedBy.filter((id) => id !== userId);
                } else {
                    if (comment.dislikedBy.includes(userId)) {
                        comment.dislikes--;
                        comment.dislikedBy = comment.dislikedBy.filter((id) => id !== userId);
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
        res.status(500).send("Server error while toggling like.");
    }
});

router.post("/:commentId/:workoutId/toggle-dislike", async (req, res) => {
    const commentId = xss(req.params.commentId);
    const workoutId = xss(req.params.workoutId);
    const userId = xss(req.session.user?.userId || "");

    if (!isValidObjectId(workoutId)) {
        return res.status(400).send("Invalid workout ID.");
    }
    if (!userId) {
        return res.status(401).send("User not authenticated.");
    }

    try {
        const workout = await workoutCollection.findOne({ _id: new ObjectId(workoutId) });
        for (let comment of workout.comments) {
            if (comment.commentId === commentId) {
                if (!comment.dislikedBy) comment.dislikedBy = [];
                if (!comment.likedBy) comment.likedBy = [];

                if (comment.dislikedBy.includes(userId)) {
                    comment.dislikes--;
                    comment.dislikedBy = comment.dislikedBy.filter((id) => id !== userId);
                } else {
                    if (comment.likedBy.includes(userId)) {
                        comment.likes--;
                        comment.likedBy = comment.likedBy.filter((id) => id !== userId);
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
        res.status(500).send("Server error while toggling dislike.");
    }
});

export default router;

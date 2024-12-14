import { Router } from "express";
import { workoutData } from "../data/index.js";
import workouts from "../data/workouts.js";

const router = Router();

router.post("/", async (req, res) => {
  // console.log(req.body)
  // console.log(req.session.user)
  let { workoutType, description, exercises} = req.body
  const userId = req.session.user.userId
  exercises = exercises.split(",")
  try {
    await workoutData.createWorkout(workoutType, userId, exercises, description)
    res.redirect("/workouts/userWorkouts")
  } catch (error) {
    console.log(error.message)
  }
})

router.get("/userWorkouts", async (req, res) => {
  const userId = req.session.user.userId
  const results = await workoutData.getAllWorkoutsOfUserBilly(userId)
  // console.log(results)
  res.render("pages/Workouts/getAllWorkoutsOfUser", {title: "userWorkouts", workouts: results})
})

router.get("/workoutsPage", (req, res) => {
  if (!req.session.user || !req.session.user.userId) {
    console.log(req.session.user);
    console.log(req.session.user.userId);
    return res.redirect("/login");
  }
  //   console.log("Session data:", req.session);
  //   console.log("Session user:", req.session.user);
  //   console.log("Reached /create route");
  res.render("pages/workouts/workoutsPage", { loggedIn: true });
});

router.get("/createWorkout", (req, res) => {
  if (!req.session.user || !req.session.user.userId) {
    console.log(req.session.user);
    console.log(req.session.user?.userId);
    return res.redirect("/login");
  }
  res.render("pages/workouts/createWorkout", { loggedIn: true });
});

router.post("/createWorkout", async (req, res) => {
  const workout = req.body;

  if (!req.session.user || !req.session.user.userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  const userId = req.session.user.userId;

  if (!workout || Object.keys(workout).length === 0) {
    return res
      .status(400)
      .json({ error: "There are no fields in the request body" });
  }

  try {
    const newWorkout = await workoutData.createWorkout(
      workout.workoutType,
      userId,
      workout.exercises,
      workout.description
    );
    res.redirect(`/workouts/${newWorkout._id}`);
  } catch (e) {
    res
      .status(500)
      .render("pages/workouts/createWorkout", { error: e.message });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id
    const result = await workoutData.removeWorkout(id)
    res.redirect("/userWorkouts")
  } catch (error) {
    console.log(error.message)
  }
});

export default router;
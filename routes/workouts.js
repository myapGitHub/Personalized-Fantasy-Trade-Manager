import { Router } from "express";
import { workoutData } from "../data/index.js";

const router = Router();

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

export default router;

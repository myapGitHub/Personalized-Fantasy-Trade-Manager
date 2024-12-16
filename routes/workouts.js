import { Router } from "express";
import { workoutData } from "../data/index.js";
import workouts from "../data/workouts.js";
import xss from 'xss';

const router = Router();

router.get("/", async (req, res) => {
  res.redirect("/workouts/workoutsPage")
})

router.post("/", async (req, res) => {
  try {
    console.log(req.body);
    
    // let { workoutName, workoutType, exerciseName, sets, reps, weight, rating} = xss(req.body);

    const userId = req.session.user.userId;

    const workoutName = xss(req.body.workoutName);
    const workoutType = xss(req.body.workoutType);
    //const exerciseName = xss(req.body.exerciseName);
    let exerciseNames = req.body.exerciseName
    const sets = parseInt(xss(req.body.sets));
    const reps = parseInt(xss(req.body.reps));
    const weight = parseFloat(xss(req.body.weight));
    const rating = parseInt(xss(req.body.rating));
    const info = req.body
    //const exercises = []

    if (!Array.isArray(exerciseNames)) {
      exerciseNames = [exerciseNames]; // Convert to array if it's not
    }
    //for (let i = 0; i < info.exerciseName.length; i++) {
     // let exercise = {name: info.exerciseName[i], sets, reps, weight, rating}
     // exercises.push(exercise)
    //}
    const exercises = exerciseNames.map(name => ({
      name: xss(name),
      sets: sets,
      reps: reps,
      weight: weight,
      rating: rating
    }));
    // const exercises = [{
    //   name: exerciseName,
    //   sets: sets,
    //   reps: reps,
    //   weight: weight
    // }];
    console.log(exercises)
    await workoutData.createWorkoutPlan(userId, workoutName, workoutType, exercises, rating);
    res.redirect("/workouts/userWorkouts");

  } catch (error) {
    console.log(error.message)
  }
});

router.get("/public", async (req, res) => {
  const userId = req.session.user.userId;
  const results = await workoutData.getAllPublicWorkouts();
  const streakData = await workoutData.getUserStreak(userId);
  // console.log(results)
  res.render("pages/Workouts/allWorkouts", {workouts: results})

})

router.get("/userWorkouts", async (req, res) => {
  const userId = req.session.user.userId;
  const results = await workoutData.getAllWorkoutsOfUserBilly(userId);
  const streakData = await workoutData.getUserStreak(userId);
  // console.log(results)
  res.render("pages/Workouts/savedWorkouts", {
    title: "userWorkouts",
    workouts: results,
  });
});

router.get("/workoutsPage", async (req, res) => {
  if (!req.session.user || !req.session.user.userId) {
    console.log(req.session.user);
    console.log(req.session.user.userId);
    return res.redirect("/login");
  }

  const userId = req.session.user.userId;
  const streakData = await workoutData.getUserStreak(userId);
  //   console.log("Session data:", req.session);
  //   console.log("Session user:", req.session.user);
  //   console.log("Reached /create route");
  res.render("pages/workouts/workoutsPage", { loggedIn: true, streakCount: streakData.streakCount});
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
  const workout = xss(req.body);

  console.log(workout);

  if (!req.session.user || !req.session.user.userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  const userId = xss(req.session.user.userId);

  if (!workout || Object.keys(workout).length === 0) {
    return res
      .status(400)
      .json({ error: "There are no fields in the request body" });
  }

  try {
    const exercises = [
      {
        name: workout.exerciseName,
        sets: parseInt(workout.sets),
        reps: parseInt(workout.reps),
        weight: parseFloat(workout.weight),
      },
    ];
    const newWorkout = await workoutData.createWorkoutPlan(
      userId,
      workout.workoutName,
      workout.workoutType,
      exercises,
      workout.rating
    );

    const updatedStreak = await workoutData.updateUserStreak(userId);

    console.log("Updated Streak: ", updatedStreak);
    // console.log("New Workout in Routes: " + newWorkout);
    res.redirect(`/workouts/${newWorkout._id}`);
  } catch (e) {
    res
      .status(500)
      .render("pages/workouts/createWorkout", { error: e.message });
  }
});


router.get("/:id&u=:userId"), async (req, res) => {
  const workout = await workoutData.getWorkoutById(req.params.id);
  res.render("/pages/Workouts/getWorkoutById", {workout : workout});
}

  router.get("/:id"), async (req, res) => { // planning to add an id for the workouts user after users
  try {
    const id = xss(req.params.id);
    const workout = await workoutData.getWorkoutById(id);
    res.redirect(`/${id}&u=${workout.userId}`);
  } catch(e){
    console.log(error.message)
  }
}


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

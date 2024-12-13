import workoutRoutes from "./workouts.js";
import signupRoutes from "./signup.js";
import signinRoutes from './signin.js';
import authRoutes from './auth.js';
import settingRoutes from './settings.js';
import commentRoutes from './comments.js';

export const constructorMethod = (app) => {
  app.use('/', authRoutes);
  app.use('/signup', signupRoutes);
  app.use('/signin', signinRoutes);
  app.use('/settings', settingRoutes);
  app.use("/comments", commentRoutes);

  app.use("/workouts", workoutRoutes);
  app.use("*", (req, res) => {
    res.sendStatus(404);
  });
};

export default constructorMethod;

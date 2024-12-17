import { dbConnection, closeConnection } from '../config/mongoConnection.js';
import { workoutData } from "../data/index.js";
import { userData } from "../data/index.js";

const db = await dbConnection();
await db.dropDatabase();

const tyler = await userData.signUp('tspeedy', 'password', 'Tyler', 'Speedy', 50, 50, 50, 'male', 1, 1, 1, 1);
const tid = tyler.userId;

const jimmy = await userData.signUp('jmurphy', 'password', 'James', 'Murphy', 50, 50, 50, 'male', 1, 1, 1, 1);
const jid = tyler.userId;

const workoutOne = await workoutData.createWorkoutPlan('tspeedy', 'Workout', 'Bench', [{ name: 'Bench', sets: 1, reps: 1, weight: 121 }, { name: 'Squat', sets: 1, reps: 1, weight: 121 }], 3);
const workoutTwo = await workoutData.createWorkoutPlan('tspeedy', 'Workout2', 'Squat', [{ name: 'Squat', sets: 1, reps: 1, weight: 121 }, { name: 'Deadlift', sets: 1, reps: 1, weight: 121 }], 2);
const workoutThree = await workoutData.createWorkoutPlan('jmurphy', 'Workout3', 'Deadlift', [{ name: 'Deadlift', sets: 1, reps: 1, weight: 121 }],);

await closeConnection();

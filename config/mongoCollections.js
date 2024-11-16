import { dbConnection } from './mongoConnection.js';

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

// Create users, workouts, comments collections
export const users = getCollectionFn('users');
export const workouts = getCollectionFn('workouts');
export const comments = getCollectionFn('comments');

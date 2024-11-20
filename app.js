import express from 'express';
const app = express();
import { constructorMethod } from './routes/index.js';

app.use(express.json());


constructorMethod(app);

app.listen(3000, () => {
    console.log("Our Server is running");
    console.log("Server running on http://localhost:3000");
});




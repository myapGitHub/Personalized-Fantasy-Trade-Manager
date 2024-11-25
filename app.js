import express from 'express';
const app = express();
import { constructorMethod } from './routes/index.js';
import exphbs from 'express-handlebars';
import * as authMiddlware from './middlewares/auth.js';



// static files and allows parsing of req
app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// setup handlebars
app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');



// middleware
// 1) hides the login and sign-up button if the user is already logged in 
app.use(authMiddlware.isLogin);


// sets up routes
constructorMethod(app);


// starts the server
app.listen(3000, () => {
    console.log("Our Server is running");
    console.log("Server running on http://localhost:3000");
});




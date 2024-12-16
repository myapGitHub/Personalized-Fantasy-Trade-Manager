import express from "express";
const app = express();
import { constructorMethod } from "./routes/index.js";
import exphbs from "express-handlebars";
import session from "express-session";

// static files and allows parsing of req
app.use("/public", express.static("public"));
app.use('/static', express.static("static"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// setup handlebars
app.engine("handlebars", exphbs.engine({ 
  defaultLayout: "main",
  helpers: {
    eq: function (a, b) {
      return a === b;
    },
    gt: function (a,b) {
      return a > b;
    }
  },
}));
app.set("view engine", "handlebars");

// middleware
app.use(
  session({
    name: "WorkoutApp",
    secret: "The Party Never Ends",
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 30 * 60 * 1000},
  })
);

app.use('/', (req, res, next) => {
  console.log(new Date().toUTCString());
  console.log(req.method);
  console.log(req.originalUrl);

  if (req.originalUrl === '/') {
    if (req.session.user) {
      req.session.cookie.maxAge = 30 * 60 * 1000;
      return res.redirect('/dashboard');
    } else {
      return res.redirect('/home');
    }
  }
  next();
});

// SIGN/SIGNIN UP MIDDLEWARE
app.use('/signin', (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  next();
})

app.use('/signup', (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  next();
})
// DASHBOARDS MIDDLEWARES
app.use('/home', (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  next();
})

app.use('/dashboard', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/home');
  }
  req.session.cookie.maxAge = 30 * 60 * 1000;
  next();
})

app.use('/signout', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/signin');
  }
  next();
})
// WORKOUT MIDDLEWARES
app.use("/workouts", (req, res, next) => {
  // console.log("Middleware for /workouts");
  // console.log("Session:", req.session);
  if (!req.session.user) {
    return res.redirect("/signup");
  } else {
    next();
  }
});


// SETTINGS MIDDLEWARES
app.use('/settings', (req, res, next) => {
  if (req.originalUrl === '/settings') {
    if (!req.session.user) {
      return res.redirect("/signin");
    } else {
      return res.redirect('/settings/account');
    }
  }
  next();
})
app.use('/settings/account', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/signin');
  }
  next();
})

app.use('/settings/delete', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/signin');
  }
  next();
})

// SEARCHING MIDDLEWARE
app.use('/search-user', (req,res,next) => {
  if (!req.session.user) {
    return res.redirect('/signin');
  }
  next();
})
app.use('/search-workout', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/signin');
  }
  next();
})
// FRIEND MIDDLEWARE
app.use('/friends', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/signin');
  }
  next();
})

// sets up routes
constructorMethod(app);

// starts the server
app.listen(3000, () => {
  console.log("Our Server is running");
  console.log("Server running on http://localhost:3000");
});

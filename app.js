import express from "express";
const app = express();
import { constructorMethod } from "./routes/index.js";
import exphbs from "express-handlebars";
import session from "express-session";

// static files and allows parsing of req
app.use("/public", express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// setup handlebars
app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// middleware
app.use(
  session({
    name: "WorkoutApp",
    secret: "Billy is a freak",
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 60000 },
  })
);

app.use("/private", (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/");
  } else {
    next();
  }
});

app.use("/login", (req, res, next) => {
  if (req.session.user) {
    return res.redirect("/private");
  } else {
    next();
  }
});

app.use("/sign-up", (req, res, next) => {
  if (req.session.user) {
    return res.redirect("/private");
  } else {
    next();
  }
});

app.use("/workouts", (req, res, next) => {
  // console.log("Middleware for /workouts");
  // console.log("Session:", req.session);
  if (!req.session.user) {
    return res.redirect("/sign-up");
  } else {
    next();
  }
});

// sets up routes
constructorMethod(app);

// starts the server
app.listen(3000, () => {
  console.log("Our Server is running");
  console.log("Server running on http://localhost:3000");
});

import path from "path";
import signupRoutes from "./sign-up.js";
import signinRoutes from "./login.js";
import privateRoutes from "./private.js";

export const constructorMethod = (app) => {
  app.use("/sign-up", signupRoutes);
  app.use("/login", signinRoutes);
  app.use("/private", privateRoutes);
  app.use("/logout", async (req, res) => {
    req.session.destroy();
    res.redirect("/");
  });
  app.use("/", (req, res) => {
    res.render("pages/home", { loggedIn: req.isLoggedIn, user: req.user });
    //res.render('pages/home', {loggedIn: true, user: req.user});
  });
  app.use("*", (req, res) => {
    res.redirect("/");
  });
};

export default constructorMethod;

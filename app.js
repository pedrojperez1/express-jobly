/** Express app for jobly. */
const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const ExpressError = require("./helpers/expressError");
const { authenticateJWT } = require("./middleware/auth");

const app = express();

// allow both form-encoded and json body parsing
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// allow connections to all routes from any browser
app.use(cors());

// add logging system
app.use(morgan("tiny"));

// import routes
const companyRoutes = require("./routes/companies");
const jobRoutes = require("./routes/jobs");
const userRoutes = require("./routes/users");
const loginRoutes = require("./routes/login");
// use routes
app.use(authenticateJWT);
app.use("/jobs", jobRoutes);
app.use("/companies", companyRoutes);
app.use("/users", userRoutes);
app.use("/login", loginRoutes);

/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.error(err.stack);

  return res.json({
    status: err.status,
    message: err.message
  });
});

module.exports = app;

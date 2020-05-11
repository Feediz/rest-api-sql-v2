"use strict";

// load modules
const express = require("express");
const morgan = require("morgan");

const { sequelize } = require("./models");

// user routes
const usersRoutes = require("./routes/users");

// course routes
const courseRoutes = require("./routes/courses");

// connect to db
sequelize
  .authenticate()
  .then(() => {
    console.log("Connected to DB!");
  })
  .then(() => sequelize.sync())
  .catch((er) => {
    console.error("ERROR: No DB Connection: ", er);
  });

// variable to enable global error logging
const enableGlobalErrorLogging =
  process.env.ENABLE_GLOBAL_ERROR_LOGGING === "true";

// create the Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// setup morgan which gives us http request logging
app.use(morgan("dev"));

// setup a friendly greeting for the root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the REST API project!",
  });
});

app.use("/api", usersRoutes);
app.use("/api", courseRoutes);

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: "Route Not Found",
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set("port", process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get("port"), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});

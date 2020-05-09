const express = require("express");
const { check, validationResult } = require("express-validator/check");
const router = express.Router();
const User = require("../models").User;
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const bcryptjs = require("bcryptjs");
const auth = require("basic-auth");

// async handler function to wrap each route
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  };
}

const authenticateUser = async (req, res, next) => {
  let message = null;

  const allUsers = await User.findAndCountAll();

  // parse user's credentials from the authorization header
  const credentials = auth(req);
  console.log(`header info: ${credentials}`);

  // if the user's credentials are available ...
  if (credentials && allUsers) {
    // attempt to retrieve the user from the data store
    // by their username (i.e. the user's 'key'
    // from the authorization header).

    const user = await allUsers.rows.find(
      (u) => u.username === credentials.emailAddress
    );

    // if a user was successfully retrieved from the data store...
    if (user) {
      // hash password to compare with hashed password in database
      const authenticated = bcryptjs.compareSync(
        credentials.pass,
        user.password
      );

      // if the passwords match
      if (authenticated) {
        console.log(
          `Authentication successful for email: ${user.emailAddress}`
        );

        // we store the retrieved user object on the request object
        req.currentUser = user;
      } else {
        message = `Authentication failed for email: ${credentials.emailAddress}`;
      }
    } else {
      message = `User not found for email: ${credentials.emailAddress}`;
    }
  } else {
    message = "Auth header not found";
  }

  // if user authentication failed ...
  if (message) {
    console.warn(message);

    // return a response with a 401 unauthorized status
    res.status(401).json({ message: "Access Denied" });
  } else {
    next();
  }
};

// routes
/**
 * @route /users
 * @method get
 */
//router.get('/users', asyncHandler(async (req, res) => {}));
router.get(
  "/users",
  authenticateUser,
  asyncHandler(async (req, res) => {
    //res.send("hello");
    const users = await User.findAndCountAll();
    res.send(users);
  })
);

router.get(
  "/users/test",
  asyncHandler(async (req, res) => {
    const allUsers = await User.findAndCountAll();
    for (let [key, value] of Object.entries(allUsers)) {
      console.log(`${key}: ${value}`);
    }
    res.send(allUsers.rows);
  })
);
const validateUsers = [
  check("firstName")
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "firstName"'),
  check("lastName")
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "lastName"'),
  check("emailAddress")
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "emailAddress"'),
  check("password")
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "password"'),
];
/**
 * @route /users
 * @method post
 */
router.post(
  "/users",
  validateUsers,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    let user;

    if (!errors.isEmpty()) {
      const errMsg = errors.array().map((err) => err.msg);

      // return the validation errors to client
      res.status(400).json({ errors: errMsg });
    } else {
      try {
        req.body.password = bcryptjs.hashSync(req.body.password);
        user = await User.create(req.body);
        if (user) {
          res.status(201).redirect("/");
        }
      } catch (er) {
        if (er.name === "SequelizeValidationError") {
        } else {
          throw er; // error will be caught in the asyncHandler's catch block
        }
      }
    }
  })
);
module.exports = router;

const express = require("express");
const { check, validationResult } = require("express-validator/check");
const router = express.Router();
//const User = require("../models").User;
const { Course, User } = require("../models");
const bcryptjs = require("bcryptjs");

// helper function to check if user is authenticated
const authenticateUser = require("../helper/authenticateUser");

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

// routes
/**
 * @route /users
 * @method get
 */
router.get(
  "/users",
  authenticateUser,
  asyncHandler(async (req, res) => {
    const user = req.currentUser;
    if (user) {
      const userInfo = {};
      userInfo.firstName = user.firstName;
      userInfo.lastName = user.lastName;
      userInfo.emailAddress = user.emailAddress;
      res.json(userInfo);
    }
  })
);

// validate posted values
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
  check("emailAddress")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
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
          res.location(`/`).status(201).end();
        }
      } catch (er) {
        throw er;
      }
    }
  })
);
module.exports = router;

const express = require("express");
const { check, validationResult } = require("express-validator/check");
const router = express.Router();
const User = require("../models").User;
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

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
//router.get('/users', asyncHandler(async (req, res) => {}));
router.get(
  "/users",
  asyncHandler(async (req, res) => {
    //res.send("hello");
    const users = await User.findAndCountAll();
    res.send(users);
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
        user = await User.create(req.body);
        if (user) {
          res.status(201).redirect("/");
        }
      } catch (er) {
        if (err.name === "SequelizeValidationError") {
        } else {
          throw error; // error will be caught in the asyncHandler's catch block
        }
      }
    }
  })
);
module.exports = router;

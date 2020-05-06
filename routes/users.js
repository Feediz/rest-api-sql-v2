const express = require("express");
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

/**
 * @route /users
 * @method post
 */
router.post(
  "/users",
  asyncHandler(async (req, res) => {
    let user;
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
  })
);
module.exports = router;

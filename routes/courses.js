const express = require("express");
const { check, validationResult } = require("express-validator/check");
const router = express.Router();
const Course = require("../models").Course;
const User = require("../models").User;
const Sequelize = require("sequelize");

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
 * @route /courses
 * @method get
 */
router.get(
  "/courses",
  asyncHandler(async (req, res) => {
    // Returns a list of courses (including the user that owns each course)
    const courses = await Course.findAndCountAll();
    res.send(courses);
  })
);

/**
 * @route /courses/:id
 * @method get
 */
router.get(
  "/courses/:id",
  asyncHandler(async (req, res) => {
    // Returns a the course (including the user that owns the course) for the provided course ID
    const courses = await Course.findByPk(req.params.id);
    res.send(courses);
  })
);

// validate posted values
const validateCourse = [
  check("title")
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "title"'),
  check("description")
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "description"'),
];
/**
 * @route /courses
 * @method post
 */
router.post(
  "/courses",
  authenticateUser,
  validateCourse,
  asyncHandler(async (req, res) => {
    // Creates a course, sets the Location header to the URI for the course, and returns no content
    const errors = validationResult(req);

    // check if we have validation errors
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);

      // return the validation errors to client
      res.status(400).json({ errors: errorMessages });
    } else {
      let course;
      try {
        course = Course.create(req.body);
        if (course) {
          res.status(201).send("");
        } else {
          res.status(404).send("");
        }
      } catch (er) {
        throw er;
      }
    }
  })
);

/**
 * @route /courses:id
 * @method put
 */
router.put(
  "/courses/:id",
  authenticateUser,
  validateCourse,
  asyncHandler(async (req, res) => {
    //Updates a course and returns no content
    const errors = validationResult(req);

    // check if we have validation errors
    if (!errors.isEmpty()) {
      const errorMsgs = errors.array().map((err) => err.msg);

      // return the validation errors to client
      res.status(400).json({ errors: errorMsgs });
    } else {
      let course;
      try {
        course = await Course.findByPk(req.params.id);
        if (course) {
          await course.update(req.body);
        } else {
          res.sendStatus(404);
        }
      } catch (err) {
        throw err;
      }
      res.status(204).send("");
    }
  })
);

/**
 * @route /courses:id
 * @method delete
 */
router.delete(
  "/courses/:id",
  authenticateUser,
  asyncHandler(async (req, res) => {
    //Deletes a course and returns no content
    try {
      let course = await Course.findByPk(req.params.id);
      if (course) {
        course.destroy();
        res.status(204).send("/");
      } else {
        res.status(404).send("");
      }
    } catch (er) {
      throw er;
    }
  })
);

module.exports = router;

const express = require("express");
const { check, validationResult } = require("express-validator/check");
const router = express.Router();
const { Course, User } = require("../models");

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
    // Returns a list of courses (including the user id that owns each course)
    const courses = await Course.findAndCountAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["firstName", "lastName", "emailAddress"],
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });
    res.json(courses.rows);
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
    const courses = await Course.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["firstName", "lastName", "emailAddress"],
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });
    //delete courses.dataValues.password;
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
        course = await Course.create(req.body);
        if (course) {
          //res.status(201).send("");
          res.location(`/courses/${course.id}`).status(201).end();
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

    // id of user requesting to make course changes
    const requestorUserId = req.currentUser.id;

    // check if we have validation errors
    if (!errors.isEmpty()) {
      const errorMsgs = errors.array().map((err) => err.msg);

      // return the validation errors to client
      res.status(400).json({ errors: errorMsgs });
    } else {
      let course;

      // grab course to be updated from database
      course = await Course.findByPk(req.params.id);

      if (course) {
        // id of user who owns the course being updated
        let courseOwnerId = course.userId;

        // if requestor is as owner, allow update
        if (requestorUserId === courseOwnerId) {
          await course.update(req.body);
          res.status(204).send("");
        } else {
          // requestor not authenticated to make changes
          res.status(403).send("");
        }
      } else {
        // course not found
        res.sendStatus(404);
      }
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
    // id of user requesting to delete course
    const requestorUserId = req.currentUser.id;

    //Deletes a course and returns no content
    try {
      let course = await Course.findByPk(req.params.id);
      if (course) {
        // id of user who owns the course being deleted
        let courseOwnerId = course.userId;

        // if requestor is as owner, allow deletion
        if (requestorUserId === courseOwnerId) {
          course.destroy();
          res.status(204).send("/");
        } else {
          // requestor not authenticated to delete
          res.status(403).send("");
        }
      } else {
        // course not found
        res.status(404).send("");
      }
    } catch (er) {
      throw er;
    }
  })
);

module.exports = router;

const User = require("../models").User;
const bcryptjs = require("bcryptjs");
const auth = require("basic-auth");

const authenticateUser = async (req, res, next) => {
  let message = null;

  // parse user's credentials from the authorization header
  const credentials = auth(req);

  // if the user's credentials are available ...
  if (credentials) {
    // attempt to retrieve the user from the data store
    // by their username (i.e. the user's 'key'
    // from the authorization header).
    const _user = await User.findAndCountAll({
      where: {
        emailAddress: credentials.name,
      },
    });
    let user = _user.rows[0];

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
    // if user authenticated call next process in the flow
    next();
  }
};

module.exports = authenticateUser;

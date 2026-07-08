const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  const { name, email, password } = req.body;

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        name: name,
        email: email,
        password: hashedPassword,
        posts: [],
      });
      return user.save();
    })
    .then((result) => {
      res.status(201).json({ message: "User created!", userId: result._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// exports.login = (req, res, next) => {
//   const { email, password } = req.body;
//   let loadedUser;

//   User.findOne({ email })
//     .then((user) => {
//       if (!user) {
//         const error = new Error("A user with this email could not be found.");
//         error.statusCode = 401;
//         throw error;
//       }
//       loadedUser = user;
//       return bcrypt.compare(password, user.password);
//     })
//     .then((isEqual) => {
//       if (!isEqual) {
//         const error = new Error("Wrong password             !");
//         error.statusCode = 401;
//         throw error;
//       }
//       const token = jwt.sign(
//         {
//           email: loadedUser.email,
//           userId: loadedUser._id.toString(),
//         },
//         "somesupersecretsecret",
//         { expiresIn: "1h" },
//       );
//       res.status(200).json({
//         message: "Logged in successfully.",
//         token: token,
//         userId: loadedUser._id.toString(),
//       });
//     })
//     .catch((err) => {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//       }
//       next(err);
//     });
// };

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // 1. Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("A user with this email could not be found.");
      error.statusCode = 401;
      throw error;
    }

    // 2. Validate the password
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong password             !");
      error.statusCode = 401;
      throw error;
    }

    // 3. Generate the JWT token
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      "somesupersecretsecret",
      { expiresIn: "1h" },
    );

    // 4. Return success response
    res.status(200).json({
      message: "Logged in successfully.",
      token: token,
      userId: user._id.toString(),
    });
    return;
  } catch (err) {
    // 5. Forward errors cleanly to your Express error middleware
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
    return err; // Return the error for testing purposes
  }
};

exports.getUserStatus = async (req, res, next) => {
  const userId = req.userId;

  try {
    // 1. Fetch user by ID
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    // 2. Respond with user status
    res.status(200).json({ status: user.status });
  } catch (err) {
    // 3. Catch errors and forward to global error handler
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

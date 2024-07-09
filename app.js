var createError = require("http-errors");
var express = require("express");
const {
  query,
  validationResult,
  matchedData,
  body,
} = require("express-validator");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// Set up mongoose connection
// const mongoose = require("mongoose");
// mongoose.set("strictQuery", false);
// const mongoDB = process.env.DATABASE_URL;

// main().catch((err) => console.log(err));
// async function main() {
//   await mongoose.connect(mongoDB);
//   console.log("Pinged your deployment. You successfully connected to MongoDB!");
// }

// Simulated database for checking uniqueness
const existingUsers = [{ userId: "123", email: "existing@example.com" }];

// Helper function to check uniqueness
const isUnique = (field, value) => {
  return !existingUsers.some((user) => user[field] === value);
};

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// Route definition with validation and sanitization
app.post(
  "/api/users",
  [
    // Validate and sanitize the userId field
    body("userId")
      .notEmpty()
      .withMessage("User ID must not be null")
      .custom((value) => {
        if (!isUnique("userId", value)) {
          throw new Error("User ID must be unique");
        }
        return true;
      }),

    // Validate and sanitize the firstName field
    body("firstName").notEmpty().withMessage("First Name must not be null"),

    // Validate and sanitize the lastName field
    body("lastName").notEmpty().withMessage("Last Name must not be null"),

    // Validate and sanitize the email field
    body("email")
      .notEmpty()
      .withMessage("Email must not be null")
      .isEmail()
      .withMessage("Please enter a valid email address")
      .custom((value) => {
        if (!isUnique("email", value)) {
          throw new Error("Email must be unique");
        }
        return true;
      }),

    // Validate and sanitize the password field
    body("password").notEmpty().withMessage("Password must not be null"),

    // Validate and sanitize the phone field
    body("phone").optional().isString().withMessage("Phone must be a string"),
  ],

  (req, res) => {
    //Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Map errors to the required format
      const formattedErrors = errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      }));

      // Return the validation errors with status code 422
      return res.status(422).json({ errors: formattedErrors });
    }

    // Proceed with your logic if validation passes
    res.status(201).send("User is valid and can be processed");
  }
);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

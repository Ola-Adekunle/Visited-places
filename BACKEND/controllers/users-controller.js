// const { v7: uuidv7 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require("../models/user");
/*
  let USERS = [
    {
      id: "u1",
      fName: "Jack",
      lName: "Bauer",
      email: "anonymous@gmail.com",
      userName: "JackBauer",
      password: "password to be taught",
      profilePicture:
        "https://as1.ftcdn.net/v2/jpg/05/16/27/58/1000_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg",
      places: 5,
    },
  ];
*/

const getUsers = async (req, res, next) => {
  // res.json({ user: USERS });

  let users;
  try {
    users = User.find({}, "-password");
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later.",
      500
    );
    return next(error);
  }

  res.json({
    user: (await users).map((user) => user.toObject({ getters: true })),
  }); //find returns and array, so the need of .map
};

const signUp = async (req, res, next) => {
  const errors = validationResult(req);
  /*
    if(!errors.isEmpty()) {
      console.log(errors);
      throw new HttpError('Invalid inputs passed, please check you data', 422);
    };
    const { fName, lName, email, userName, password, image, places } = req.body;

    const existingUser = USERS.find((u) => u.email === email);

    if (existingUser) {
      throw new HttpError("Could not create account, user already exists.", 422);
    };

    const createdUser = {
      id: uuidv7(),
      fName,
      lName,
      email,
      userName,
      password,
      profilePicture: image,
      places,
    };
    
    USERS.push(createdUser);
    res.status(201).json({ user: createdUser });
  */

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check you data", 422)
    );
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later",
      500
    );
    return next(error);
  }

  if (existingUser) {
    return next(
      new HttpError("Could not create account, user already exists.", 422)
    );
  }

  const createdUser = new User({
    name,
    email,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnSA1zygA3rubv-VK0DrVcQ02Po79kJhXo_A&s",
    password,
    places: []
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not create an account.",
      500
    );
    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
  //getters: true removes the underscore in front of the id property.
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  /*
    const identifiedUser = USERS.find((u) => u.email === email);
    if (!identifiedUser || identifiedUser.password !== password) {
      throw new HttpError(
        "Could not identify user, credentials seams to be wrong.",
        401
      );
    }
  */

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "logging in failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }

  res.json({ message: "Logged in!" });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;

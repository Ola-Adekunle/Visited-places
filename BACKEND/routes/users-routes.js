const express = require("express");
const { body } = require("express-validator");

const usersController = require("../controllers/users-controller");

const router = express.Router();

router.get("/", usersController.getUsers);

router.post(
  "/signup",
  [
    // body("userName").not().isEmpty(),
    body("name").not().isEmpty(),
    body("email").normalizeEmail().isEmail(),
    body("password").isLength({ min: 5 }),
  ],
  usersController.signUp
);

router.post("/login", usersController.login);

module.exports = router;

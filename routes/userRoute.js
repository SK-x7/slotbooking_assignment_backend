const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController")


router.route("/:username").get(userController.checkUserExists).post(userController.createUser);
router.route("/signup").post(userController.createUser);
router.route("/").post(userController.loginUser);

module.exports = router
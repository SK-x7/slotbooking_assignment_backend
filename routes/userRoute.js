const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController")


router.route("/:username").get(userController.checkUserExists).post(userController.createUser);

module.exports = router
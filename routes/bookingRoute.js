const express = require('express');
const router = express.Router();
const bookingController = require("../controllers/bookingController")

// router.route("/").get(bookingController.getAllTables)
router.route("/").post(bookingController.createBooking);
router.route("/:username").get(bookingController.getBookingOfUser);
// router.route("/test/:tableId").get(bookingController.getAvailableSlots);

module.exports = router
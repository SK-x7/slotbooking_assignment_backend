const express = require('express');
const router = express.Router();
const tableController = require("../controllers/tableController")

router.route("/").get(tableController.getAllTables)
router.route("/:tableId").get(tableController.getTable);
router.route("/getAvailability/:tableId").get(tableController.getAvailableSlots);

module.exports = router
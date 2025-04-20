const express = require("express");
const router = express.Router();

// ...import các route con nếu có...

router.get("/", (req, res) => {
  res.send("API is running");
});

module.exports = router;

const express = require("express");
const router = express.Router();

router.post("/user", async (req, res) => {
  try {
    res.status(200).json({ error: false, data: "Hello Friends" });
  } catch (error) {
    res.status(500).json({ error: true, data: "Server Internal Error" });
  }
});

module.exports = router;

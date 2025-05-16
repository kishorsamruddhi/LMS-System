const express = require("express");
const router = express.Router();
const User = require("./_user.model");

router.post("/send", async (req, res) => {
  try {
    const _id = req.user;
    const user = await User.findById(_id, { connectedTo: 1 }).lean();

    if (!user) {
      return res.status(404).json({
        error: true,
        data: "User not found with these creadentials!",
      });
    }

    const listenerCode = req.headers["app-listener-id"];
    if (!listenerCode) {
      return res.status(404).json({
        error: true,
        data: "Add Listner creadential!",
      });
    }

    const listener = await User.findOne(
      { listeningCode: listenerCode },
      { connectedTo: 1 }
    ).lean();

    if (!listener) {
      return res.status(404).json({
        error: true,
        data: "Listner with these creadential not found!",
      });
    }

    res.status(200).json({
      error: false,
      data: {
        listener,
        listenerCode,
        user,
      },
    });
  } catch (err) {
    res.status(500).json({ error: true, data: err.message });
  }
});

module.exports = router;

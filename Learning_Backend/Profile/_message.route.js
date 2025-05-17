const express = require("express");
const router = express.Router();
const User = require("./_user.model");
const Chat = require("./_member.model");
const extractToken = require("./middleware");

router.get("/get", extractToken, async (req, res) => {
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

    const haveFriend = user?.connectedTo.length > 0;
    const friends = haveFriend
      ? user?.connectedTo?.find(
          (doc) => doc.user.toString() === listener._id.toString()
        )
      : null;

    let chatId = friends?.chat || null;

    if (!friends) {
      res.status(200).json({
        error: false,
        data: [],
      });
    }

    const data = await Chat.findById(chatId, { messages: 1 })
      .populate({ path: "messages.user", select: "email" })
      .lean();

    res.status(200).json({
      error: false,
      data: data.messages,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: true, data: "Error on Server", message: err.message });
  }
});

router.post("/send", extractToken, async (req, res) => {
  try {
    const _id = req.user;
    const { text } = req.body;
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

    const haveFriend = user?.connectedTo.length > 0;
    const friends = haveFriend
      ? user?.connectedTo?.find(
          (doc) => doc.user.toString() === listener._id.toString()
        )
      : null;

    let chatId = friends?.chat || null;

    if (!friends) {
      const val = await establishConnection(user, listener, text);
      if (val.error) throw new Error(val.error);
      chatId = val.data._id;
    }

    const data = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { messages: { text, user: user._id } },
      },
      { new: true }
    )
      .populate({ path: "messages.user", select: "email" })
      .lean();

    res.status(200).json({
      error: false,
      data: data.messages,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: true, data: "Error on Server", message: err.message });
  }
});

router.post("/one-way-message", async (req, res) => {
  try {
    const { text, username } = req.body;

    const listenerCode = req.headers["app-listener-id"];
    if (!listenerCode) {
      return res.status(404).json({
        error: true,
        data: "Add Listner creadential!",
      });
    }

    const listener = await User.findOneAndUpdate(
      { listeningCode: listenerCode },
      {
        $push: {
          unknownChat: {
            text,
            username,
          },
        },
      }
    ).lean();

    if (!listener) {
      return res.status(404).json({
        error: true,
        data: "Listner with these creadential not found!",
      });
    }

    res.status(200).json({
      error: false,
      data: "Message sent",
    });
  } catch (err) {
    res.status(500).json({ error: true, data: "Error on Server" });
  }
});

async function establishConnection(user, listener, text) {
  try {
    const chat = new Chat({
      members: [user._id, listener._id],
    });

    const chat_doc = await chat.save();

    await User.findByIdAndUpdate(
      user._id,
      {
        $push: {
          connectedTo: { user: listener._id, chat: chat._id },
        },
      },
      {
        new: true,
      }
    );
    await User.findByIdAndUpdate(
      listener._id,
      {
        $push: {
          connectedTo: { user: user._id, chat: chat._id },
        },
      },
      {
        new: true,
      }
    );
    return { error: false, data: chat_doc };
  } catch (error) {
    return { error: error.message, data: null };
  }
}

module.exports = router;

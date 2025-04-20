const express = require("express");
const connectMongo = require("../../src/lib/mongoose");
const Note = require("../models/Note.model.cjs");
const authMiddleware = require("../auth.middleware");
const router = express.Router();

// Create a new note
router.post("/", authMiddleware, async (req, res) => {
  try {
    await connectMongo();
    const { _id: userId } = req.user;
    const { title, content, visibility, tags } = req.body;
    const tagsArray =
      typeof tags === "string"
        ? tags.split(",").map((tag) => tag.trim())
        : tags;
    const note = new Note({
      title,
      content,
      userId,
      visibility,
      tags: tagsArray,
    });
    await note.save();
    res.status(201).json({ message: "Note created successfully", note });
  } catch (error) {
    console.error("Error in creating note:", error.message);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});
// Get all notes created by the authenticated user
router.get("/my-notes", authMiddleware, async (req, res) => {
  try {
    await connectMongo();
    const { _id } = req.user;
    const notes = await Note.find(
      { userId: _id },
      { content: 1, updatedAt: 1, title: 1, tags: 1, content: 1, visibility: 1 }
    );
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in fetching user's notes:", error.message);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Get all notes for a user
router.get("/:userId", async (req, res) => {
  try {
    await connectMongo();
    const userId = req.params.userId;
    const notes = await Note.find({ userId: userId });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in fetching notes:", error.message);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Update a note
router.put("/:noteId", authMiddleware, async (req, res) => {
  try {
    await connectMongo();
    const { _id: userId } = req.user;
    const { title, content, visibility, shareUrl, tags } = req.body;
    const tagsArray =
      typeof tags === "string"
        ? tags.split(",").map((tag) => tag.trim())
        : tags;
    const updatedNote = await Note.findOneAndUpdate(
      { userId, _id: req.params.noteId },
      { title, content, visibility, shareUrl, tags: tagsArray },
      { new: true, runValidators: true }
    );
    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(200).json({ message: "Note updated successfully", updatedNote });
  } catch (error) {
    console.error("Error in updating note:", error.message);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Create share URL for a private note
router.post("/:noteId/share", async (req, res) => {
  try {
    await connectMongo();
    const note = await Note.findById(req.params.noteId);
    const { userId } = req.body; // Get the user ID from the request body
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    if (note.visibility !== "private") {
      return res.status(400).json({ message: "Note is not private" });
    }
    if (!note.sharedWith.includes(userId)) {
      // Check if the user is allowed to access the share URL
      return res
        .status(403)
        .json({ message: "You do not have permission to access this note." });
    }
    const shareUrl = `${req.protocol}://${req.get("host")}/notes/share/${
      note._id
    }`;
    note.shareUrl = shareUrl;
    await note.save();
    res
      .status(200)
      .json({ message: "Share URL created successfully", shareUrl });
  } catch (error) {
    console.error("Error in creating share URL:", error.message);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Get shared note by share URL
router.get("/share/:noteId", async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId);
    const { userId } = req.body; // Get the user ID from the request body
    if (!note) {
      return res.status(404).json({ message: "Shared note not found" });
    }
    if (note.visibility === "private" && !note.sharedWith.includes(userId)) {
      return res.status(403).json({
        message:
          "This note is private and cannot be accessed without permission.",
      });
    }
    res.status(200).json(note);
  } catch (error) {
    console.error("Error in fetching shared note:", error.message);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Delete note by ID
router.delete("/:noteId", authMiddleware, async (req, res) => {
  try {
    await connectMongo();
    const { _id: userId } = req.user;
    const note = await Note.findById(req.params.noteId);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this note." });
    }

    await Note.findByIdAndDelete(req.params.noteId);
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error in deleting note:", error.message);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

module.exports = router;

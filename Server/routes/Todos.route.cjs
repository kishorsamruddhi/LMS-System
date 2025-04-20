const express = require("express");
const connectMongo = require("../../src/lib/mongoose");
const authMiddleware = require("../auth.middleware");
const Todo = require("../models/Todos.model.cjs"); // Adjust the path as necessary
const router = express.Router();

// Create a new todo
router.post("/", authMiddleware, async (req, res) => {
  try {
    await connectMongo();
    const { _id: userId } = req.user;
    const { title, description, dueDate, visibility, priority } = req.body;

    const todo = new Todo({
      title,
      description,
      dueDate,
      userId,
      visibility,
      priority,
    });
    await todo.save();
    res.status(201).json({ message: "Todo created successfully", todo });
  } catch (error) {
    console.error("Error in creating todo:", error.message);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Get all todos created by the authenticated user
router.get("/my-todos", authMiddleware, async (req, res) => {
  try {
    await connectMongo();
    const { _id } = req.user;
    const todos = await Todo.find({ userId: _id }).sort({ createdAt: -1 });
    res.status(200).json(todos);
  } catch (error) {
    console.error("Error in fetching user's todos:", error.message);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Get all todos for a specific user
router.get("/:userId", async (req, res) => {
  try {
    await connectMongo();
    const userId = req.params.userId;
    const todos = await Todo.find({ userId: userId });
    res.status(200).json(todos);
  } catch (error) {
    console.error("Error in fetching todos:", error.message);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Update a todo
router.put("/:todoId", authMiddleware, async (req, res) => {
  try {
    await connectMongo();
    const { _id: userId } = req.user;
    const { title, description, dueDate, visibility, priority } = req.body;

    const updatedTodo = await Todo.findOneAndUpdate(
      { userId, _id: req.params.todoId },
      { title, description, dueDate, visibility, priority },
      { new: true, runValidators: true }
    );
    if (!updatedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.status(200).json({ message: "Todo updated successfully", updatedTodo });
  } catch (error) {
    console.error("Error in updating todo:", error.message);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Update todo status
router.patch("/:todoId/status", authMiddleware, async (req, res) => {
  try {
    await connectMongo();
    const { _id: userId } = req.user;

    const updatedTodo = await Todo.findOneAndUpdate(
      { userId, _id: req.params.todoId },
      { completed: true },
      { new: true }
    );
    if (!updatedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res
      .status(200)
      .json({ message: "Todo status updated successfully", updatedTodo });
  } catch (error) {
    console.error("Error in updating todo status:", error.message);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Delete todo by ID
router.delete("/:todoId", authMiddleware, async (req, res) => {
  try {
    await connectMongo();
    const { _id: userId } = req.user;
    const todo = await Todo.findById(req.params.todoId);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    if (todo.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this todo." });
    }

    await Todo.findByIdAndDelete(req.params.todoId);
    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error("Error in deleting todo:", error.message);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

module.exports = router;

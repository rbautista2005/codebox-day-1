const express = require("express");
const { getAllUsers, getUserById } = require("../services/userService");

// A Router is a mini-app: it collects routes that get mounted under a prefix.
const router = express.Router();

// GET /api/users
router.get("/", (req, res) => {
  res.json(getAllUsers());
});

// GET /api/users/:id
router.get("/:id", (req, res) => {
  const user = getUserById(req.params.id);

  if (!user) {
    return res.status(404).json({ error: `User ${req.params.id} not found` });
  }

  res.json(user);
});

module.exports = router;

const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../services/userService");

// A Router is a mini-app: it collects routes that get mounted under a prefix.
const router = express.Router();

// Runs before any route with ":id" in its path. Rejecting bad ids here means
// no route below has to repeat the check, and junk never reaches the database.
router.param("id", (req, res, next, id) => {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }
  req.userId = parsed;
  next();
});

// Pull a usable name out of a JSON body, or return null if there isn't one.
function readName(body) {
  const name = body?.name;
  return typeof name === "string" && name.trim() ? name.trim() : null;
}

// GET /api/users
router.get("/", async (req, res) => {
  res.json(await getAllUsers());
});

// GET /api/users/:id
router.get("/:id", async (req, res) => {
  const user = await getUserById(req.userId);

  if (!user) {
    return res.status(404).json({ error: `User ${req.userId} not found` });
  }

  res.json(user);
});

// Write routes are protected: the database is real now, so an open DELETE
// would let anyone wipe it.

// POST /api/users — body: { "name": "..." }
router.post("/", requireAuth, async (req, res) => {
  const name = readName(req.body);

  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }

  // 201 Created is the conventional status for a successful insert.
  res.status(201).json(await createUser({ name }));
});

// PUT /api/users/:id — body: { "name": "..." }
router.put("/:id", requireAuth, async (req, res) => {
  const name = readName(req.body);

  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }

  const user = await updateUser(req.userId, { name });

  if (!user) {
    return res.status(404).json({ error: `User ${req.userId} not found` });
  }

  res.json(user);
});

// DELETE /api/users/:id
router.delete("/:id", requireAuth, async (req, res) => {
  const user = await deleteUser(req.userId);

  if (!user) {
    return res.status(404).json({ error: `User ${req.userId} not found` });
  }

  // Echo back what was removed so the client can confirm or offer an undo.
  res.json({ deleted: user });
});

module.exports = router;

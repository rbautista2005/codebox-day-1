const express = require("express");
const { requireUser } = require("../middleware/supabaseAuth");
const {
  listTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} = require("../services/todoService");

const router = express.Router();

// Every todo route belongs to a signed-in user, so check once for all of them.
router.use(requireUser);

// Reject bad ids before they reach the database (same rule as routes/users.js).
router.param("id", (req, res, next, id) => {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }
  req.todoId = parsed;
  next();
});

const MAX_TITLE = 500;

// Pull a usable title out of a value, or return null if there isn't one.
function readTitle(value) {
  if (typeof value !== "string") return null;
  const title = value.trim();
  return title && title.length <= MAX_TITLE ? title : null;
}

// GET /api/todos — the signed-in user's todos, newest first.
router.get("/", async (req, res) => {
  res.json(await listTodos(req.user.id));
});

// POST /api/todos — body: { "title": "..." }
router.post("/", async (req, res) => {
  const title = readTitle(req.body?.title);

  if (!title) {
    return res
      .status(400)
      .json({ error: `title is required (1–${MAX_TITLE} characters)` });
  }

  res.status(201).json(await createTodo(req.user.id, { title }));
});

// PATCH /api/todos/:id — body: { "title"?: "...", "completed"?: true|false }
// PATCH rather than PUT: clients send only the fields they want to change.
router.patch("/:id", async (req, res) => {
  const body = req.body ?? {};
  const changes = {};

  if (body.title !== undefined) {
    const title = readTitle(body.title);
    if (!title) {
      return res
        .status(400)
        .json({ error: `title must be 1–${MAX_TITLE} characters` });
    }
    changes.title = title;
  }

  if (body.completed !== undefined) {
    if (typeof body.completed !== "boolean") {
      return res.status(400).json({ error: "completed must be true or false" });
    }
    changes.completed = body.completed;
  }

  if (Object.keys(changes).length === 0) {
    return res
      .status(400)
      .json({ error: "Send title and/or completed to update" });
  }

  const todo = await updateTodo(req.user.id, req.todoId, changes);

  // Someone else's todo looks exactly like a missing one — no hint it exists.
  if (!todo) {
    return res.status(404).json({ error: `Todo ${req.todoId} not found` });
  }

  res.json(todo);
});

// DELETE /api/todos/:id
router.delete("/:id", async (req, res) => {
  const todo = await deleteTodo(req.user.id, req.todoId);

  if (!todo) {
    return res.status(404).json({ error: `Todo ${req.todoId} not found` });
  }

  res.json({ deleted: todo });
});

module.exports = router;

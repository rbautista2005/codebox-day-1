// Builds the Express app without starting it. server.js listens locally;
// api/index.js hands the same app to Vercel as a serverless function.

// Load .env into process.env if one exists. Node has this built in, so there
// is no dotenv dependency to install.
try {
  process.loadEnvFile();
} catch {
  // No .env file present — fall back to real environment variables.
}

// Fail fast and loudly rather than starting with a broken auth layer. There is
// deliberately no fallback secret: a default would be public knowledge and
// anyone could forge tokens against it.
if (!process.env.JWT_SECRET) {
  console.error(
    "JWT_SECRET is not set. Copy .env.example to .env and set a long random value."
  );
  process.exit(1);
}

const express = require("express");
const usersRouter = require("./routes/users");
const meRouter = require("./routes/me");
const todosRouter = require("./routes/todos");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

// Middleware: parse JSON request bodies into req.body (used by POST and PUT).
app.use(express.json());

// Route: handle GET requests to "/".
app.get("/", (req, res) => {
  res.send("Hello from Codebox!");
});

// Reads are public; writes require a token (see routes/users.js).
app.use("/api/users", usersRouter);

// Protected routes.
app.use("/api/me", meRouter);

// Every todo route requires a signed-in Supabase user (see routes/todos.js).
app.use("/api/todos", todosRouter);

// These must come after every route: they only run when nothing above answered.
app.use(notFound);
app.use(errorHandler);

module.exports = app;

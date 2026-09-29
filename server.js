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
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

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

// These must come after every route: they only run when nothing above answered.
app.use(notFound);
app.use(errorHandler);

// Start the server and listen for incoming requests.
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

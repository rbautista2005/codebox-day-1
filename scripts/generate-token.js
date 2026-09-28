// Teaching shortcut: signs a token for sample user id 1 so the protected route
// can be exercised from curl. This is NOT a login — it checks no password and
// verifies no credentials. A real app would issue a token only after validating
// a user's identity.
try {
  process.loadEnvFile();
} catch {
  // No .env file present — fall back to real environment variables.
}

const jwt = require("jsonwebtoken");

if (!process.env.JWT_SECRET) {
  console.error(
    "JWT_SECRET is not set. Copy .env.example to .env and set a long random value."
  );
  process.exit(1);
}

const token = jwt.sign({ sub: 1 }, process.env.JWT_SECRET, {
  algorithm: "HS256",
  expiresIn: "15m",
});

console.log(token);

const jwt = require("jsonwebtoken");

// Verify an HS256 JWT sent as "Authorization: Bearer <token>".
// On success, attaches the decoded payload to req.user and calls next().
// On any failure, responds 401 with JSON and stops the request there.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res
      .status(401)
      .json({ error: "Missing or malformed Authorization header" });
  }

  try {
    // Pinning the algorithm matters: without it, a token could ask to be
    // verified with a weaker one. Verify also checks "exp" for us.
    req.user = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { requireAuth };

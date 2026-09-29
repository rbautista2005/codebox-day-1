const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { getUserById } = require("../services/userService");

const router = express.Router();

// GET /api/me — protected. requireAuth runs first and only hands off here
// when the token checks out.
router.get("/", requireAuth, async (req, res) => {
  // "sub" (subject) is the standard JWT claim for who the token is about.
  const user = await getUserById(req.user.sub);

  if (!user) {
    return res.status(401).json({ error: "Invalid token" });
  }

  res.json({ id: user.id, name: user.name, tokenIssuedAt: req.user.iat });
});

module.exports = router;

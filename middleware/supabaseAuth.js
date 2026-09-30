const supabase = require("../config/supabase");

// Verify a Supabase access token sent as "Authorization: Bearer <token>".
// The browser gets this token from Supabase Auth when the user logs in.
// On success, attaches { id, email } to req.user and calls next().
// On any failure, responds 401 with JSON and stops the request there.
async function requireUser(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res
      .status(401)
      .json({ error: "Missing or malformed Authorization header" });
  }

  // Ask Supabase who this token belongs to. This checks the signature and
  // expiry, and also catches users who were deleted or signed out.
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  req.user = { id: data.user.id, email: data.user.email };
  next();
}

module.exports = { requireUser };

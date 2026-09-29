// Last stop for any request that no route answered, or that threw. Express 5
// forwards rejected promises from async routes here automatically.

// No route matched: answer in JSON instead of Express's default HTML page.
function notFound(req, res) {
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
}

// Something threw. Log the details server-side, but only send a generic
// message so database internals never leak to the client.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // express.json() flags malformed request bodies with a 400 status.
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body is not valid JSON" });
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}

module.exports = { notFound, errorHandler };

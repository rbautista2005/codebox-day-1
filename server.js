// Local entry point: build the app (app.js) and listen on a port.
const app = require("./app");

const PORT = process.env.PORT || 3000;

// Start the server and listen for incoming requests.
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

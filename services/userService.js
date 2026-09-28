// Temporary in-memory store. This is the only place that knows how users are
// held, so swapping in a real database later means changing just this file.
const users = [
  { id: 1, name: "Alex" },
  { id: 2, name: "Sam" },
];

// Return every user.
function getAllUsers() {
  return users;
}

// Find one user by id. Returns undefined when nothing matches, and the caller
// decides what that means in HTTP terms.
function getUserById(id) {
  return users.find((u) => u.id === Number(id));
}

module.exports = { getAllUsers, getUserById };

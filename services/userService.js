const supabase = require("../config/supabase");

// This is the only place that knows users live in Supabase. Routes call these
// functions and never talk to the database directly.

const TABLE = "users";
const COLUMNS = "id, name";

// Supabase returns { data, error } instead of throwing. Turn errors into
// throws so Express's error handler turns them into a 500 JSON response.
function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

// Return every user, oldest first.
async function getAllUsers() {
  return unwrap(await supabase.from(TABLE).select(COLUMNS).order("id"));
}

// Find one user by id. Returns null when nothing matches, and the caller
// decides what that means in HTTP terms.
async function getUserById(id) {
  return unwrap(
    await supabase.from(TABLE).select(COLUMNS).eq("id", id).maybeSingle()
  );
}

// Insert a user and return the stored row, including its new id.
async function createUser({ name }) {
  return unwrap(
    await supabase.from(TABLE).insert({ name }).select(COLUMNS).single()
  );
}

// Update a user's name. Returns the updated row, or null if the id is unknown.
async function updateUser(id, { name }) {
  return unwrap(
    await supabase
      .from(TABLE)
      .update({ name })
      .eq("id", id)
      .select(COLUMNS)
      .maybeSingle()
  );
}

// Delete a user. Returns the deleted row, or null if the id is unknown.
async function deleteUser(id) {
  return unwrap(
    await supabase.from(TABLE).delete().eq("id", id).select(COLUMNS).maybeSingle()
  );
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

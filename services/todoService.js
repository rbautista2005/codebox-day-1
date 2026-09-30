const supabase = require("../config/supabase");

// The only place that knows todos live in Supabase. The service role key
// bypasses Row Level Security, so every query here MUST filter by user_id —
// that filter is what keeps one user's todos away from another.

const TABLE = "todos";
const COLUMNS = "id, title, completed, created_at, updated_at";

// Supabase returns { data, error } instead of throwing. Turn errors into
// throws so Express's error handler turns them into a 500 JSON response.
function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

// Return all of a user's todos, newest first.
async function listTodos(userId) {
  return unwrap(
    await supabase
      .from(TABLE)
      .select(COLUMNS)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
  );
}

// Insert a todo for a user and return the stored row.
async function createTodo(userId, { title }) {
  return unwrap(
    await supabase
      .from(TABLE)
      .insert({ user_id: userId, title })
      .select(COLUMNS)
      .single()
  );
}

// Change a todo's title and/or completed flag. Returns the updated row, or
// null if the id is unknown or belongs to someone else.
async function updateTodo(userId, id, changes) {
  return unwrap(
    await supabase
      .from(TABLE)
      .update({ ...changes, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId)
      .select(COLUMNS)
      .maybeSingle()
  );
}

// Delete a todo. Returns the deleted row, or null if the id is unknown or
// belongs to someone else.
async function deleteTodo(userId, id) {
  return unwrap(
    await supabase
      .from(TABLE)
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
      .select(COLUMNS)
      .maybeSingle()
  );
}

module.exports = { listTodos, createTodo, updateTodo, deleteTodo };

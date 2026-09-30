import { supabase } from "./supabase";

// Call our Express API as the signed-in user. The Supabase access token goes
// in the Authorization header; the server checks it on every request.
async function request(path, { method = "GET", body } = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      ...(body !== undefined && { "Content-Type": "application/json" }),
      ...(session && { Authorization: `Bearer ${session.access_token}` }),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // A dead session can't be fixed by retrying — send the user back to log in.
    if (res.status === 401) await supabase.auth.signOut();
    throw new Error(data?.error || `Request failed (${res.status})`);
  }

  return data;
}

export const todosApi = {
  list: () => request("/todos"),
  create: (title) => request("/todos", { method: "POST", body: { title } }),
  update: (id, changes) =>
    request(`/todos/${id}`, { method: "PATCH", body: changes }),
  remove: (id) => request(`/todos/${id}`, { method: "DELETE" }),
};

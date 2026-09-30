import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconPencil, IconTrash, IconCheck } from "@tabler/icons-react";
import { supabase } from "@/lib/supabase";
import { todosApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";

const MAX_TITLE = 500;

const PLACEHOLDERS = [
  "Add a task…",
  "Call the dentist",
  "Finish the day 3 exercises",
  "Buy oat milk",
  "Reply to Sam’s email",
];

const FILTERS = [
  { id: "all", label: "All", test: () => true },
  { id: "todo", label: "To do", test: (t) => !t.completed },
  { id: "done", label: "Done", test: (t) => t.completed },
];

export default function TodoApp({ user }) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    todosApi
      .list()
      .then(setTodos)
      .catch((err) => setError(`Couldn’t load your tasks. ${err.message}`))
      .finally(() => setLoading(false));
  }, []);

  // Every change shows up immediately, then is undone if the server says no.
  // Only the one task is restored, so other edits made meanwhile survive.
  async function optimistic(todo, apply, request, failMessage) {
    setTodos(apply);
    setError("");
    try {
      await request();
    } catch (err) {
      setTodos((list) => {
        const rest = list.filter((t) => t.id !== todo.id);
        return [...rest, todo].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
      });
      setError(`${failMessage} ${err.message}`);
    }
  }

  async function addTodo(title) {
    const tempId = `temp-${Date.now()}`;
    const draft = {
      id: tempId,
      title,
      completed: false,
      created_at: new Date().toISOString(),
      pending: true,
    };
    setTodos((list) => [draft, ...list]);
    setError("");
    try {
      const saved = await todosApi.create(title);
      setTodos((list) => list.map((t) => (t.id === tempId ? saved : t)));
    } catch (err) {
      setTodos((list) => list.filter((t) => t.id !== tempId));
      setError(`Couldn’t add “${title}”. ${err.message}`);
    }
  }

  const toggleTodo = (todo) =>
    optimistic(
      todo,
      (list) =>
        list.map((t) => (t.id === todo.id ? { ...t, completed: !t.completed } : t)),
      () => todosApi.update(todo.id, { completed: !todo.completed }),
      "Couldn’t update that task."
    );

  const renameTodo = (todo, title) =>
    optimistic(
      todo,
      (list) => list.map((t) => (t.id === todo.id ? { ...t, title } : t)),
      () => todosApi.update(todo.id, { title }),
      "Couldn’t rename that task."
    );

  const deleteTodo = (todo) =>
    optimistic(
      todo,
      (list) => list.filter((t) => t.id !== todo.id),
      () => todosApi.remove(todo.id),
      `Couldn’t delete “${todo.title}”.`
    );

  const remaining = todos.filter((t) => !t.completed).length;
  const done = todos.length - remaining;
  const visible = todos.filter(FILTERS.find((f) => f.id === filter).test);

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 pb-16 sm:px-6">
      <header className="flex items-center justify-between gap-4 py-6">
        <p className="font-display text-2xl font-extrabold tracking-tight text-marigold">
          Tally
        </p>
        <div className="flex min-w-0 items-center gap-4 text-sm">
          <span className="truncate text-muted" title={user.email}>
            {user.email}
          </span>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="shrink-0 rounded-full px-3 py-1.5 font-bold ring-1 ring-line transition hover:ring-marigold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marigold"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mt-8 sm:mt-14">
        <Headline loading={loading} total={todos.length} remaining={remaining} done={done} />

        <div className="mt-10">
          <PlaceholdersAndVanishInput
            label="New task"
            placeholders={PLACEHOLDERS}
            maxLength={MAX_TITLE}
            onSubmit={addTodo}
            disabled={loading}
          />
        </div>

        {error && (
          <p role="alert" className="mt-6 rounded-lg bg-coral/10 px-4 py-3 text-coral">
            {error}
          </p>
        )}

        {todos.length > 0 && (
          <div
            role="group"
            aria-label="Show tasks"
            className="mt-10 inline-flex rounded-full bg-surface p-1 ring-1 ring-line"
          >
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marigold",
                  filter === f.id ? "bg-ink-text text-ink" : "text-muted hover:text-ink-text"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        <ul className="mt-4 divide-y divide-line">
          <AnimatePresence initial={false}>
            {visible.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={() => toggleTodo(todo)}
                onRename={(title) => renameTodo(todo, title)}
                onDelete={() => deleteTodo(todo)}
              />
            ))}
          </AnimatePresence>
        </ul>

        {!loading && todos.length > 0 && visible.length === 0 && (
          <p className="mt-6 text-muted">
            {filter === "done" ? "Nothing checked off yet." : "Nothing left to do."}
          </p>
        )}
      </main>
    </div>
  );
}

// The one loud thing on the page: how much is left.
function Headline({ loading, total, remaining, done }) {
  let big;
  let small;

  if (loading) {
    big = "…";
    small = "Loading your tasks";
  } else if (total === 0) {
    big = "Empty";
    small = "Add your first task below.";
  } else if (remaining === 0) {
    big = "All done";
    small = `You checked off all ${total}.`;
  } else {
    big = `${remaining} left`;
    small = done > 0 ? `${done} of ${total} done` : `${total} to go`;
  }

  return (
    <div aria-live="polite">
      <h1 className="font-display text-7xl font-extrabold leading-[0.95] tracking-tight sm:text-8xl">
        {big}
      </h1>
      <p className="mt-3 text-lg text-muted">{small}</p>
    </div>
  );
}

function TodoItem({ todo, onToggle, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const inputRef = useRef(null);
  const pending = Boolean(todo.pending);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function startEditing() {
    if (pending) return;
    setDraft(todo.title);
    setEditing(true);
  }

  function finishEditing() {
    const title = draft.trim();
    setEditing(false);
    if (title && title !== todo.title) onRename(title);
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
      className="group flex items-center gap-4 py-4"
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={todo.completed}
        aria-label={`Mark “${todo.title}” as ${todo.completed ? "not done" : "done"}`}
        disabled={pending}
        onClick={onToggle}
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-full ring-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marigold",
          todo.completed ? "bg-marigold ring-marigold text-ink" : "ring-line hover:ring-marigold"
        )}
      >
        <AnimatePresence>
          {todo.completed && (
            <motion.span
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
            >
              <IconCheck size={16} stroke={3} aria-hidden />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {editing ? (
        <input
          ref={inputRef}
          aria-label="Task name"
          value={draft}
          maxLength={MAX_TITLE}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={finishEditing}
          onKeyDown={(e) => {
            if (e.key === "Enter") finishEditing();
            if (e.key === "Escape") setEditing(false);
          }}
          className="min-w-0 flex-1 rounded-lg bg-surface px-3 py-1.5 text-lg ring-2 ring-marigold focus:outline-none"
        />
      ) : (
        <span
          onDoubleClick={startEditing}
          className={cn(
            "min-w-0 flex-1 break-words text-lg transition-colors",
            todo.completed && "text-muted",
            pending && "opacity-60"
          )}
        >
          {/* The strike line draws across the text when a task is checked
              off. It's a background on an inline span, so on a wrapped title
              it runs along each line in turn. */}
          <motion.span
            initial={false}
            animate={{ backgroundSize: todo.completed ? "100% 2px" : "0% 2px" }}
            transition={{ duration: 0.35, ease: [0.65, 0, 0.35, 1] }}
            className="bg-[linear-gradient(var(--color-marigold),var(--color-marigold))] bg-no-repeat bg-[position:0_55%]"
          >
            {todo.title}
          </motion.span>
        </span>
      )}

      {!editing && (
        <div className="flex shrink-0 gap-1 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <IconButton label={`Rename “${todo.title}”`} onClick={startEditing} disabled={pending}>
            <IconPencil size={18} aria-hidden />
          </IconButton>
          <IconButton
            label={`Delete “${todo.title}”`}
            onClick={onDelete}
            disabled={pending}
            className="hover:text-coral"
          >
            <IconTrash size={18} aria-hidden />
          </IconButton>
        </div>
      )}
    </motion.li>
  );
}

function IconButton({ label, className, children, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "grid size-9 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-ink-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marigold disabled:opacity-40",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

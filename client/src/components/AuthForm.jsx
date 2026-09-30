import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { cn } from "@/lib/utils";

const MODES = {
  login: {
    heading: "Welcome back",
    intro: "Log in to see your list.",
    submit: "Log in",
    busy: "Logging in…",
    switchPrompt: "New here?",
    switchLabel: "Create an account",
  },
  signup: {
    heading: "Start a list",
    intro: "Create an account and your tasks follow you to any device.",
    submit: "Create account",
    busy: "Creating account…",
    switchPrompt: "Already have an account?",
    switchLabel: "Log in",
  },
};

export default function AuthForm() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const copy = MODES[mode];

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    const credentials = { email: email.trim(), password };
    const { data, error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword(credentials)
        : await supabase.auth.signUp(credentials);

    setBusy(false);

    if (error) {
      setError(error.message);
      return;
    }

    // With "Confirm email" on, sign-up returns no session until the link is clicked.
    if (mode === "signup" && !data.session) {
      setNotice(`We sent a confirmation link to ${credentials.email}. Open it, then log in.`);
      setMode("login");
      setPassword("");
    }
    // Otherwise App's onAuthStateChange picks up the new session.
  }

  function switchMode() {
    setMode(mode === "login" ? "signup" : "login");
    setError("");
    setNotice("");
  }

  return (
    <main className="relative isolate flex min-h-dvh items-center overflow-hidden px-4 py-16">
      <BackgroundBeams className="-z-10" />

      <div className="mx-auto w-full max-w-sm">
        <p className="font-display text-2xl font-extrabold tracking-tight text-marigold">
          Tally
        </p>
        <h1 className="mt-10 font-display text-5xl font-bold leading-[1.05] tracking-tight">
          {copy.heading}
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-muted">{copy.intro}</p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5" noValidate={false}>
          <Field
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={setEmail}
          />
          <Field
            id="password"
            label="Password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={6}
            hint={mode === "signup" ? "At least 6 characters." : undefined}
            value={password}
            onChange={setPassword}
          />

          {error && (
            <p role="alert" className="rounded-lg bg-coral/10 px-4 py-3 text-coral">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="rounded-lg bg-marigold/10 px-4 py-3 text-marigold">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="h-12 w-full rounded-full bg-marigold font-bold text-ink transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marigold disabled:opacity-60"
          >
            {busy ? copy.busy : copy.submit}
          </button>
        </form>

        <p className="mt-8 text-muted">
          {copy.switchPrompt}{" "}
          <button
            type="button"
            onClick={switchMode}
            className="font-bold text-ink-text underline decoration-marigold decoration-2 underline-offset-4 hover:text-marigold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marigold"
          >
            {copy.switchLabel}
          </button>
        </p>
      </div>
    </main>
  );
}

function Field({ id, label, hint, onChange, className, ...inputProps }) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="block font-bold">
        {label}
      </label>
      <input
        id={id}
        required
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="h-12 w-full rounded-xl bg-surface/80 px-4 text-ink-text ring-1 ring-line backdrop-blur transition placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-marigold"
        {...inputProps}
      />
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

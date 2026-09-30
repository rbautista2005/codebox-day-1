import { useEffect, useState } from "react";
import { MotionConfig } from "motion/react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import AuthForm from "@/components/AuthForm";
import TodoApp from "@/components/TodoApp";

export default function App() {
  // undefined = still checking for a saved session; null = signed out.
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    if (!supabaseConfigured) return;

    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    // Fires on log in, log out, and token refresh.
    const { data } = supabase.auth.onAuthStateChange((_event, next) =>
      setSession(next)
    );
    return () => data.subscription.unsubscribe();
  }, []);

  if (!supabaseConfigured) {
    return (
      <main className="mx-auto max-w-lg px-4 py-24">
        <h1 className="font-display text-3xl font-bold">Supabase isn’t set up</h1>
        <p className="mt-4 text-muted leading-relaxed">
          Copy <code className="text-ink-text">client/.env.example</code> to{" "}
          <code className="text-ink-text">client/.env.local</code>, fill in your
          project URL and anon key, then restart the dev server.
        </p>
      </main>
    );
  }

  return (
    // "user" = follow the visitor's reduced-motion setting everywhere.
    <MotionConfig reducedMotion="user">
      {session === undefined ? null : session ? (
        <TodoApp user={session.user} />
      ) : (
        <AuthForm />
      )}
    </MotionConfig>
  );
}

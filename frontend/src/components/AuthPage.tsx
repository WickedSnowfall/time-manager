import { useState } from "react";

import type { Messages } from "../i18n";
import type { AuthMode } from "../types";

interface AuthPageProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onLogin: (payload: { identifier: string; password: string }) => Promise<void>;
  onRegister: (payload: { username: string; email: string; password: string }) => Promise<void>;
  loading: boolean;
  error: string | null;
  t: Messages;
}

export function AuthPage({
  mode,
  onModeChange,
  onLogin,
  onRegister,
  loading,
  error,
  t,
}: AuthPageProps) {
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "login") {
      await onLogin({ identifier, password });
      return;
    }

    await onRegister({ username, email, password });
  }

  return (
    <main className="app-shell auth-shell">
      <div className="auth-card card">
        <div className="auth-brand">
          <h1>{t.title}</h1>
          <p>{t.authHint}</p>
        </div>

        <div className="tabs auth-tabs">
          <button
            className={mode === "login" ? "tab active" : "tab"}
            onClick={() => onModeChange("login")}
            type="button"
          >
            {t.login}
          </button>
          <button
            className={mode === "register" ? "tab active" : "tab"}
            onClick={() => onModeChange("register")}
            type="button"
          >
            {t.register}
          </button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <h2>{mode === "login" ? t.loginTitle : t.registerTitle}</h2>

          {mode === "register" && (
            <label>
              {t.username}
              <input value={username} onChange={(e) => setUsername(e.target.value)} required />
            </label>
          )}

          {mode === "login" ? (
            <label>
              {t.identifier}
              <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
            </label>
          ) : (
            <label>
              {t.email}
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
          )}

          <label>
            {t.password}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>

          {error && <div className="form-error">{error}</div>}

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? t.loading : mode === "login" ? t.authSubmitLogin : t.authSubmitRegister}
          </button>
        </form>
      </div>
    </main>
  );
}

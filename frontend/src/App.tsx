import { useState } from "react";

export default function App() {
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const endpoint = running ? "/sessions/stop" : "/sessions/start";

    try {
      setLoading(true);

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);

      setRunning((prev) => !prev);
    } catch (error) {
      console.error("API error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f7fb",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          padding: "32px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          minWidth: "320px",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "20px" }}>Time Manager</h1>

        <button
          onClick={toggle}
          disabled={loading}
          style={{
            padding: "14px 28px",
            borderRadius: "14px",
            border: "none",
            fontSize: "18px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Loading..." : running ? "Stop" : "Start"}
        </button>
      </div>
    </main>
  );
}

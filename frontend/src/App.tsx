
import { useState } from "react";

export default function App() {
  const [running, setRunning] = useState(false);

  async function toggle() {
    const endpoint = running ? "/sessions/stop" : "/sessions/start";
    await fetch("http://localhost:8000" + endpoint, { method: "POST" });
    setRunning(!running);
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: 40 }}>
      <h1>Time Manager</h1>
      <button onClick={toggle} style={{ padding: 20, fontSize: 20 }}>
        {running ? "Stop" : "Start"}
      </button>
    </div>
  );
}

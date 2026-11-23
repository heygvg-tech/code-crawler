import { useState } from "react";
import { RUNNABLE } from "../lib/types";
import type { Language } from "../lib/types";
import { runCode } from "../lib/runner";
import type { RunResult } from "../lib/runner";

// A read-only code example with a Run button, so learners can see it work.
export default function ExampleBlock({ code, language, label }: { code: string; language: Language; label: string }) {
  const [result, setResult] = useState<RunResult | null>(null);
  const [status, setStatus] = useState("");
  const [running, setRunning] = useState(false);
  const runnable = RUNNABLE.includes(language);

  async function run() {
    setRunning(true);
    setResult(null);
    setStatus("Running...");
    setResult(await runCode(language, code, setStatus));
    setRunning(false);
  }

  return (
    <div className="example">
      <div className="example-head">
        <span className="pixel small">{label}</span>
        <span className="muted small">{language}</span>
      </div>
      <pre className="example-code">{code}</pre>
      {runnable && (
        <button className="btn small-btn" onClick={run} disabled={running}>
          {running ? "⏳ Running..." : "▶ Run example"}
        </button>
      )}
      {(running || result) && (
        <pre className={`output ${result && !result.ok ? "bad" : ""}`}>
          {running ? status : [result?.output, result?.error ? `💥 ${result.error}` : ""].filter(Boolean).join("\n") || "(no output)"}
        </pre>
      )}
    </div>
  );
}

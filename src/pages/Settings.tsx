import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { Progress } from "../lib/types";
import { clearProgress, downloadSaveScroll, getApiKey, readSaveScroll, setApiKey } from "../lib/storage";
import { AI_MODEL } from "../lib/config";

export default function Settings({ progress, setProgress }: { progress: Progress | null; setProgress: (p: Progress | null) => void }) {
  const [key, setKey] = useState(getApiKey());
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function saveKey() {
    setApiKey(key);
    setMsg(key.trim() ? "Key saved in this browser. The real System awakens." : "Key removed. Back to demo mode.");
  }

  async function onImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setProgress(await readSaveScroll(file));
      setMsg("Save Scroll loaded. Welcome back, crawler.");
    } catch {
      setMsg("That file isn't a Code Crawler Save Scroll.");
    }
    e.target.value = "";
  }

  function abandon() {
    if (!window.confirm("Abandon this run? All progress is deleted. Download a Save Scroll first if you might want it.")) return;
    clearProgress();
    setProgress(null);
    window.location.hash = "#/";
  }

  return (
    <div className="settings">
      <a href="#/" className="muted small">
        ← Back
      </a>
      <h1 className="pixel">SETTINGS</h1>
      {msg && <p className="system-voice">{msg}</p>}

      <section className="panel">
        <h3>🔑 Anthropic API key</h3>
        <p className="small">
          Turns on real AI plans and code reviews. Without one, you're in demo mode (everything works, but reviews are simulated). Get a key at{" "}
          <a href="https://console.anthropic.com" target="_blank" rel="noreferrer">
            console.anthropic.com
          </a>
          .
        </p>
        <div className="row">
          <input className="grow" type={show ? "text" : "password"} value={key} onChange={(e) => setKey(e.target.value)} placeholder="sk-ant-..." autoComplete="off" />
          <button className="btn ghost" onClick={() => setShow(!show)}>
            {show ? "Hide" : "Show"}
          </button>
          <button className="btn primary" onClick={saveKey}>
            Save
          </button>
        </div>
        <p className="muted small">
          Stored only in this browser and sent only to Anthropic. It's never in your Save Scroll or on GitHub. Model: {AI_MODEL}. Reviews are usually a few cents or less. Set a monthly spend limit in the Anthropic console so nothing surprises you.
        </p>
      </section>

      <section className="panel">
        <h3>📜 Save Scroll</h3>
        <p className="small">Your progress lives in this browser. Download a Save Scroll to back it up or move it to another device.</p>
        <div className="row">
          <button className="btn" disabled={!progress} onClick={() => progress && downloadSaveScroll(progress)}>
            ⬇ Download Save Scroll
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            ⬆ Load Save Scroll
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImport} />
        </div>
      </section>

      {progress && (
        <section className="panel danger">
          <h3>☠️ Danger zone</h3>
          <button className="btn danger" onClick={abandon}>
            Abandon this run
          </button>
        </section>
      )}
    </div>
  );
}

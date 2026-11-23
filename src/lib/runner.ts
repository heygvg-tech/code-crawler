// Runs crawler code inside Web Workers so an infinite loop can't freeze the page.
// Python runs on Pyodide (Python compiled to WebAssembly), loaded from a CDN.
import { PYODIDE_URL, RUN_TIMEOUT_MS } from "./config";
import type { Language } from "./types";

export type RunResult = { ok: boolean; output: string; error?: string };

const JS_WORKER = `
self.onmessage = (e) => {
  const lines = [];
  const fmt = (v) => typeof v === "string" ? v : (() => { try { return JSON.stringify(v); } catch { return String(v); } })();
  const log = (...a) => lines.push(a.map(fmt).join(" "));
  console.log = log; console.info = log; console.warn = log; console.error = log;
  try {
    new Function(e.data)();
    self.postMessage({ ok: true, output: lines.join("\\n") });
  } catch (err) {
    self.postMessage({ ok: false, output: lines.join("\\n"), error: String(err && err.stack ? err.message : err) });
  }
};`;

const PY_WORKER = `
importScripts(${JSON.stringify(PYODIDE_URL)});
const ready = loadPyodide().then((py) => { self.postMessage({ type: "ready" }); return py; })
  .catch((err) => { self.postMessage({ type: "load-error", error: String(err) }); });
self.onmessage = async (e) => {
  const py = await ready;
  const out = [];
  py.setStdout({ batched: (s) => out.push(s) });
  py.setStderr({ batched: (s) => out.push(s) });
  py.setStdin({ stdin: () => { throw new Error("input() doesn't work in the browser runner. Hardcode your values instead."); } });
  try {
    const globals = py.globals.get("dict")(); // fresh variables every run
    await py.runPythonAsync(e.data, { globals });
    globals.destroy();
    self.postMessage({ type: "result", ok: true, output: out.join("\\n") });
  } catch (err) {
    const msg = String(err && err.message ? err.message : err);
    // Trim Pyodide's internal frames so beginners only see their own error.
    const tail = msg.split("\\n").filter((l) => !l.includes("/lib/python") && !l.includes("_pyodide")).join("\\n");
    self.postMessage({ type: "result", ok: false, output: out.join("\\n"), error: tail.trim() });
  }
};`;

const workerFrom = (src: string) => new Worker(URL.createObjectURL(new Blob([src], { type: "text/javascript" })));

function runJS(code: string): Promise<RunResult> {
  return new Promise((resolve) => {
    const w = workerFrom(JS_WORKER);
    const timer = setTimeout(() => {
      w.terminate();
      resolve({ ok: false, output: "", error: "Timed out after 8 seconds. Infinite loop? The hallway really doesn't end." });
    }, RUN_TIMEOUT_MS);
    w.onmessage = (e) => {
      clearTimeout(timer);
      w.terminate();
      resolve(e.data);
    };
    w.postMessage(code);
  });
}

// One Python worker is kept alive so Pyodide only downloads once.
let py: { worker: Worker; ready: Promise<void> } | null = null;

function getPython(onStatus?: (s: string) => void) {
  if (py) return py;
  onStatus?.("Summoning the Python interpreter (first run takes ~10 seconds)...");
  const worker = workerFrom(PY_WORKER);
  const ready = new Promise<void>((resolve, reject) => {
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === "ready") {
        worker.removeEventListener("message", onMsg);
        resolve();
      } else if (e.data?.type === "load-error") {
        worker.removeEventListener("message", onMsg);
        reject(new Error(e.data.error));
      }
    };
    worker.addEventListener("message", onMsg);
  });
  py = { worker, ready };
  ready.catch(() => {
    py = null;
  });
  return py;
}

async function runPython(code: string, onStatus?: (s: string) => void): Promise<RunResult> {
  const p = getPython(onStatus);
  try {
    await p.ready;
  } catch {
    return { ok: false, output: "", error: "Couldn't load Python. Check your internet connection and try again." };
  }
  onStatus?.("Running...");
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      p.worker.terminate();
      py = null; // next run starts a fresh interpreter
      resolve({ ok: false, output: "", error: "Timed out after 8 seconds. Infinite loop? The hallway really doesn't end." });
    }, RUN_TIMEOUT_MS);
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type !== "result") return;
      clearTimeout(timer);
      p.worker.removeEventListener("message", onMsg);
      resolve({ ok: e.data.ok, output: e.data.output, error: e.data.error });
    };
    p.worker.addEventListener("message", onMsg);
    p.worker.postMessage(code);
  });
}

export function runCode(language: Language, code: string, onStatus?: (s: string) => void): Promise<RunResult> {
  if (language === "JavaScript") return runJS(code);
  if (language === "Python") return runPython(code, onStatus);
  return Promise.resolve({ ok: false, output: "", error: `${language} can't run in the browser. Run it on your computer, then submit for review.` });
}

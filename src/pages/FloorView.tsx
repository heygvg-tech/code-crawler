import { useEffect, useRef, useState } from "react";
import type { Floor, Progress, Review } from "../lib/types";
import { RUNNABLE } from "../lib/types";
import type { UpdateFn } from "../App";
import { generateFloorDetails, reviewCode } from "../lib/actions";
import { FriendlyError } from "../lib/ai";
import { recordActivity, XP } from "../lib/game";
import { daysBetween, prettyDate, todayISO } from "../lib/dates";
import { runCode } from "../lib/runner";
import type { RunResult } from "../lib/runner";
import CodeEditor from "../components/CodeEditor";
import ReviewCard from "../components/ReviewCard";
import LootBox from "../components/LootBox";

type Celebration = { review: Review; xp: number; nextHref: string; nextLabel: string };

const friendly = (e: unknown, fallback: string) => (e instanceof FriendlyError ? e.message : fallback);

export default function FloorView({ progress, floorId, update }: { progress: Progress; floorId: string; update: UpdateFn }) {
  const floor = progress.floors.find((f) => f.id === floorId);
  const lang = progress.crawler.language;
  const runnable = RUNNABLE.includes(lang);

  const [code, setCode] = useState(floor?.code ?? floor?.details?.exercise.starterCode ?? "");
  const [gen, setGen] = useState<{ state: "idle" | "loading" | "error"; error?: string }>({ state: "idle" });
  const [run, setRun] = useState<RunResult | null>(null);
  const [runStatus, setRunStatus] = useState("");
  const [running, setRunning] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [party, setParty] = useState<Celebration | null>(null);
  const started = useRef(false); // stops double-generating in React dev mode

  const patchFloor = (p: Progress, fn: (f: Floor) => Floor): Progress => ({
    ...p,
    floors: p.floors.map((f) => (f.id === floorId ? fn(f) : f)),
  });

  async function generate() {
    if (!floor) return;
    setGen({ state: "loading" });
    try {
      const details = await generateFloorDetails(progress, floor);
      update((p) => patchFloor(p, (f) => ({ ...f, details, code: f.code ?? details.exercise.starterCode })));
      setCode((c) => c || details.exercise.starterCode);
      setGen({ state: "idle" });
    } catch (e) {
      setGen({ state: "error", error: friendly(e, "The floor failed to load. Try again.") });
    }
  }

  useEffect(() => {
    if (floor && floor.status !== "locked" && !floor.details && !started.current) {
      started.current = true;
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floorId]);

  if (!floor)
    return (
      <div className="center-screen">
        <p className="pixel">THIS FLOOR DOESN'T EXIST.</p>
        <a className="btn" href="#/map">
          Back to the map
        </a>
      </div>
    );

  if (floor.status === "locked")
    return (
      <div className="center-screen">
        <p className="pixel">🔒 FLOOR {floor.number} IS LOCKED</p>
        <p className="muted">Clear the floors above it first. No skipping. The System sees all.</p>
        <a className="btn" href="#/map">
          Back to the map
        </a>
      </div>
    );

  const reviews = progress.reviews.filter((r) => r.floorId === floor.id).reverse();
  const daysLeft = daysBetween(todayISO(), floor.targetDate);
  const idx = progress.floors.findIndex((f) => f.id === floor.id);
  const next = progress.floors[idx + 1];

  function onCodeChange(v: string) {
    setCode(v);
    update((p) => patchFloor(p, (f) => ({ ...f, code: v })));
  }

  function toggleLesson(i: number) {
    update((p) => {
      const f = p.floors.find((x) => x.id === floorId);
      if (!f?.details) return p;
      const done = !f.details.lessons[i].done;
      const lessons = f.details.lessons.map((l, j) => (j === i ? { ...l, done } : l));
      return {
        ...patchFloor(p, (x) => ({ ...x, details: { ...x.details!, lessons } })),
        xp: Math.max(0, p.xp + (done ? XP.lesson : -XP.lesson)),
        streak: done ? recordActivity(p.streak) : p.streak,
      };
    });
  }

  async function onRun() {
    setRunning(true);
    setRun(null);
    setRunStatus("Running...");
    const result = await runCode(lang, code, setRunStatus);
    setRun(result);
    setRunning(false);
    setRunStatus("");
    update((p) => ({ ...p, streak: recordActivity(p.streak) }));
  }

  async function onSubmit() {
    if (!floor) return;
    setReviewing(true);
    setReviewError("");
    try {
      const runOutput = run ? [run.output, run.error].filter(Boolean).join("\n") : "";
      const review = await reviewCode(progress, floor, code, runOutput);
      const firstTryOfThisCode = !reviews.some((r) => r.code === code);
      const wasActive = floor.status === "active";
      const passed = review.verdict === "pass";
      const gained = !wasActive ? 0 : (firstTryOfThisCode ? XP.submit : 0) + (passed ? (floor.isBoss ? XP.bossPass : XP.pass) : 0);

      update((p) => {
        const i = p.floors.findIndex((f) => f.id === floorId);
        const floors = p.floors.map((f, j) => {
          if (j === i) return { ...f, code, status: passed ? ("cleared" as const) : f.status };
          if (j === i + 1 && passed && f.status === "locked") return { ...f, status: "active" as const };
          return f;
        });
        return { ...p, floors, reviews: [...p.reviews, review], xp: p.xp + gained, streak: recordActivity(p.streak) };
      });

      if (passed && wasActive)
        setParty({
          review,
          xp: gained,
          nextHref: next ? `#/floor/${next.id}` : "#/",
          nextLabel: next ? `Take the stairs to Floor ${next.number} ➜` : "Return to the Safe Room 🏆",
        });
    } catch (e) {
      setReviewError(friendly(e, "The review failed. Try again."));
    }
    setReviewing(false);
  }

  function resetCode() {
    if (floor?.details && window.confirm("Reset your code to the starter code? Your current code will be gone.")) onCodeChange(floor.details.exercise.starterCode);
  }

  return (
    <div className="floor">
      <a href="#/map" className="muted small">
        ← Map
      </a>
      <header className={`floor-head ${floor.isBoss ? "boss" : ""}`}>
        <p className="pixel small gold">
          {floor.isBoss ? "💀 BOSS FLOOR " : "FLOOR "}
          {floor.number}
          {floor.status === "cleared" && " · CLEARED ✅"}
        </p>
        <h1>{floor.title}</h1>
        <p className="muted">
          Due {prettyDate(floor.targetDate)}
          {floor.status !== "cleared" && (daysLeft >= 0 ? ` · ${daysLeft} day${daysLeft === 1 ? "" : "s"} left` : ` · ${-daysLeft} days overdue`)}
        </p>
        <ul className="goals">
          {floor.goals.map((g, i) => (
            <li key={i}>{g}</li>
          ))}
        </ul>
      </header>

      {!floor.details ? (
        <div className="panel center">
          {gen.state === "error" ? (
            <>
              <p className="error">{gen.error}</p>
              <button className="btn" onClick={generate}>
                Retry
              </button>
            </>
          ) : (
            <>
              <div className="spinner">🕯️</div>
              <p className="pixel small">STOCKING THIS FLOOR WITH LESSONS AND TRAPS...</p>
            </>
          )}
        </div>
      ) : (
        <>
          <section className="panel">
            <h3>📚 Lessons</h3>
            <ul className="lessons">
              {floor.details.lessons.map((l, i) => (
                <li key={i} className={l.done ? "done" : ""}>
                  <input type="checkbox" checked={l.done} onChange={() => toggleLesson(i)} aria-label={`Mark "${l.title}" done`} />
                  <div>
                    <a href={l.url} target="_blank" rel="noreferrer">
                      {l.title} ↗
                    </a>
                    <span className="muted small"> · {l.source}</span>
                    <p className="small">{l.summary}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <h3>⚔️ {floor.isBoss ? "Boss Fight" : "Exercise"}</h3>
            <p>{floor.details.exercise.prompt}</p>
            <h4>Done when</h4>
            <ul className="checklist">
              {floor.details.exercise.doneWhen.map((d, i) => (
                <li key={i}>☐ {d}</li>
              ))}
            </ul>
          </section>

          <CodeEditor value={code} onChange={onCodeChange} language={lang} />
          <div className="row">
            {runnable && (
              <button className="btn" onClick={onRun} disabled={running}>
                {running ? "⏳ Running..." : "▶ Run"}
              </button>
            )}
            <button className="btn primary" onClick={onSubmit} disabled={reviewing}>
              {reviewing ? "The System is judging you..." : "🧙 Submit for review"}
            </button>
            <button className="btn ghost" onClick={resetCode}>
              Reset
            </button>
          </div>
          {!runnable && <p className="hint">Run your {lang} code on your computer, then submit it here for review.</p>}
          {lang === "Python" && <p className="muted small">Tip: input() doesn't work here. Put your test values in variables instead.</p>}

          {(running || run) && (
            <pre className={`output ${run && !run.ok ? "bad" : ""}`}>
              {running ? runStatus : [run?.output || (run?.ok ? "(no output, did you forget to print?)" : ""), run?.error ? `💥 ${run.error}` : ""].filter(Boolean).join("\n")}
            </pre>
          )}
          {reviewError && <p className="error">{reviewError}</p>}

          {reviews[0] && <ReviewCard review={reviews[0]} />}
          {reviews.length > 1 && <p className="muted small">{reviews.length - 1} earlier attempt(s) are on your Stats page.</p>}
          {floor.status === "cleared" && next && !party && (
            <a className="btn primary" href={`#/floor/${next.id}`}>
              Take the stairs to Floor {next.number} ➜
            </a>
          )}
        </>
      )}

      {party && (
        <LootBox
          achievement={party.review.achievement}
          loot={party.review.loot}
          xpGained={party.xp}
          nextHref={party.nextHref}
          nextLabel={party.nextLabel}
          onClose={() => setParty(null)}
        />
      )}
    </div>
  );
}

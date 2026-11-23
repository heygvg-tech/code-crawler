import { useState } from "react";
import type { Progress } from "../lib/types";
import type { UpdateFn } from "../App";
import { activeFloor, daysBehind, levelFor, liveStreak, pushDeadlines, replaceRemaining, todaysQuest } from "../lib/game";
import { daysBetween, prettyDate, todayISO } from "../lib/dates";
import { replanRemaining } from "../lib/actions";
import { FriendlyError } from "../lib/ai";

function greeting(name: string): string {
  const h = new Date().getHours();
  if (h < 5) return `It's the middle of the night, ${name}. Respect. Concern, but respect.`;
  if (h < 12) return `Morning, ${name}. Coffee first, then dungeon.`;
  if (h < 17) return `Afternoon, ${name}. The dungeon missed you. Barely.`;
  return `Evening, ${name}. Perfect time for questionable decisions and loops.`;
}

export default function SafeRoom({ progress, update }: { progress: Progress; update: UpdateFn }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const f = activeFloor(progress);
  const quest = todaysQuest(progress);
  const behind = daysBehind(f);
  const lvl = levelFor(progress.xp);
  const cleared = progress.floors.filter((x) => x.status === "cleared").length;
  const streak = liveStreak(progress.streak);
  const daysLeft = f ? daysBetween(todayISO(), f.targetDate) : 0;

  async function replan() {
    setBusy(true);
    setNote("");
    try {
      const plan = await replanRemaining(progress);
      update((p) => replaceRemaining(p, plan.floors));
      setNote(plan.systemMessage);
    } catch (e) {
      setNote(e instanceof FriendlyError ? e.message : "The re-plan fizzled. Try again.");
    }
    setBusy(false);
  }

  return (
    <div className="safe-room">
      <section className="panel guide">
        <div className="guide-avatar">🐸</div>
        <div>
          <p className="muted small">PIP, KEEPER OF THE SAFE ROOM</p>
          <p className="guide-line">{greeting(progress.crawler.name)}</p>
        </div>
      </section>

      {f && behind > 0 && (
        <section className="panel collapse">
          <p className="pixel small">⚠️ FLOOR COLLAPSE WARNING</p>
          <p>
            Floor {f.number} was due {behind} day{behind === 1 ? "" : "s"} ago. No shame. Life happens, even in dungeons. Pick a fix:
          </p>
          <div className="row">
            <button className="btn" disabled={busy} onClick={() => update((p) => pushDeadlines(p, behind + 2))}>
              ⏳ Push my deadlines back
            </button>
            <button className="btn" disabled={busy} onClick={replan}>
              {busy ? "Re-planning..." : "🧭 Re-plan the rest to keep my end date"}
            </button>
          </div>
        </section>
      )}
      {note && <p className="system-voice">“{note}”</p>}

      <section className="panel quest">
        <p className="pixel small gold">TODAY'S QUEST</p>
        <p className="quest-text">{quest.text}</p>
        <a className="btn primary big" href={quest.href}>
          {quest.cta}
        </a>
        {f && (
          <p className="muted small">
            Floor {f.number}: {f.title} · due {prettyDate(f.targetDate)}{" "}
            {daysLeft >= 0 ? `(${daysLeft} day${daysLeft === 1 ? "" : "s"} left)` : ""}
          </p>
        )}
      </section>

      <section className="stats">
        <div className="stat">
          <span className="stat-num">{lvl.level}</span>
          <span className="stat-label">Level</span>
        </div>
        <div className="stat">
          <span className="stat-num">{progress.xp}</span>
          <span className="stat-label">XP</span>
        </div>
        <div className="stat">
          <span className="stat-num">{streak}🔥</span>
          <span className="stat-label">Day streak</span>
        </div>
        <div className="stat">
          <span className="stat-num">
            {cleared}/{progress.floors.length}
          </span>
          <span className="stat-label">Floors cleared</span>
        </div>
      </section>
    </div>
  );
}

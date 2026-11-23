import type { Progress } from "../lib/types";
import { levelFor, liveStreak } from "../lib/game";
import ReviewCard from "../components/ReviewCard";

export default function ProgressView({ progress }: { progress: Progress }) {
  const lvl = levelFor(progress.xp);
  const cleared = progress.floors.filter((f) => f.status === "cleared").length;
  const passes = progress.reviews.filter((r) => r.verdict === "pass").length;
  const titleOf = (id: string) => progress.floors.find((f) => f.id === id)?.title ?? "A floor that no longer exists";

  return (
    <div>
      <h1 className="pixel">CRAWLER STATS</h1>
      <p className="muted">
        {progress.crawler.name} · {progress.crawler.language} · started {progress.crawler.startDate}
      </p>

      <div className="panel">
        <p className="pixel small gold">
          LEVEL {lvl.level}: {lvl.title.toUpperCase()}
        </p>
        <span className="xp-bar big">
          <span className="xp-fill" style={{ width: `${(lvl.into / lvl.needed) * 100}%` }} />
        </span>
        <p className="muted small">
          {lvl.into}/{lvl.needed} XP to level {lvl.level + 1}
        </p>
      </div>

      <section className="stats">
        <div className="stat">
          <span className="stat-num">
            {cleared}/{progress.floors.length}
          </span>
          <span className="stat-label">Floors cleared</span>
        </div>
        <div className="stat">
          <span className="stat-num">{liveStreak(progress.streak)}🔥</span>
          <span className="stat-label">Current streak</span>
        </div>
        <div className="stat">
          <span className="stat-num">{progress.streak.best}</span>
          <span className="stat-label">Best streak</span>
        </div>
        <div className="stat">
          <span className="stat-num">
            {passes}/{progress.reviews.length}
          </span>
          <span className="stat-label">Reviews passed</span>
        </div>
      </section>

      <h2>Review history</h2>
      {progress.reviews.length === 0 && <p className="muted">No reviews yet. The System grows bored.</p>}
      {[...progress.reviews].reverse().map((r) => (
        <details key={r.id} className="history">
          <summary>
            {r.verdict === "pass" ? "✅" : "🛑"} {titleOf(r.floorId)} · {new Date(r.submittedAt).toLocaleDateString()}
          </summary>
          <ReviewCard review={r} />
          <pre className="output">{r.code}</pre>
        </details>
      ))}
    </div>
  );
}

import type { Progress } from "../lib/types";
import { levelFor } from "../lib/game";
import { isDemo } from "../lib/actions";

export default function Nav({ progress, page }: { progress: Progress | null; page: string }) {
  const lvl = progress ? levelFor(progress.xp) : null;
  const link = (href: string, label: string, key: string) => (
    <a href={href} className={page === key ? "nav-link active" : "nav-link"}>
      {label}
    </a>
  );
  return (
    <header className="nav">
      <a href="#/" className="logo pixel">
        🗝️ CODE CRAWLER
      </a>
      {progress && (
        <nav className="nav-links">
          {link("#/", "Safe Room", "")}
          {link("#/map", "Map", "map")}
          {link("#/progress", "Stats", "progress")}
          {link("#/settings", "Settings", "settings")}
        </nav>
      )}
      <div className="nav-right">
        {isDemo() && (
          <a href="#/settings" className="badge demo" title="No API key yet: reviews are simulated">
            DEMO MODE
          </a>
        )}
        {lvl && (
          <div className="xp" title={`${progress!.xp} XP total`}>
            <span className="xp-label">
              LV {lvl.level} · {lvl.title}
            </span>
            <span className="xp-bar">
              <span className="xp-fill" style={{ width: `${(lvl.into / lvl.needed) * 100}%` }} />
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

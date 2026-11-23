import type { Progress } from "../lib/types";
import { prettyDate } from "../lib/dates";

const ICON = { locked: "🔒", active: "⚔️", cleared: "✅" };

export default function MapView({ progress }: { progress: Progress }) {
  return (
    <div>
      <h1 className="pixel">THE MAP</h1>
      <p className="muted">
        {progress.crawler.language} · {progress.floors.length} floors · deeper = harder
      </p>
      <ol className="map">
        {progress.floors.map((f) => {
          const inner = (
            <>
              <span className="map-icon">{f.isBoss ? (f.status === "cleared" ? "🏆" : "💀") : ICON[f.status]}</span>
              <span className="map-body">
                <span className="map-num">FLOOR {f.number}</span>
                <span className="map-title">{f.title}</span>
                <span className="muted small">{f.goals.join(" · ")}</span>
              </span>
              <span className="map-date small">{prettyDate(f.targetDate)}</span>
            </>
          );
          return (
            <li key={f.id} className={`map-floor ${f.status} ${f.isBoss ? "boss" : ""}`}>
              {f.status === "locked" ? <div className="map-row">{inner}</div> : <a className="map-row" href={`#/floor/${f.id}`}>{inner}</a>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import type { Progress } from "./lib/types";
import { loadProgress, saveProgress } from "./lib/storage";
import Nav from "./components/Nav";
import Onboarding from "./pages/Onboarding";
import SafeRoom from "./pages/SafeRoom";
import MapView from "./pages/MapView";
import FloorView from "./pages/FloorView";
import ProgressView from "./pages/ProgressView";
import Settings from "./pages/Settings";

// Tiny hash router: #/map, #/floor/<id>, #/progress, #/settings. Works on GitHub Pages.
function useHashRoute(): string[] {
  const read = () => window.location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onChange = () => {
      setRoute(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

export type UpdateFn = (fn: (p: Progress) => Progress) => void;

export default function App() {
  const [progress, setProgressState] = useState<Progress | null>(loadProgress);
  const route = useHashRoute();

  const setProgress = useCallback((p: Progress | null) => {
    setProgressState(p);
    if (p) saveProgress(p);
  }, []);

  const update: UpdateFn = useCallback((fn) => {
    setProgressState((prev) => {
      if (!prev) return prev;
      const next = fn(prev);
      saveProgress(next);
      return next;
    });
  }, []);

  const [page, param] = route;

  let content;
  if (page === "settings") content = <Settings progress={progress} setProgress={setProgress} />;
  else if (!progress) content = <Onboarding onDone={setProgress} />;
  else if (page === "map") content = <MapView progress={progress} />;
  else if (page === "floor" && param) content = <FloorView key={param} progress={progress} floorId={param} update={update} />;
  else if (page === "progress") content = <ProgressView progress={progress} />;
  else content = <SafeRoom progress={progress} update={update} />;

  return (
    <div className="app">
      <Nav progress={progress} page={page ?? ""} />
      <main className="main">{content}</main>
      <footer className="footer">
        Code Crawler · open source ·{" "}
        <a href="#/settings">settings</a>
      </footer>
    </div>
  );
}

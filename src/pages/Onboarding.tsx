import { useState } from "react";
import { LANGUAGES, RUNNABLE } from "../lib/types";
import type { Goal, Language, Level, Progress } from "../lib/types";
import { generateFloors, isDemo } from "../lib/actions";
import { newStreak } from "../lib/game";
import { todayISO } from "../lib/dates";
import { FriendlyError } from "../lib/ai";

const GOALS: { id: Goal; label: string }[] = [
  { id: "job", label: "💼 Get a job" },
  { id: "project", label: "🛠️ Build a project" },
  { id: "automate", label: "🤖 Automate boring work" },
  { id: "curious", label: "🔮 Just curious" },
];

const TIMELINES = [4, 8, 12, 26];

// "Help me choose": a quick, honest recommendation.
const RECOMMEND: Record<Goal, { lang: Language; why: string }> = {
  job: { lang: "JavaScript", why: "It runs every website on Earth, and job postings are everywhere." },
  project: { lang: "JavaScript", why: "You can build things people can actually click on." },
  automate: { lang: "Python", why: "It's the king of scripts that do your chores for you." },
  curious: { lang: "Python", why: "It reads almost like English. Gentlest first floor in the dungeon." },
};

export default function Onboarding({ onDone }: { onDone: (p: Progress) => void }) {
  const [name, setName] = useState("");
  const [language, setLanguage] = useState<Language | "help">("Python");
  const [timelineWeeks, setTimeline] = useState(8);
  const [hoursPerWeek, setHours] = useState(5);
  const [level, setLevel] = useState<Level>("beginner");
  const [goal, setGoal] = useState<Goal>("curious");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const finalLanguage: Language = language === "help" ? RECOMMEND[goal].lang : language;

  async function start() {
    setLoading(true);
    setError("");
    try {
      const crawler = { name: name.trim() || "Nameless Crawler", language: finalLanguage, timelineWeeks, hoursPerWeek, level, goal, startDate: todayISO() };
      const floors = await generateFloors(crawler);
      onDone({ version: 1, crawler, floors, reviews: [], xp: 0, streak: newStreak() });
      window.location.hash = "#/";
    } catch (e) {
      setError(e instanceof FriendlyError ? e.message : "Something broke while building your dungeon. Try again.");
      setLoading(false);
    }
  }

  if (loading)
    return (
      <div className="center-screen">
        <div className="spinner">🗝️</div>
        <p className="pixel">THE SYSTEM IS BUILDING YOUR DUNGEON...</p>
        <p className="muted">Placing traps. Hiding loot. Lowering expectations.</p>
      </div>
    );

  return (
    <div className="onboarding">
      <section className="hero">
        <h1 className="pixel">WELCOME, CRAWLER.</h1>
        <p>
          You've been selected to learn to code. Each floor of this dungeon is a checkpoint. Clear them on time, get roasted by an AI code
          reviewer, collect loot. Simple.
        </p>
      </section>

      <div className="panel form">
        <label className="field">
          <span>What should the System call you?</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sir Loops-a-Lot" maxLength={40} />
        </label>

        <div className="field">
          <span>Pick your language</span>
          <div className="choices">
            {LANGUAGES.map((l) => (
              <button key={l} className={language === l ? "choice on" : "choice"} onClick={() => setLanguage(l)}>
                {l}
                {!RUNNABLE.includes(l) && <small> review-only</small>}
              </button>
            ))}
            <button className={language === "help" ? "choice on" : "choice"} onClick={() => setLanguage("help")}>
              🤔 Help me choose
            </button>
          </div>
          {language === "help" && (
            <p className="hint">
              Based on your goal: <strong>{RECOMMEND[goal].lang}</strong>. {RECOMMEND[goal].why}
            </p>
          )}
          {!RUNNABLE.includes(finalLanguage) && (
            <p className="hint">{finalLanguage} can't run in the browser, so you'll run code on your computer and paste it in for review.</p>
          )}
        </div>

        <div className="field">
          <span>What's your goal?</span>
          <div className="choices">
            {GOALS.map((g) => (
              <button key={g.id} className={goal === g.id ? "choice on" : "choice"} onClick={() => setGoal(g.id)}>
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span>How fast do you want to go?</span>
          <div className="choices">
            {TIMELINES.map((w) => (
              <button key={w} className={timelineWeeks === w ? "choice on" : "choice"} onClick={() => setTimeline(w)}>
                {w < 26 ? `${w} weeks` : "6 months"}
              </button>
            ))}
          </div>
        </div>

        <label className="field">
          <span>
            Hours per week you can actually commit: <strong>{hoursPerWeek}</strong>
          </span>
          <input type="range" min={1} max={20} value={hoursPerWeek} onChange={(e) => setHours(Number(e.target.value))} />
        </label>

        <div className="field">
          <span>Your experience</span>
          <div className="choices">
            <button className={level === "beginner" ? "choice on" : "choice"} onClick={() => setLevel("beginner")}>
              🐣 Total beginner
            </button>
            <button className={level === "some-experience" ? "choice on" : "choice"} onClick={() => setLevel("some-experience")}>
              🗡️ I've dabbled
            </button>
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        <button className="btn primary big" onClick={start}>
          ENTER THE DUNGEON
        </button>
        <p className="muted small center">
          {isDemo() ? (
            <>
              No API key yet, so you'll play in demo mode. <a href="#/settings">Add a key</a> for real AI reviews.
            </>
          ) : (
            "API key found. The real System is watching."
          )}
        </p>
      </div>
    </div>
  );
}

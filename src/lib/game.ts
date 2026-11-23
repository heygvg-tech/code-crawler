// Game rules: XP, levels, streaks, floors and "what's next".
import { BOSS_EVERY, REST_DAYS_PER_WEEK, XP_PER_LEVEL } from "./config";
import { addDays, daysBetween, todayISO } from "./dates";
import type { Crawler, Floor, Progress, Streak } from "./types";
import type { OutlineFloor } from "./validate";

export const XP = { lesson: 10, submit: 15, pass: 100, bossPass: 250 };

const LEVEL_TITLES = [
  "Fresh Meat",
  "Tutorial Survivor",
  "Semicolon Scavenger",
  "Loop Wrangler",
  "Bug Squasher",
  "Function Fiend",
  "Stack Trace Whisperer",
  "Refactor Rogue",
  "Dungeon Architect",
  "Legend of the Lower Floors",
];

export function levelFor(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  return {
    level,
    title: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)],
    into: xp % XP_PER_LEVEL,
    needed: XP_PER_LEVEL,
  };
}

// Roughly one floor per week, more if you have lots of hours. 4 to 24 floors.
export function floorCountFor(c: Pick<Crawler, "timelineWeeks" | "hoursPerWeek">): number {
  const raw = Math.round((c.timelineWeeks * Math.min(c.hoursPerWeek, 12)) / 5);
  return Math.max(4, Math.min(24, raw));
}

export function endDateFor(c: Crawler): string {
  return addDays(c.startDate, c.timelineWeeks * 7);
}

// Spread floors evenly between two dates.
export function buildFloors(outline: OutlineFloor[], from: string, to: string, startNumber = 1): Floor[] {
  const span = Math.max(outline.length, daysBetween(from, to));
  return outline.map((f, i) => {
    const number = startNumber + i;
    return {
      id: `floor-${number}-${Math.random().toString(36).slice(2, 7)}`,
      number,
      title: f.title,
      goals: f.goals,
      targetDate: addDays(from, Math.round((span * (i + 1)) / outline.length)),
      isBoss: number % BOSS_EVERY === 0 || f.title.toUpperCase().startsWith("BOSS"),
      status: i === 0 && startNumber === 1 ? "active" : "locked",
    };
  });
}

export function newStreak(today = todayISO()): Streak {
  return { current: 0, best: 0, lastActiveDate: null, restDaysUsed: 0, restWeekStart: today };
}

// Call whenever the crawler does something real. Missed days are forgiven
// up to REST_DAYS_PER_WEEK per week.
export function recordActivity(s: Streak, today = todayISO()): Streak {
  if (s.lastActiveDate === today) return s;
  let { restDaysUsed, restWeekStart } = s;
  if (daysBetween(restWeekStart, today) >= 7) {
    restWeekStart = today;
    restDaysUsed = 0;
  }
  let current: number;
  if (!s.lastActiveDate) current = 1;
  else {
    const missed = daysBetween(s.lastActiveDate, today) - 1;
    if (missed <= 0) current = s.current + 1;
    else if (restDaysUsed + missed <= REST_DAYS_PER_WEEK) {
      current = s.current + 1;
      restDaysUsed += missed;
    } else current = 1;
  }
  return { current, best: Math.max(s.best, current), lastActiveDate: today, restDaysUsed, restWeekStart };
}

// What the streak looks like right now (it may have quietly broken).
export function liveStreak(s: Streak, today = todayISO()): number {
  if (!s.lastActiveDate) return 0;
  const missed = daysBetween(s.lastActiveDate, today) - 1;
  const restLeft = daysBetween(s.restWeekStart, today) >= 7 ? REST_DAYS_PER_WEEK : REST_DAYS_PER_WEEK - s.restDaysUsed;
  return missed > restLeft ? 0 : s.current;
}

export function activeFloor(p: Progress): Floor | undefined {
  return p.floors.find((f) => f.status === "active");
}

export function daysBehind(f: Floor | undefined, today = todayISO()): number {
  if (!f || f.status === "cleared") return 0;
  return Math.max(0, daysBetween(f.targetDate, today));
}

// Option 1 for a floor collapse: push every unfinished deadline back.
export function pushDeadlines(p: Progress, days: number): Progress {
  return {
    ...p,
    floors: p.floors.map((f) => (f.status === "cleared" ? f : { ...f, targetDate: addDays(f.targetDate, days) })),
  };
}

// Option 2: swap the unfinished floors for a new (AI or demo) plan, same end date.
export function replaceRemaining(p: Progress, outline: OutlineFloor[], today = todayISO()): Progress {
  const cleared = p.floors.filter((f) => f.status === "cleared");
  const current = activeFloor(p);
  const end = endDateFor(p.crawler);
  const to = daysBetween(today, end) >= outline.length ? end : addDays(today, outline.length * 3);
  const fresh = buildFloors(outline, today, to, cleared.length + 1).map((f, i) => ({
    ...f,
    status: (i === 0 ? "active" : "locked") as Floor["status"],
  }));
  // Keep the current floor's lessons and code if its title survived the re-plan.
  if (current && fresh[0] && fresh[0].title === current.title) {
    fresh[0] = { ...fresh[0], details: current.details, code: current.code, id: current.id };
  }
  return { ...p, floors: [...cleared, ...fresh] };
}

export type Quest = { text: string; cta: string; href: string };

// The Safe Room's "what to do today".
export function todaysQuest(p: Progress): Quest {
  const f = activeFloor(p);
  if (!f) return { text: "Every floor is cleared. You beat the dungeon. Go touch grass, champion.", cta: "See your stats", href: "#/progress" };
  const href = `#/floor/${f.id}`;
  if (!f.details) return { text: `Floor ${f.number} is unlocked and suspiciously quiet. Go see what's inside.`, cta: `Enter Floor ${f.number}`, href };
  const lesson = f.details.lessons.find((l) => !l.done);
  if (lesson) return { text: `Next lesson: "${lesson.title.replace(/^Read:\s*/, "")}". Knowledge is armor. Flimsy armor, but armor.`, cta: "Open the lesson", href };
  const last = [...p.reviews].reverse().find((r) => r.floorId === f.id);
  if (last && last.verdict === "needs-revision")
    return { text: "The System flagged some problems in your last attempt. Fix them and try again.", cta: "Fix your code", href };
  const touched = f.code && f.code.trim() !== f.details.exercise.starterCode.trim();
  if (!touched) return { text: `Lessons done. Time to write code for "${f.title}".`, cta: "Start the exercise", href };
  return { text: "Your code is ready. Submit it to the System and pray.", cta: "Submit for review", href };
}

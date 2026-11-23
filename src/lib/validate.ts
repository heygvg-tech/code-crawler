// AI output is untrusted: it can be cut off, misshapen or just weird.
// Every response goes through one of these checks before it touches your save.
import type { Loot, Problem, Progress } from "./types";

export class ValidationError extends Error {}

const isObj = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);

function str(x: unknown, field: string): string {
  if (typeof x !== "string" || !x.trim()) throw new ValidationError(`Missing or empty "${field}"`);
  return x.trim();
}

function strArr(x: unknown, field: string, min = 1): string[] {
  if (!Array.isArray(x)) throw new ValidationError(`"${field}" should be a list`);
  const out = x.filter((s): s is string => typeof s === "string" && s.trim() !== "").map((s) => s.trim());
  if (out.length < min) throw new ValidationError(`"${field}" needs at least ${min} item(s)`);
  return out;
}

export type OutlineFloor = { title: string; goals: string[] };

export function validateOutline(x: unknown): OutlineFloor[] {
  if (!isObj(x) || !Array.isArray(x.floors)) throw new ValidationError('Expected {"floors": [...]}');
  const floors = x.floors.map((f, i) => {
    if (!isObj(f)) throw new ValidationError(`Floor ${i + 1} is not an object`);
    return { title: str(f.title, "title"), goals: strArr(f.goals, "goals") };
  });
  if (floors.length === 0) throw new ValidationError("No floors returned");
  return floors;
}

export type RawLesson = { title: string; explain: string; keyPoints: string[]; example: string; resourceId: string };

export type RawFloorDetails = {
  lessons: RawLesson[];
  exercise: { prompt: string; starterCode: string; doneWhen: string[]; example: string };
};

export function validateFloorDetails(x: unknown): RawFloorDetails {
  if (!isObj(x) || !Array.isArray(x.lessons) || !isObj(x.exercise))
    throw new ValidationError('Expected {"lessons": [...], "exercise": {...}}');
  const lessons = x.lessons.filter(isObj).map((l) => ({
    title: str(l.title, "lesson title"),
    explain: str(l.explain, "lesson explain"),
    keyPoints: Array.isArray(l.keyPoints) ? strArr(l.keyPoints, "keyPoints", 0) : [],
    example: typeof l.example === "string" ? l.example.replace(/\s+$/, "") : "",
    resourceId: typeof l.resourceId === "string" ? l.resourceId : "",
  }));
  if (lessons.length === 0) throw new ValidationError("No lessons returned");
  const e = x.exercise;
  return {
    lessons,
    exercise: {
      prompt: str(e.prompt, "exercise prompt"),
      starterCode: typeof e.starterCode === "string" ? e.starterCode : "",
      doneWhen: strArr(e.doneWhen, "doneWhen"),
      example: typeof e.example === "string" ? e.example.replace(/\s+$/, "") : "",
    },
  };
}

export type RawReview = {
  verdict: "pass" | "needs-revision";
  systemMessage: string;
  achievement: string | null;
  works: string[];
  problems: Problem[];
  studyNext: string[];
  loot: Loot | null;
};

export function validateReview(x: unknown): RawReview {
  if (!isObj(x)) throw new ValidationError("Review is not an object");
  if (x.verdict !== "pass" && x.verdict !== "needs-revision")
    throw new ValidationError('verdict must be "pass" or "needs-revision"');
  const problems: Problem[] = Array.isArray(x.problems)
    ? x.problems.filter(isObj).map((p) => ({
        severity: p.severity === "high" || p.severity === "low" ? p.severity : "medium",
        note: str(p.note, "problem note"),
      }))
    : [];
  let loot: Loot | null = null;
  if (x.verdict === "pass" && isObj(x.loot) && typeof x.loot.content === "string") {
    const kind = x.loot.kind === "resource" || x.loot.kind === "challenge" ? x.loot.kind : "tip";
    loot = { kind, content: x.loot.content };
  }
  return {
    verdict: x.verdict,
    systemMessage: typeof x.systemMessage === "string" ? x.systemMessage : "THE SYSTEM HAS REVIEWED YOUR OFFERING.",
    achievement: x.verdict === "pass" && typeof x.achievement === "string" ? x.achievement : null,
    works: strArr(x.works ?? [], "works", 0),
    problems,
    studyNext: strArr(x.studyNext ?? [], "studyNext", 0),
    loot,
  };
}

export type RawReplan = { systemMessage: string; floors: OutlineFloor[] };

export function validateReplan(x: unknown): RawReplan {
  if (!isObj(x)) throw new ValidationError("Re-plan is not an object");
  return {
    systemMessage: typeof x.systemMessage === "string" ? x.systemMessage : "THE DUNGEON HAS BEEN RENOVATED.",
    floors: validateOutline(x),
  };
}

// Light check for Save Scroll imports and saved games.
export function validateProgress(x: unknown): Progress {
  if (!isObj(x) || x.version !== 1 || !isObj(x.crawler) || !Array.isArray(x.floors) || !Array.isArray(x.reviews))
    throw new ValidationError("That doesn't look like a Code Crawler Save Scroll.");
  return x as unknown as Progress;
}

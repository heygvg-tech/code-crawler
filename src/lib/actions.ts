// Every AI-powered action lives here. Each one uses the real AI when there's
// an API key, and demo mode when there isn't.
import { askJSON, fill } from "./ai";
import { getApiKey } from "./storage";
import { buildFloors, endDateFor, floorCountFor } from "./game";
import { daysBetween, todayISO } from "./dates";
import { RUNNABLE } from "./types";
import type { Crawler, Floor, Lesson, Progress, Review } from "./types";
import { validateFloorDetails, validateOutline, validateReplan, validateReview } from "./validate";
import type { OutlineFloor, RawReplan } from "./validate";
import { demoFloorDetails, demoOutline, demoReplan, demoReview } from "../data/demo";
import resources from "../data/resources.json";

import outlinePrompt from "../../prompts/generate-outline.md?raw";
import detailsPrompt from "../../prompts/floor-details.md?raw";
import reviewPrompt from "../../prompts/review-code.md?raw";
import replanPrompt from "../../prompts/adjust-plan.md?raw";

type Resource = { id: string; lang: string; source: string; title: string; url: string; tags: string[] };
const RESOURCES = resources as Resource[];

export const isDemo = () => !getApiKey();
const dramaticPause = (ms = 900) => new Promise((r) => setTimeout(r, ms));

const GOAL_TEXT = { job: "get a job", project: "build a project", automate: "automate work", curious: "just curious" };

export async function generateFloors(crawler: Crawler): Promise<Floor[]> {
  const count = floorCountFor(crawler);
  let outline: OutlineFloor[];
  if (isDemo()) {
    await dramaticPause(1400);
    outline = demoOutline(count);
  } else {
    outline = await askJSON(
      fill(outlinePrompt, {
        language: crawler.language,
        timelineWeeks: crawler.timelineWeeks,
        hoursPerWeek: crawler.hoursPerWeek,
        level: crawler.level,
        goal: GOAL_TEXT[crawler.goal],
        floorCount: count,
      }),
      validateOutline,
    );
  }
  return buildFloors(outline.slice(0, 30), crawler.startDate, endDateFor(crawler));
}

export async function generateFloorDetails(p: Progress, floor: Floor): Promise<NonNullable<Floor["details"]>> {
  const { crawler } = p;
  const pool = RESOURCES.filter((r) => r.lang === crawler.language);
  if (isDemo()) await dramaticPause();
  const raw = isDemo()
    ? demoFloorDetails(crawler, floor, pool)
    : await askJSON(
        fill(detailsPrompt, {
          language: crawler.language,
          level: crawler.level,
          goal: GOAL_TEXT[crawler.goal],
          floorNumber: floor.number,
          floorTitle: floor.title,
          isBoss: floor.isBoss,
          floorGoals: floor.goals.join("; "),
          previousTitles: p.floors.filter((f) => f.status === "cleared").map((f) => f.title).join("; ") || "none yet",
          resources: pool.map((r) => `${r.id} | ${r.title} (${r.tags.join(", ")})`).join("\n"),
          runNote: RUNNABLE.includes(crawler.language)
            ? "The code runs in a browser sandbox: no input(), prompt(), files, network or extra libraries. Use hardcoded values and print / console.log."
            : `The crawler runs ${crawler.language} on their own computer. Keep it to the standard library.`,
        }),
        validateFloorDetails,
      );

  // Only keep lessons that point at a real curated resource: no made-up links.
  const lessons: Lesson[] = raw.lessons.flatMap((l) => {
    const r = pool.find((x) => x.id === l.resourceId);
    return r ? [{ title: l.title, summary: l.summary, url: r.url, source: r.source, done: false }] : [];
  });
  if (lessons.length === 0 && pool[0])
    lessons.push({ title: pool[0].title, summary: "Start here for this floor's concepts.", url: pool[0].url, source: pool[0].source, done: false });

  return { lessons, exercise: raw.exercise };
}

export async function reviewCode(p: Progress, floor: Floor, code: string, runOutput: string): Promise<Review> {
  const ex = floor.details!.exercise;
  if (isDemo()) await dramaticPause(1600);
  const raw = isDemo()
    ? demoReview(code, ex.starterCode)
    : await askJSON(
        fill(reviewPrompt, {
          language: p.crawler.language,
          floorTitle: floor.title,
          isBoss: floor.isBoss,
          exercisePrompt: ex.prompt,
          doneWhen: ex.doneWhen.map((d) => `- ${d}`).join("\n"),
          runOutput: runOutput || "(not run)",
          code,
        }),
        validateReview,
      );
  return {
    ...raw,
    id: `review-${Date.now()}`,
    floorId: floor.id,
    submittedAt: new Date().toISOString(),
    code,
  };
}

export async function replanRemaining(p: Progress): Promise<RawReplan> {
  const remaining = p.floors.filter((f) => f.status !== "cleared");
  if (isDemo()) {
    await dramaticPause();
    return demoReplan(remaining);
  }
  const active = remaining[0];
  const result = await askJSON(
    fill(replanPrompt, {
      language: p.crawler.language,
      hoursPerWeek: p.crawler.hoursPerWeek,
      today: todayISO(),
      endDate: endDateFor(p.crawler),
      daysBehind: active ? Math.max(0, daysBetween(active.targetDate, todayISO())) : 0,
      remainingFloors: remaining.map((f) => `${f.number}. ${f.title}: ${f.goals.join("; ")} (due ${f.targetDate})`).join("\n"),
      remainingCount: remaining.length,
    }),
    validateReplan,
  );
  result.floors = result.floors.slice(0, remaining.length); // never add floors
  return result;
}

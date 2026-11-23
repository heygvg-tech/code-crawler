// The whole data model for Code Crawler.

export const LANGUAGES = ["Python", "JavaScript", "Java", "C#", "Go", "Rust"] as const;
export type Language = (typeof LANGUAGES)[number];

// These two can run right in the browser. The rest are "review-only".
export const RUNNABLE: Language[] = ["Python", "JavaScript"];

export type Level = "beginner" | "some-experience";
export type Goal = "job" | "project" | "automate" | "curious";

export type Crawler = {
  name: string;
  language: Language;
  timelineWeeks: number;
  hoursPerWeek: number;
  level: Level;
  goal: Goal;
  startDate: string; // YYYY-MM-DD
};

export type Lesson = { title: string; summary: string; url: string; source: string; done: boolean };

export type Exercise = { prompt: string; starterCode: string; doneWhen: string[] };

export type FloorStatus = "locked" | "active" | "cleared";

export type Floor = {
  id: string;
  number: number;
  title: string;
  goals: string[];
  targetDate: string;
  isBoss: boolean;
  status: FloorStatus;
  details?: { lessons: Lesson[]; exercise: Exercise }; // generated when the floor unlocks
  code?: string; // the crawler's current attempt
};

export type Problem = { severity: "high" | "medium" | "low"; note: string };
export type Loot = { kind: "tip" | "resource" | "challenge"; content: string };

export type Review = {
  id: string;
  floorId: string;
  submittedAt: string;
  code: string;
  verdict: "pass" | "needs-revision";
  systemMessage: string;
  achievement: string | null;
  works: string[];
  problems: Problem[];
  studyNext: string[];
  loot: Loot | null;
};

export type Streak = {
  current: number;
  best: number;
  lastActiveDate: string | null;
  restDaysUsed: number;
  restWeekStart: string;
};

export type Progress = {
  version: 1;
  crawler: Crawler;
  floors: Floor[];
  reviews: Review[];
  xp: number;
  streak: Streak;
};

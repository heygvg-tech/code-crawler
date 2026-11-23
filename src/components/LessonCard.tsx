import type { Language, Lesson } from "../lib/types";
import { XP } from "../lib/game";
import ExampleBlock from "./ExampleBlock";

type Props = {
  lesson: Lesson;
  index: number;
  open: boolean;
  fallbackLang: Language;
  onToggle: () => void;
  onDone: () => void;
};

// One bite-sized lesson: explanation, key points, runnable example.
export default function LessonCard({ lesson, index, open, fallbackLang, onToggle, onDone }: Props) {
  const text = lesson.explain ?? lesson.summary ?? "";
  const points = lesson.keyPoints ?? [];
  return (
    <div className={`lesson ${lesson.done ? "done" : ""} ${open ? "open" : ""}`}>
      <button className="lesson-head" onClick={onToggle} aria-expanded={open}>
        <span className="lesson-num">{lesson.done ? "✓" : index + 1}</span>
        <span className="lesson-title">{lesson.title}</span>
        <span className="lesson-chev">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="lesson-body">
          <p className="lesson-explain">{text}</p>
          {points.length > 0 && (
            <>
              <h4>Remember</h4>
              <ul className="key-points">
                {points.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </>
          )}
          {lesson.example && <ExampleBlock code={lesson.example} language={lesson.exampleLang ?? fallbackLang} label="EXAMPLE" />}
          <div className="row">
            <button className={lesson.done ? "btn ghost" : "btn primary"} onClick={onDone}>
              {lesson.done ? "Mark as not done" : `Got it ✓  +${XP.lesson} XP`}
            </button>
            {lesson.url && (
              <a className="muted small" href={lesson.url} target="_blank" rel="noreferrer">
                Want more? {lesson.source} ↗
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import type { Review } from "../lib/types";

const SEVERITY = { high: "🔥", medium: "⚠️", low: "💡" };

export default function ReviewCard({ review }: { review: Review }) {
  const pass = review.verdict === "pass";
  return (
    <div className={`panel review ${pass ? "pass" : "fail"}`}>
      <div className="review-head">
        <span className="pixel small">{pass ? "✅ PASSED" : "🛑 NEEDS REVISION"}</span>
        <span className="muted small">{new Date(review.submittedAt).toLocaleString()}</span>
      </div>
      <p className="system-voice">“{review.systemMessage}”</p>
      {review.achievement && <p className="achievement-inline">{review.achievement}</p>}

      {review.works.length > 0 && (
        <>
          <h4>What works</h4>
          <ul>
            {review.works.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </>
      )}
      {review.problems.length > 0 && (
        <>
          <h4>Problems</h4>
          <ul className="problems">
            {review.problems.map((p, i) => (
              <li key={i}>
                <span title={p.severity}>{SEVERITY[p.severity]}</span> {p.note}
              </li>
            ))}
          </ul>
        </>
      )}
      {review.studyNext.length > 0 && (
        <>
          <h4>Study next</h4>
          <ul>
            {review.studyNext.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

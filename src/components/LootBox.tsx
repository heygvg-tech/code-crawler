import { useState } from "react";
import type { Loot } from "../lib/types";
import Confetti from "./Confetti";

type Props = {
  achievement: string | null;
  loot: Loot | null;
  xpGained: number;
  nextLabel: string;
  nextHref: string;
  onClose: () => void;
};

const LOOT_LABEL = { tip: "🧠 Bonus Tip", resource: "📜 Scroll of Knowledge", challenge: "⚔️ Side Quest" };

export default function LootBox({ achievement, loot, xpGained, nextLabel, nextHref, onClose }: Props) {
  const [stage, setStage] = useState<"closed" | "shaking" | "open">("closed");

  const open = () => {
    setStage("shaking");
    setTimeout(() => setStage("open"), 800);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal>
      <Confetti />
      <div className="modal loot-modal">
        <p className="pixel achievement">{achievement ?? "FLOOR CLEARED!"}</p>
        <p className="xp-gain">+{xpGained} XP</p>

        {stage !== "open" ? (
          <button className={`chest ${stage === "shaking" ? "shake" : ""}`} onClick={open} disabled={stage === "shaking"}>
            <span className="chest-emoji">🎁</span>
            <span className="pixel small">{stage === "shaking" ? "OPENING..." : "CLICK TO OPEN LOOT BOX"}</span>
          </button>
        ) : (
          <div className="loot-reveal">
            <span className="chest-emoji">✨</span>
            {loot ? (
              <>
                <p className="loot-kind">{LOOT_LABEL[loot.kind]}</p>
                <p>{loot.content}</p>
              </>
            ) : (
              <p>The box is empty. The System says this builds character.</p>
            )}
          </div>
        )}

        <div className="row center">
          <a className="btn primary" href={nextHref} onClick={onClose}>
            {nextLabel}
          </a>
          <button className="btn ghost" onClick={onClose}>
            Stay here
          </button>
        </div>
      </div>
    </div>
  );
}

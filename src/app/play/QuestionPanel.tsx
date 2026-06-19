"use client";

import type { Question, RacePhase } from "@/lib/game/types";
import type { RaceStrings } from "@/lib/i18n";

interface QuestionPanelProps {
  question: Question;
  phase: RacePhase;
  /** human's chosen answer index this round, or null */
  selectedAnswer: number | null;
  /** milliseconds left on the clock (drives the countdown bar) */
  msLeft: number;
  totalMs: number;
  /** true if this is the final question (changes the reveal button label) */
  isLast: boolean;
  /** did the human get it right this round (known during reveal) */
  humanCorrect: boolean;
  onAnswer: (index: number) => void;
  onNext: () => void;
  t: RaceStrings;
}

const LETTERS = ["A", "B", "C", "D", "E"];

export default function QuestionPanel({
  question,
  phase,
  selectedAnswer,
  msLeft,
  totalMs,
  isLast,
  humanCorrect,
  onAnswer,
  onNext,
  t,
}: QuestionPanelProps) {
  const isReveal = phase === "reveal";
  const pct = totalMs > 0 ? Math.max(0, Math.min(100, (msLeft / totalMs) * 100)) : 0;
  const secondsLeft = Math.ceil(msLeft / 1000);

  const barColor =
    pct > 50 ? "#22c55e" : pct > 25 ? "#f5b82e" : "#ef4444";

  return (
    <div
      className="rounded-2xl p-4 ring-1 ring-white/10 sm:p-5"
      style={{ background: "rgba(12,40,50,0.92)" }}
    >
      {/* topic + clock */}
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#7fb0bd]">
          {question.t}
        </span>
        {!isReveal ? (
          <span className="font-mono text-sm text-[#cfe3e8]">
            {t.timeLeft} {secondsLeft}
            {t.sec}
          </span>
        ) : null}
      </div>

      {/* countdown bar (question phase only) */}
      {!isReveal ? (
        <div
          className="mb-4 h-2 w-full overflow-hidden rounded-full"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-100 ease-linear motion-reduce:transition-none"
            style={{ width: `${pct}%`, background: barColor }}
          />
        </div>
      ) : null}

      {/* question text */}
      <p className="mb-4 text-base font-semibold leading-snug text-[#f0ece0] sm:text-lg">
        {question.q}
      </p>

      {/* answers */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {question.a.map((option, idx) => {
          const isCorrect = idx === question.c;
          const isPicked = idx === selectedAnswer;

          // Decide styling per state
          let bg = "rgba(255,255,255,0.05)";
          let border = "rgba(255,255,255,0.12)";
          let textColor = "#e8efe1";

          if (isReveal) {
            if (isCorrect) {
              bg = "rgba(34,197,94,0.22)";
              border = "#22c55e";
              textColor = "#dcfce7";
            } else if (isPicked) {
              bg = "rgba(239,68,68,0.22)";
              border = "#ef4444";
              textColor = "#fee2e2";
            } else {
              bg = "rgba(255,255,255,0.03)";
              border = "rgba(255,255,255,0.08)";
              textColor = "#9fb3b9";
            }
          } else if (isPicked) {
            bg = "rgba(245,184,46,0.2)";
            border = "#f5b82e";
            textColor = "#fff7e6";
          }

          const locked = isReveal || selectedAnswer !== null;

          return (
            <button
              key={idx}
              type="button"
              disabled={locked}
              onClick={() => onAnswer(idx)}
              className="flex items-start gap-2 rounded-xl px-3 py-3 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5b82e] disabled:cursor-default sm:text-base"
              style={{
                background: bg,
                border: `1px solid ${border}`,
                color: textColor,
              }}
            >
              <span className="font-black text-[#f5b82e]">{LETTERS[idx]}.</span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      {/* reveal footer: outcome + next */}
      {isReveal ? (
        <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <p className="text-sm font-semibold" style={{ color: humanCorrect ? "#22c55e" : "#fca5a5" }}>
            {humanCorrect ? `✓ ${t.correct}` : `✗ ${t.correctAnswer} ${question.a[question.c]}`}
          </p>
          <button
            type="button"
            onClick={onNext}
            className="w-full rounded-xl px-6 py-3 text-sm font-bold transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto"
            style={{ background: "#f5b82e", color: "#0c2832" }}
          >
            {isLast ? t.seeResults : t.nextQuestion}
          </button>
        </div>
      ) : null}
    </div>
  );
}

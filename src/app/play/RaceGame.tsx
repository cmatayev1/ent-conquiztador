"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { GameMode, Lang, RaceState } from "@/lib/game/types";
import {
  createRace,
  resolveQuestion,
  nextQuestion,
  currentQuestion,
  standings,
  winners,
  QUESTION_TIME,
} from "@/lib/game/race";
import { SUBJECTS, countBySubject } from "@/data/questions";
import { I18N } from "@/lib/i18n";
import RaceTrack from "./RaceTrack";
import QuestionPanel from "./QuestionPanel";

const TOTAL_MS = QUESTION_TIME * 1000;
const HUMAN_ID = "p1";

export default function RaceGame() {
  const [lang, setLang] = useState<Lang>("kk");
  const [mode] = useState<GameMode>("ai"); // hotseat comes later
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [race, setRace] = useState<RaceState | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [msLeft, setMsLeft] = useState<number>(TOTAL_MS);

  // refs to read live values inside timers without stale closures
  const raceRef = useRef<RaceState | null>(race);
  const msLeftRef = useRef<number>(msLeft);
  const answeredRef = useRef<boolean>(false);
  useEffect(() => {
    raceRef.current = race;
  }, [race]);
  useEffect(() => {
    msLeftRef.current = msLeft;
  }, [msLeft]);

  const t = I18N[lang];

  const doResolve = useCallback((answer: number | null, ms: number) => {
    const st = raceRef.current;
    if (!st || st.phase !== "question") return;
    setRace(resolveQuestion(st, { [HUMAN_ID]: { answer, msLeft: ms } }));
  }, []);

  // Timer: depends on phase + questionIndex ONLY (never msLeft), so it never
  // cancels itself. Uses elapsed-time math to avoid drift.
  useEffect(() => {
    if (!race || race.phase !== "question") return;
    answeredRef.current = false;
    setSelectedAnswer(null);
    setMsLeft(TOTAL_MS);
    const started = Date.now();
    const id = setInterval(() => {
      const remaining = Math.max(0, TOTAL_MS - (Date.now() - started));
      setMsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(id);
        if (!answeredRef.current) {
          answeredRef.current = true;
          doResolve(null, 0);
        }
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [race?.phase, race?.questionIndex, doResolve]);

  function handleAnswer(idx: number) {
    if (!race || race.phase !== "question") return;
    if (answeredRef.current) return;
    answeredRef.current = true;
    setSelectedAnswer(idx);
    const ms = msLeftRef.current;
    // brief beat so the pick highlights before reveal
    window.setTimeout(() => doResolve(idx, ms), 450);
  }

  function handleNext() {
    const st = raceRef.current;
    if (!st || st.phase !== "reveal") return;
    setRace(nextQuestion(st));
  }

  function toggleSubject(s: string) {
    setSelectedSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function startRace() {
    if (selectedSubjects.length === 0) return;
    const r = createRace({ mode, subjects: selectedSubjects });
    if (r.totalQuestions === 0) return;
    setRace(r);
  }

  function playAgain() {
    const r = createRace({ mode, subjects: selectedSubjects });
    if (r.totalQuestions === 0) {
      setRace(null);
      return;
    }
    setRace(r);
  }

  function backToMenu() {
    setRace(null);
  }

  // ----- MENU -----
  if (!race) {
    return (
      <SubjectSelect
        lang={lang}
        onLang={setLang}
        selected={selectedSubjects}
        onToggle={toggleSubject}
        onStart={startRace}
        t={t}
      />
    );
  }

  // ----- RESULTS -----
  if (race.phase === "finished") {
    return (
      <Results
        ranked={standings(race)}
        winnerIds={winners(race).map((w) => w.id)}
        onPlayAgain={playAgain}
        onMenu={backToMenu}
        t={t}
      />
    );
  }

  // ----- RACE (question / reveal) -----
  const q = currentQuestion(race);
  if (!q) {
    // safety: no question available — treat as finished
    return (
      <Results
        ranked={standings(race)}
        winnerIds={winners(race).map((w) => w.id)}
        onPlayAgain={playAgain}
        onMenu={backToMenu}
        t={t}
      />
    );
  }

  const human = race.racers.find((r) => r.id === HUMAN_ID);
  const humanResult = race.lastResults ? race.lastResults[HUMAN_ID] : undefined;
  const humanCorrect = humanResult ? humanResult.correct : false;
  const isLast = race.questionIndex >= race.totalQuestions - 1;

  return (
    <div className="min-h-screen px-3 py-4 sm:px-4" style={{ background: "#0c2832" }}>
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        {/* header: back + progress */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={backToMenu}
            className="rounded-lg px-3 py-1.5 text-sm text-[#cfe3e8] ring-1 ring-white/10 transition-colors hover:bg-white/5"
          >
            ← {t.backToMenu}
          </button>
          <span className="text-sm font-semibold text-[#cfe3e8]">
            {t.question} {race.questionIndex + 1} {t.of} {race.totalQuestions}
          </span>
        </div>

        {/* the steppe track */}
        <RaceTrack racers={race.racers} phase={race.phase} lastResults={race.lastResults} />

        {/* question / reveal */}
        <QuestionPanel
          question={q}
          phase={race.phase}
          selectedAnswer={selectedAnswer}
          msLeft={msLeft}
          totalMs={TOTAL_MS}
          isLast={isLast}
          humanCorrect={humanCorrect}
          onAnswer={handleAnswer}
          onNext={handleNext}
          t={t}
        />

        {human ? (
          <p className="text-center text-xs text-[#5f8794]">
            {t.you}: {human.correctCount} {t.correctAnswers}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Subject selection screen                                            */
/* ------------------------------------------------------------------ */

function SubjectSelect({
  lang,
  onLang,
  selected,
  onToggle,
  onStart,
  t,
}: {
  lang: Lang;
  onLang: (l: Lang) => void;
  selected: string[];
  onToggle: (s: string) => void;
  onStart: () => void;
  t: typeof I18N["ru"];
}) {
  const canStart = selected.length > 0;

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: "#0c2832" }}>
      <div className="mx-auto max-w-2xl">
        {/* hero */}
        <div className="mb-6 text-center">
          <h1
            className="text-4xl font-black tracking-tight sm:text-6xl"
            style={{ color: "#f5b82e" }}
          >
            {t.title}
          </h1>
          <p className="mt-2 text-lg font-semibold text-[#9fd0db]">{t.subtitle}</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#7fb0bd]">
            {t.tagline}
          </p>
        </div>

        {/* language */}
        <div className="mb-4 flex justify-center gap-2">
          {(["ru", "kk"] as Lang[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => onLang(l)}
              className="rounded-lg px-4 py-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5b82e]"
              style={
                lang === l
                  ? { background: "#f5b82e", color: "#0c2832" }
                  : { background: "rgba(255,255,255,0.06)", color: "#cfe3e8" }
              }
            >
              {l === "ru" ? "Русский" : "Қазақша"}
            </button>
          ))}
        </div>

        {/* mode */}
        <div
          className="mb-4 rounded-2xl p-4 ring-1 ring-white/10"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#7fb0bd]">
            {t.chooseMode}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-xl px-4 py-3 text-sm font-bold"
              style={{ background: "#2ba9c9", color: "#06212a" }}
            >
              {t.vsAI}
            </button>
            <button
              type="button"
              disabled
              className="flex-1 cursor-default rounded-xl px-4 py-3 text-sm font-semibold"
              style={{ background: "rgba(255,255,255,0.04)", color: "#5f8794" }}
            >
              {t.hotseat}
              <span className="ml-1 text-[10px] uppercase">({t.soon})</span>
            </button>
          </div>
        </div>

        {/* subjects */}
        <div
          className="mb-5 rounded-2xl p-4 ring-1 ring-white/10"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <div className="mb-1 flex items-baseline justify-between">
            <div className="text-xs font-semibold uppercase tracking-widest text-[#7fb0bd]">
              {t.chooseSubjects}
            </div>
            <div className="text-[11px] text-[#5f8794]">{t.chooseSubjectsHint}</div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SUBJECTS.map((s) => {
              const on = selected.includes(s);
              const count = countBySubject(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onToggle(s)}
                  className="flex flex-col items-start gap-0.5 rounded-xl px-3 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5b82e]"
                  style={
                    on
                      ? { background: "#f5b82e", color: "#0c2832" }
                      : { background: "rgba(255,255,255,0.05)", color: "#dbe7ea" }
                  }
                >
                  <span className="text-sm font-semibold leading-tight">
                    {t.subjects[s]}
                  </span>
                  <span
                    className="text-[10px]"
                    style={{ color: on ? "rgba(12,40,50,0.7)" : "#6f96a1" }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* start */}
        <button
          type="button"
          onClick={onStart}
          disabled={!canStart}
          className="w-full rounded-2xl py-4 text-lg font-black uppercase tracking-wide transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-default"
          style={
            canStart
              ? { background: "#f5b82e", color: "#0c2832" }
              : { background: "rgba(255,255,255,0.06)", color: "#5f8794" }
          }
        >
          {t.start}
        </button>
        {!canStart ? (
          <p className="mt-2 text-center text-xs text-[#5f8794]">{t.needSubject}</p>
        ) : null}

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-[#5f8794] underline-offset-2 hover:underline"
          >
            ← {t.backToMenu}
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Results screen                                                      */
/* ------------------------------------------------------------------ */

function Results({
  ranked,
  winnerIds,
  onPlayAgain,
  onMenu,
  t,
}: {
  ranked: ReturnType<typeof standings>;
  winnerIds: string[];
  onPlayAgain: () => void;
  onMenu: () => void;
  t: typeof I18N["ru"];
}) {
  const isDraw = winnerIds.length > 1;
  const championName =
    ranked.length > 0 ? ranked.find((r) => winnerIds.includes(r.id))?.name : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8" style={{ background: "#0c2832" }}>
      <div
        className="w-full max-w-md rounded-3xl p-6 ring-1 ring-white/10"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <div className="mb-5 text-center">
          <div className="text-4xl">🏆</div>
          <h2 className="mt-2 text-2xl font-black" style={{ color: "#f5b82e" }}>
            {t.raceOver}
          </h2>
          <p className="mt-1 text-lg font-bold text-[#e8efe1]">
            {isDraw ? t.draw : `${t.winner}: ${championName ?? ""}`}
          </p>
        </div>

        <ol className="mb-6 space-y-2">
          {ranked.map((r, i) => {
            const isWinner = winnerIds.includes(r.id);
            return (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-xl px-3 py-2.5"
                style={{
                  background: isWinner ? "rgba(245,184,46,0.14)" : "rgba(255,255,255,0.04)",
                  border: isWinner ? "1px solid rgba(245,184,46,0.5)" : "1px solid transparent",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 text-center text-sm font-bold text-[#7fb0bd]">
                    {i + 1}
                  </span>
                  <span
                    className="inline-block h-3 w-3 rounded-full ring-1 ring-black/30"
                    style={{ background: r.color }}
                  />
                  <span className="text-sm font-semibold text-[#e8efe1]">{r.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#f0ece0]">
                    {r.distance} <span className="text-[10px] font-normal text-[#7fb0bd]">{t.distance}</span>
                  </div>
                  <div className="text-[10px] text-[#6f96a1]">
                    {r.correctCount} {t.correctAnswers}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onPlayAgain}
            className="flex-1 rounded-xl py-3 text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            style={{ background: "#f5b82e", color: "#0c2832" }}
          >
            {t.playAgain}
          </button>
          <button
            type="button"
            onClick={onMenu}
            className="flex-1 rounded-xl py-3 text-sm font-bold text-[#cfe3e8] ring-1 ring-white/15 transition-colors hover:bg-white/5"
          >
            {t.backToMenu}
          </button>
        </div>
      </div>
    </div>
  );
}

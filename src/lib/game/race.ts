// Pure game logic for the Roll & Bowl race. No React, no side effects —
// every function takes inputs and returns outputs, so it's easy to test and reason about.

import type { Question, Racer, RaceState, GameMode } from "./types";
import { QUESTIONS } from "@/data/questions";

// ----------------------------------------------------------------------------
// Tunable constants (adjust freely; gameplay balance lives here)
// ----------------------------------------------------------------------------

/** Length of the track in abstract units. Rendering scales this to pixels / path length. */
export const TRACK_LENGTH = 100;

/** Seconds allowed per question. */
export const QUESTION_TIME = 20;

/** Movement for a correct answer = BASE_STEP + speed bonus (0..SPEED_BONUS_MAX). */
export const BASE_STEP = 1;
export const SPEED_BONUS_MAX = 3;

/** Default race length. */
export const DEFAULT_TOTAL_QUESTIONS = 15;

/** Palette for up to 4 racers. */
export const RACER_COLORS = ["#f43f5e", "#0ea5e9", "#22c55e", "#eab308"];

// ----------------------------------------------------------------------------
// Speed → movement
// ----------------------------------------------------------------------------

/**
 * How far a correct answer advances a racer, given how much time was left when
 * they answered. More time left = answered faster = bigger advance.
 *
 * @param msLeft   milliseconds remaining on the clock when answered
 * @param totalMs  total question time in ms (defaults to QUESTION_TIME * 1000)
 * @returns advance in track units (BASE_STEP .. BASE_STEP + SPEED_BONUS_MAX)
 */
export function advanceForCorrect(
  msLeft: number,
  totalMs: number = QUESTION_TIME * 1000
): number {
  const clamped = Math.max(0, Math.min(msLeft, totalMs));
  const fraction = totalMs > 0 ? clamped / totalMs : 0;
  const bonus = Math.round(SPEED_BONUS_MAX * fraction);
  return BASE_STEP + bonus;
}

// ----------------------------------------------------------------------------
// Question selection
// ----------------------------------------------------------------------------

/** Fisher–Yates shuffle (returns a new array; does not mutate input). */
export function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

/**
 * Build the question set for a race: shuffle all questions from the chosen
 * subjects and take up to `count`. If fewer exist, returns as many as available.
 */
export function buildRaceQuestions(
  subjects: string[],
  count: number = DEFAULT_TOTAL_QUESTIONS
): Question[] {
  const pool = QUESTIONS.filter((q) => subjects.includes(q.s));
  return shuffle(pool).slice(0, count);
}

// ----------------------------------------------------------------------------
// AI
// ----------------------------------------------------------------------------

/** Three AI difficulty tiers (accuracy). Picked for a lively but beatable field. */
export const AI_ACCURACIES = [0.55, 0.7, 0.85];

const AI_NAMES = ["Тұлпар", "Сұңқар", "Жүйрік"]; // "steed", "falcon", "swift" — KZ flavor

/**
 * Decide an AI racer's response to a question.
 * Returns whether it answered correctly and the msLeft "timestamp" of its answer
 * (simulated thinking time), so it feeds the same speed formula as a human.
 */
export function aiRespond(
  racer: Racer,
  totalMs: number = QUESTION_TIME * 1000
): { correct: boolean; msLeft: number } {
  const accuracy = racer.aiAccuracy ?? 0.7;
  const correct = Math.random() < accuracy;
  // Simulate thinking time: better AIs tend to answer a bit faster.
  // thinkFraction is the fraction of total time the AI "uses" before answering.
  const speedSkill = accuracy; // 0.55..0.85
  // faster (smaller) think time for higher skill, with randomness
  const minThink = 0.15 + (1 - speedSkill) * 0.2; // ~0.18..0.24
  const maxThink = 0.5 + (1 - speedSkill) * 0.4; // ~0.56..0.68
  const thinkFraction = minThink + Math.random() * (maxThink - minThink);
  const msUsed = Math.min(totalMs, thinkFraction * totalMs);
  const msLeft = Math.max(0, totalMs - msUsed);
  // If the AI answers incorrectly, msLeft is irrelevant (no advance), but we
  // still return a value for consistency.
  return { correct, msLeft };
}

// ----------------------------------------------------------------------------
// Race setup
// ----------------------------------------------------------------------------

/**
 * Create the initial RaceState for a new race.
 * @param mode       "ai" or "hotseat"
 * @param subjects   chosen subject ids
 * @param humanCount number of human racers (1 for vs-AI; 2-3 for hotseat)
 * @param aiCount    number of AI racers (3 for vs-AI; 0 for hotseat)
 * @param totalQuestions race length
 */
export function createRace(params: {
  mode: GameMode;
  subjects: string[];
  humanCount?: number;
  aiCount?: number;
  totalQuestions?: number;
}): RaceState {
  const {
    mode,
    subjects,
    humanCount = mode === "ai" ? 1 : 2,
    aiCount = mode === "ai" ? 3 : 0,
    totalQuestions = DEFAULT_TOTAL_QUESTIONS,
  } = params;

  const racers: Racer[] = [];
  let colorIdx = 0;

  for (let i = 0; i < humanCount; i++) {
    racers.push({
      id: "p" + (i + 1),
      name: humanCount === 1 ? "Вы" : "Игрок " + (i + 1),
      kind: "human",
      distance: 0,
      color: RACER_COLORS[colorIdx % RACER_COLORS.length],
      correctCount: 0,
    });
    colorIdx++;
  }

  for (let i = 0; i < aiCount; i++) {
    racers.push({
      id: "ai" + (i + 1),
      name: AI_NAMES[i % AI_NAMES.length],
      kind: "ai",
      distance: 0,
      color: RACER_COLORS[colorIdx % RACER_COLORS.length],
      aiAccuracy: AI_ACCURACIES[i % AI_ACCURACIES.length],
      correctCount: 0,
    });
    colorIdx++;
  }

  const questions = buildRaceQuestions(subjects, totalQuestions);

  return {
    mode,
    subjects,
    questions,
    questionIndex: 0,
    totalQuestions: questions.length,
    racers,
    phase: "question",
    humanAnswer: null,
    humanAnsweredAtMsLeft: null,
    lastResults: null,
  };
}

// ----------------------------------------------------------------------------
// Resolving a question
// ----------------------------------------------------------------------------

/**
 * Resolve the current question: compute each racer's result and advance them.
 * Pure — returns a NEW RaceState, does not mutate the input.
 *
 * @param state    current race state (phase should be "question")
 * @param humanAnswers map of humanRacerId -> { answerIndex|null, msLeft }
 *                 For vs-AI there's one human ("p1"); for hotseat, several.
 */
export function resolveQuestion(
  state: RaceState,
  humanAnswers: Record<string, { answer: number | null; msLeft: number }>
): RaceState {
  const q = state.questions[state.questionIndex];
  const totalMs = QUESTION_TIME * 1000;
  const results: Record<string, { correct: boolean; advance: number }> = {};

  const racers = state.racers.map((r) => {
    let correct = false;
    let advance = 0;

    if (r.kind === "human") {
      const ans = humanAnswers[r.id];
      if (ans && ans.answer !== null && ans.answer === q.c) {
        correct = true;
        advance = advanceForCorrect(ans.msLeft, totalMs);
      }
    } else {
      const resp = aiRespond(r, totalMs);
      if (resp.correct) {
        correct = true;
        advance = advanceForCorrect(resp.msLeft, totalMs);
      }
    }

    results[r.id] = { correct, advance };

    return {
      ...r,
      distance: Math.min(TRACK_LENGTH, r.distance + advance),
      correctCount: r.correctCount + (correct ? 1 : 0),
    };
  });

  return {
    ...state,
    racers,
    phase: "reveal",
    lastResults: results,
  };
}

/**
 * Advance from the "reveal" phase to the next question, or to "finished".
 * Pure — returns a new RaceState.
 */
export function nextQuestion(state: RaceState): RaceState {
  const nextIdx = state.questionIndex + 1;
  if (nextIdx >= state.totalQuestions) {
    return { ...state, phase: "finished", lastResults: null };
  }
  return {
    ...state,
    questionIndex: nextIdx,
    phase: "question",
    humanAnswer: null,
    humanAnsweredAtMsLeft: null,
    lastResults: null,
  };
}

// ----------------------------------------------------------------------------
// Standings / winner
// ----------------------------------------------------------------------------

/** Racers sorted by distance (desc), tie broken by correctCount (desc). */
export function standings(state: RaceState): Racer[] {
  return state.racers.slice().sort((a, b) => {
    if (b.distance !== a.distance) return b.distance - a.distance;
    return b.correctCount - a.correctCount;
  });
}

/**
 * The winner(s) of a finished race. Returns all racers tied for furthest
 * (usually one). Empty array if the race isn't finished.
 */
export function winners(state: RaceState): Racer[] {
  if (state.phase !== "finished") return [];
  const ranked = standings(state);
  if (ranked.length === 0) return [];
  const top = ranked[0];
  return ranked.filter(
    (r) => r.distance === top.distance && r.correctCount === top.correctCount
  );
}

/** Convenience: the current question, or undefined if out of range. */
export function currentQuestion(state: RaceState): Question | undefined {
  return state.questions[state.questionIndex];
}

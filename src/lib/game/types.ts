// Core game type definitions for ent-conquiztador (Roll & Bowl race)

export type Lang = "ru" | "kk";

/** A region (oblast) on the map. Static data — used for the decorative backdrop
 *  and (later) for routing the winding race path. Does not change during play. */
export interface Region {
  id: string;
  names: { en: string; ru: string; kk: string };
  cx: number;
  cy: number;
  capX: number;
  capY: number;
  city: string;
  neighbors: string[];
  d: string;
}

/** A single multiple-choice question. */
export interface Question {
  /** subject id, e.g. "history_kz" */
  s: string;
  /** topic label (Тема) */
  t: string;
  /** the question text */
  q: string;
  /** answer options (ENT uses 5; a few have 4 — variable length) */
  a: string[];
  /** index of the correct option (0-based) */
  c: number;
}

/** Who is controlling a racer. */
export type RacerKind = "human" | "ai";

/** A single racer (horse) in the race. */
export interface Racer {
  /** stable id, e.g. "p1", "ai1" */
  id: string;
  /** display name */
  name: string;
  kind: RacerKind;
  /** abstract progress along the track, 0..TRACK_LENGTH.
   *  Rendering maps this number to a position (lanes now, winding path later). */
  distance: number;
  /** color for the horse token / lane */
  color: string;
  /** AI skill: probability of answering a question correctly (0..1). Unused for humans. */
  aiAccuracy?: number;
  /** number of correct answers so far (for stats / tie-breaking) */
  correctCount: number;
}

export type GameMode = "ai" | "hotseat";

/** Phases of a race. */
export type RacePhase =
  | "menu" // choosing subjects / mode
  | "question" // a question is live, countdown running
  | "reveal" // showing who got it right + horses advancing
  | "finished"; // all questions done, results shown

/** The full mutable state of a race. */
export interface RaceState {
  mode: GameMode;
  /** subject ids the player selected */
  subjects: string[];
  /** the questions for this race, in order */
  questions: Question[];
  /** index of the current question (0-based) */
  questionIndex: number;
  /** total number of questions in the race */
  totalQuestions: number;
  racers: Racer[];
  phase: RacePhase;
  /** the human player's selected answer for the current question (null = not yet) */
  humanAnswer: number | null;
  /** ms remaining shown on the clock when the human answered (for speed scoring) */
  humanAnsweredAtMsLeft: number | null;
  /** per-question results, filled during reveal: racerId -> { correct, advance } */
  lastResults: Record<string, { correct: boolean; advance: number }> | null;
}

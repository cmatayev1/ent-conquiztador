"use client";

import { REGIONS, MAP_WIDTH, MAP_HEIGHT } from "@/lib/game/regions";
import { TRACK_LENGTH } from "@/lib/game/race";
import type { Racer, RacePhase } from "@/lib/game/types";

// Where the racing strip sits horizontally, as % of container width.
const START_PCT = 7;
const FINISH_PCT = 90;

interface RaceTrackProps {
  racers: Racer[];
  phase: RacePhase;
  lastResults: Record<string, { correct: boolean; advance: number }> | null;
}

export default function RaceTrack({ racers, phase, lastResults }: RaceTrackProps) {
  const n = racers.length;

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl ring-1 ring-white/10"
      style={{
        aspectRatio: String(MAP_WIDTH / MAP_HEIGHT),
        background:
          "linear-gradient(180deg, #15414f 0%, #103642 45%, #0c2832 100%)",
      }}
    >
      {/* Kazakhstan map, faint, as the steppe the horses cross */}
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        {REGIONS.map((r) => (
          <path
            key={r.id}
            d={r.d}
            fill="rgba(232,222,190,0.10)"
            stroke="rgba(232,222,190,0.22)"
            strokeWidth={1}
          />
        ))}
      </svg>

      {/* Finish line — a checkered post on the eastern edge */}
      <div
        className="absolute top-0 bottom-0 w-2"
        style={{
          left: `${FINISH_PCT}%`,
          backgroundImage:
            "repeating-linear-gradient(45deg, #f4f4f5 0 8px, #18181b 8px 16px)",
          opacity: 0.85,
        }}
        aria-hidden="true"
      />

      {/* Lanes + horses */}
      {racers.map((racer, i) => {
        const top = ((i + 1) / (n + 1)) * 100;
        const x =
          START_PCT + (racer.distance / TRACK_LENGTH) * (FINISH_PCT - START_PCT);
        const result = lastResults ? lastResults[racer.id] : undefined;
        const showAdvance =
          phase === "reveal" && result && result.advance > 0;

        return (
          <div key={racer.id}>
            {/* lane baseline */}
            <div
              className="absolute"
              style={{
                top: `${top}%`,
                left: `${START_PCT}%`,
                right: `${100 - FINISH_PCT}%`,
                borderTop: "1px dashed rgba(232,222,190,0.18)",
              }}
              aria-hidden="true"
            />

            {/* progress trail in the racer's color */}
            <div
              className="absolute h-[3px] rounded-full transition-all duration-700 ease-out motion-reduce:transition-none"
              style={{
                top: `${top}%`,
                left: `${START_PCT}%`,
                width: `${x - START_PCT}%`,
                background: racer.color,
                opacity: 0.45,
                transform: "translateY(-1px)",
              }}
              aria-hidden="true"
            />

            {/* lane label: color dot + name, at the western edge */}
            <div
              className="absolute flex items-center gap-1.5 -translate-y-1/2"
              style={{ top: `${top}%`, left: "0.5%" }}
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-black/30"
                style={{ background: racer.color }}
              />
            </div>

            {/* the horse */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out motion-reduce:transition-none"
              style={{ top: `${top}%`, left: `${x}%` }}
            >
              <div className="relative flex flex-col items-center">
                {showAdvance ? (
                  <span
                    className="absolute -top-4 text-[11px] font-extrabold"
                    style={{ color: racer.color }}
                  >
                    +{result!.advance}
                  </span>
                ) : null}
                <span
                  className="select-none text-2xl leading-none sm:text-3xl"
                  style={{ display: "inline-block", transform: "scaleX(-1)" }}
                  role="img"
                  aria-label={racer.name}
                >
                  🐎
                </span>
                <span
                  className="mt-0.5 max-w-[72px] truncate rounded px-1 text-[10px] font-semibold leading-tight"
                  style={{
                    color: "#0c2832",
                    background: racer.color,
                  }}
                >
                  {racer.name}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

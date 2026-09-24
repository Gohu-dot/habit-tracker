"use client";

import { useMemo, useRef, useState } from "react";
import { DAILY_TARGET_POINTS, MAX_DAILY_POINTS } from "@/lib/habits";

type PointsChartProps = {
  dailyTotals: Map<string, number>;
  monthDays: string[]; // toutes les dates ISO du mois en cours
  today: string;
};

const WIDTH = 640;
const HEIGHT = 220;
const MARGIN = { top: 16, right: 12, bottom: 28, left: 28 };
const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;

function dayLabel(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

export default function PointsChart({ dailyTotals, monthDays, today }: PointsChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const plottedDays = useMemo(
    () => monthDays.filter((day) => day <= today),
    [monthDays, today]
  );

  const xForIndex = (index: number) =>
    MARGIN.left + (monthDays.length > 1 ? (index / (monthDays.length - 1)) * PLOT_WIDTH : 0);
  const yForValue = (value: number) =>
    MARGIN.top + PLOT_HEIGHT - (Math.min(value, MAX_DAILY_POINTS) / MAX_DAILY_POINTS) * PLOT_HEIGHT;

  const points = plottedDays.map((day, i) => ({
    day,
    points: dailyTotals.get(day) ?? 0,
    x: xForIndex(i),
    y: yForValue(dailyTotals.get(day) ?? 0),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath =
    points.length > 0
      ? `${linePath} L${points[points.length - 1].x},${MARGIN.top + PLOT_HEIGHT} L${points[0].x},${
          MARGIN.top + PLOT_HEIGHT
        } Z`
      : "";

  const targetY = yForValue(DAILY_TARGET_POINTS);
  const lastPoint = points[points.length - 1];

  // Repères d'axe : 1er, mi-mois, dernier jour du mois (assez espacés pour rester lisibles).
  const xTickIndices = Array.from(
    new Set([0, Math.floor((monthDays.length - 1) / 2), monthDays.length - 1])
  );

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relativeX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    let closest = 0;
    let closestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - relativeX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setHoverIndex(closest);
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="rounded-xl border border-sand bg-ivory p-4 shadow-sm">
      <p className="mb-2 text-sm font-medium text-ink">Évolution du mois</p>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full touch-none"
          role="img"
          aria-label={`Points par jour en ${new Date(`${today}T00:00:00`).toLocaleDateString("fr-FR", { month: "long" })}, objectif ${DAILY_TARGET_POINTS} points par jour`}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        >
          {/* Ligne de seuil (objectif quotidien) */}
          <line
            x1={MARGIN.left}
            x2={WIDTH - MARGIN.right}
            y1={targetY}
            y2={targetY}
            className="text-ink-soft"
            stroke="currentColor"
            strokeWidth={1}
            strokeDasharray="4 3"
            opacity={0.6}
          />
          <text
            x={WIDTH - MARGIN.right}
            y={targetY - 5}
            textAnchor="end"
            className="fill-ink-soft text-[10px]"
          >
            Objectif : {DAILY_TARGET_POINTS} pts
          </text>

          {/* Axe des jours (1er, milieu, dernier jour du mois) */}
          {xTickIndices.map((i) => (
            <text
              key={i}
              x={xForIndex(i)}
              y={HEIGHT - 8}
              textAnchor={i === 0 ? "start" : i === monthDays.length - 1 ? "end" : "middle"}
              className="fill-ink-soft text-[10px]"
            >
              {Number(monthDays[i].slice(-2))}
            </text>
          ))}

          {/* Aire sous la courbe */}
          {areaPath && <path d={areaPath} fill="var(--color-blush)" opacity={0.15} />}

          {/* Ligne des points */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="var(--color-blush-deep)"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {/* Petits points sur chaque jour passé */}
          {points.map((p) => (
            <circle key={p.day} cx={p.x} cy={p.y} r={2.5} fill="var(--color-blush-deep)" />
          ))}

          {/* Repère du jour survolé/touché */}
          {hovered && (
            <>
              <line
                x1={hovered.x}
                x2={hovered.x}
                y1={MARGIN.top}
                y2={MARGIN.top + PLOT_HEIGHT}
                stroke="var(--color-ink-soft)"
                strokeWidth={1}
                opacity={0.4}
              />
              <circle
                cx={hovered.x}
                cy={hovered.y}
                r={5}
                fill="var(--color-blush-deep)"
                stroke="var(--color-ivory)"
                strokeWidth={2}
              />
            </>
          )}

          {/* Valeur du jour actuel, toujours affichée (fin de la ligne) */}
          {lastPoint && !hovered && (
            <>
              <circle
                cx={lastPoint.x}
                cy={lastPoint.y}
                r={5}
                fill="var(--color-blush-deep)"
                stroke="var(--color-ivory)"
                strokeWidth={2}
              />
              <text
                x={Math.min(lastPoint.x, WIDTH - MARGIN.right - 24)}
                y={Math.max(lastPoint.y - 10, MARGIN.top + 8)}
                textAnchor="middle"
                className="fill-ink text-[10px] font-medium"
              >
                {lastPoint.points} pts
              </text>
            </>
          )}
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute -top-1 rounded-md border border-sand bg-ivory px-2 py-1 text-xs text-ink shadow-sm"
            style={{
              left: `${(hovered.x / WIDTH) * 100}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <span className="font-medium">{hovered.points} pts</span>
            <span className="text-ink-soft"> — {dayLabel(hovered.day)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

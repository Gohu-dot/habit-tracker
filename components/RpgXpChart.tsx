"use client";

import { useMemo, useRef, useState } from "react";
import RpgSectionHeading from "./RpgSectionHeading";
import { Card } from "./ui/card";

type RpgXpChartProps = {
  dailyXp: Map<string, number>;
  monthDays: string[]; // toutes les dates ISO du mois en cours
  today: string;
};

const WIDTH = 640;
const HEIGHT = 200;
const MARGIN = { top: 16, right: 12, bottom: 28, left: 12 };
const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;

function dayLabel(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

// Pas d'objectif fixe côté RPG (contrairement à PointsChart) : l'échelle
// verticale s'ajuste simplement au meilleur jour du mois, avec un minimum
// pour ne pas écraser le graphique les mois calmes.
export default function RpgXpChart({ dailyXp, monthDays, today }: RpgXpChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const plottedDays = useMemo(() => monthDays.filter((day) => day <= today), [monthDays, today]);

  const maxXp = useMemo(
    () => Math.max(20, ...plottedDays.map((day) => dailyXp.get(day) ?? 0)),
    [plottedDays, dailyXp]
  );

  const xForIndex = (index: number) =>
    MARGIN.left + (monthDays.length > 1 ? (index / (monthDays.length - 1)) * PLOT_WIDTH : 0);
  const yForValue = (value: number) =>
    MARGIN.top + PLOT_HEIGHT - (Math.min(value, maxXp) / maxXp) * PLOT_HEIGHT;

  const points = plottedDays.map((day, i) => ({
    day,
    xp: dailyXp.get(day) ?? 0,
    x: xForIndex(i),
    y: yForValue(dailyXp.get(day) ?? 0),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath =
    points.length > 0
      ? `${linePath} L${points[points.length - 1].x},${MARGIN.top + PLOT_HEIGHT} L${points[0].x},${
          MARGIN.top + PLOT_HEIGHT
        } Z`
      : "";

  const lastPoint = points[points.length - 1];

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
    <Card variant="rpg" className="p-3">
      <RpgSectionHeading>📈 Progression XP du mois</RpgSectionHeading>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full touch-none"
          role="img"
          aria-label={`XP gagné par jour en ${new Date(`${today}T00:00:00`).toLocaleDateString("fr-FR", { month: "long" })}`}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        >
          {xTickIndices.map((i) => (
            <text
              key={i}
              x={xForIndex(i)}
              y={HEIGHT - 8}
              textAnchor={i === 0 ? "start" : i === monthDays.length - 1 ? "end" : "middle"}
              className="fill-rpg-text-soft text-[10px]"
            >
              {Number(monthDays[i].slice(-2))}
            </text>
          ))}

          {areaPath && <path d={areaPath} fill="var(--color-rpg-gold)" opacity={0.15} />}

          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="var(--color-rpg-gold)"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {points.map((p) => (
            <circle key={p.day} cx={p.x} cy={p.y} r={2.5} fill="var(--color-rpg-gold)" />
          ))}

          {hovered && (
            <>
              <line
                x1={hovered.x}
                x2={hovered.x}
                y1={MARGIN.top}
                y2={MARGIN.top + PLOT_HEIGHT}
                stroke="var(--color-rpg-text-soft)"
                strokeWidth={1}
                opacity={0.4}
              />
              <circle
                cx={hovered.x}
                cy={hovered.y}
                r={5}
                fill="var(--color-rpg-gold)"
                stroke="var(--color-rpg-panel)"
                strokeWidth={2}
              />
            </>
          )}

          {lastPoint && !hovered && (
            <>
              <circle
                cx={lastPoint.x}
                cy={lastPoint.y}
                r={5}
                fill="var(--color-rpg-gold)"
                stroke="var(--color-rpg-panel)"
                strokeWidth={2}
              />
              <text
                x={Math.min(lastPoint.x, WIDTH - MARGIN.right - 24)}
                y={Math.max(lastPoint.y - 10, MARGIN.top + 8)}
                textAnchor="middle"
                className="fill-rpg-text text-[10px] font-medium"
              >
                {lastPoint.xp} XP
              </text>
            </>
          )}
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute -top-1 rounded-md border border-rpg-border bg-rpg-panel px-2 py-1 text-xs text-rpg-text shadow-sm"
            style={{
              left: `${(hovered.x / WIDTH) * 100}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <span className="font-medium text-rpg-gold">{hovered.xp} XP</span>
            <span className="text-rpg-text-soft"> — {dayLabel(hovered.day)}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

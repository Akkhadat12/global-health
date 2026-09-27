"use client";

import { useEffect, useRef, useState } from "react";

const SCENES = ["cover", "pen", "wegovy", "foundayo", "forecast", "offstage", "close"] as const;
type SceneId = (typeof SCENES)[number];

const HOLD_MS = 480;

export default function Presenter() {
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const lockRef = useRef(false);
  const reduceRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      reduceRef.current = media.matches;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        advance();
      } else if (event.key === "r" || event.key === "R") {
        event.preventDefault();
        goCover();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function go(next: number) {
    const wrapped = (next + SCENES.length) % SCENES.length;
    if (lockRef.current || wrapped === indexRef.current) return;
    indexRef.current = wrapped;
    setIndex(wrapped);
    lockRef.current = true;
    window.setTimeout(() => {
      lockRef.current = false;
    }, reduceRef.current ? 280 : HOLD_MS);
  }

  function advance() {
    go(indexRef.current + 1);
  }

  function goCover() {
    lockRef.current = false;
    go(0);
  }

  const scene = SCENES[index];

  return (
    <main className="stage">
      <section className="scene" data-id={scene} key={scene} aria-live="polite">
        {scene === "cover" && <Cover onAdvance={advance} />}
        {scene === "pen" && <Pen onAdvance={advance} />}
        {scene === "wegovy" && <Wegovy onAdvance={advance} />}
        {scene === "foundayo" && <Foundayo onAdvance={advance} />}
        {scene === "forecast" && <Forecast onAdvance={advance} />}
        {scene === "offstage" && <Offstage onAdvance={advance} />}
        {scene === "close" && <Close onAdvance={advance} />}
      </section>
    </main>
  );
}

function Cover({ onAdvance }: { onAdvance: () => void }) {
  return (
    <>
      <button className="hit pen-hit" type="button" onClick={onAdvance} aria-label="Weekly pens, next scene">
        <img className="product" src="/assets/wegovy-flex-pens.webp" alt="Wegovy FlexTouch injection pens" />
      </button>
      <button className="hit pill-hit" type="button" onClick={onAdvance} aria-label="Daily tablet, next scene">
        <img className="product" src="/assets/wegovy-pill-25mg.webp" alt="Wegovy 25 milligram oval tablet" />
      </button>
      <h1 className="label serif">After the needle</h1>
    </>
  );
}

function Pen({ onAdvance }: { onAdvance: () => void }) {
  return (
    <>
      <h1 className="label serif">Weekly pen</h1>
      <button className="hit pen-hit" type="button" onClick={onAdvance} aria-label="Wegovy pens, next scene">
        <img className="product" src="/assets/wegovy-flex-pens.webp" alt="Wegovy FlexTouch injection pens" />
      </button>
    </>
  );
}

function Wegovy({ onAdvance }: { onAdvance: () => void }) {
  return (
    <>
      <button className="hit" type="button" onClick={onAdvance} aria-label="Wegovy tablet and bottle, next scene">
        <span className="pair">
          <img className="product" src="/assets/wegovy-pill-bottle.webp" alt="Wegovy pill bottle" />
          <img className="product" src="/assets/wegovy-pill-25mg.webp" alt="Wegovy 25 milligram oval tablet" />
        </span>
      </button>
      <button className="hit clock-block" type="button" onClick={onAdvance} aria-label="Thirty minute wait, next scene">
        <Clock />
        <p className="label serif">Wait 30 minutes</p>
      </button>
      <div className="copy">
        <p className="meta">25 mg</p>
        <p className="meta">22 Dec 2025</p>
      </div>
    </>
  );
}

function Foundayo({ onAdvance }: { onAdvance: () => void }) {
  return (
    <>
      <button className="hit pill-hit" type="button" onClick={onAdvance} aria-label="Foundayo tablet, next scene">
        <img className="product" src="/assets/foundayo-tablet-0.8mg.webp" alt="Foundayo 0.8 milligram round tablet" />
      </button>
      <AttainChart />
      <div className="copy">
        <p className="label serif">Any time</p>
        <p className="meta">orforglipron · 1 Apr 2026</p>
      </div>
    </>
  );
}

function Forecast({ onAdvance }: { onAdvance: () => void }) {
  return (
    <>
      <h1 className="label serif">2030 forecasts</h1>
      <button className="hit" type="button" onClick={onAdvance} aria-label="Forecast chart, next scene">
        <ForecastChart />
      </button>
    </>
  );
}

function Offstage({ onAdvance }: { onAdvance: () => void }) {
  return (
    <>
      <button className="hit" type="button" onClick={onAdvance} aria-label="Empty device slot, next scene">
        <Slot />
      </button>
      <h1 className="label serif">Not approved</h1>
      <p className="year-mark">2027</p>
    </>
  );
}

function Close({ onAdvance }: { onAdvance: () => void }) {
  return (
    <>
      <button className="hit" type="button" onClick={onAdvance} aria-label="Pens and both tablets, return to cover">
        <span className="trio">
          <img className="product" src="/assets/wegovy-flex-pens.webp" alt="Wegovy injection pens" />
          <img className="product" src="/assets/wegovy-pill-25mg.webp" alt="Wegovy oval tablet" />
          <img className="product" src="/assets/foundayo-tablet-0.8mg.webp" alt="Foundayo round tablet" />
        </span>
      </button>
      <h1 className="label serif">Stay on the drug</h1>
      <div className="tests">
        <p className="test">Persistence</p>
        <p className="test">Price</p>
        <p className="test">Phase 3</p>
      </div>
    </>
  );
}

function Clock() {
  return (
    <svg className="clock" viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="78" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      <path d="M100 22 A78 78 0 0 1 100 178" fill="none" stroke="var(--wait)" strokeWidth="8" strokeLinecap="round" />
      <line x1="100" y1="100" x2="100" y2="42" stroke="currentColor" strokeWidth="3" />
      <line x1="100" y1="100" x2="100" y2="154" stroke="var(--wait)" strokeWidth="4" />
      <circle cx="100" cy="100" r="5" fill="currentColor" />
    </svg>
  );
}

function AttainChart() {
  const rows = [
    { label: "6 mg", value: 7.5, text: "−7.5%" },
    { label: "12 mg", value: 8.4, text: "−8.4%" },
    { label: "36 mg", value: 11.2, text: "−11.2%" },
    { label: "placebo", value: 2.1, text: "−2.1%" },
  ];
  const max = 14;
  return (
    <svg className="chart" viewBox="0 0 560 360" role="img" aria-label="ATTAIN-1 mean weight change at 72 weeks">
      <text x="0" y="28" fontSize="28" className="serif">
        ATTAIN-1
      </text>
      <text x="150" y="28" fontSize="16" fill="var(--muted)">
        72 weeks
      </text>
      {rows.map((row, i) => {
        const y = 70 + i * 68;
        const width = (row.value / max) * 360;
        const fill = row.label === "placebo" ? "var(--placebo)" : "var(--y2025)";
        return (
          <g key={row.label}>
            <text x="0" y={y + 18} fontSize="18">
              {row.label}
            </text>
            <rect x="110" y={y} width={width} height="28" fill={fill} />
            <text x={118 + width} y={y + 20} fontSize="18">
              {row.text}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ForecastChart() {
  const x = (billions: number) => 168 + (billions / 150) * 430;
  return (
    <svg className="chart" viewBox="0 0 680 420" role="img" aria-label="Dated 2030 obesity market estimates in billions of dollars">
      <text x="168" y="36" fontSize="16" fill="var(--muted)">
        $ billion
      </text>
      {[0, 50, 100, 150].map((tick) => (
        <g key={tick}>
          <line x1={x(tick)} y1="58" x2={x(tick)} y2="340" stroke="var(--line)" />
          <text x={x(tick)} y="366" fontSize="16" textAnchor="middle" fill="var(--muted)">
            {tick}
          </text>
        </g>
      ))}
      <text x="0" y="128" fontSize="18">
        Prior
      </text>
      <circle cx={x(130)} cy="122" r="9" fill="none" stroke="var(--y2025)" strokeWidth="3" />
      <text x={x(130) + 16} y="128" fontSize="18" fill="var(--y2025)">
        $130B
      </text>
      <text x="0" y="214" fontSize="18">
        May 2025
      </text>
      <circle cx={x(95)} cy="208" r="9" fill="var(--y2025)" />
      <text x={x(95) + 16} y="214" fontSize="18" fill="var(--y2025)">
        $95B
      </text>
      <text x="0" y="300" fontSize="18">
        2026
      </text>
      <line x1={x(102)} y1="294" x2={x(114)} y2="294" stroke="var(--y2026)" strokeWidth="10" strokeLinecap="round" />
      <text x={x(114) + 16} y="300" fontSize="18" fill="var(--y2026)">
        $102–114B
      </text>
    </svg>
  );
}

function Slot() {
  return (
    <svg className="slot" viewBox="0 0 120 280" aria-hidden="true">
      <rect x="16" y="16" width="88" height="248" rx="44" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="7 8" />
    </svg>
  );
}

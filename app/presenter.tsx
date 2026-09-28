"use client";

import { useEffect, useRef, useState } from "react";

const SCENES = ["cover", "pen", "wegovy", "foundayo", "forecast", "offstage", "close"] as const;
type SceneId = (typeof SCENES)[number];

const HOLD_MS = 480;
const IMAGE_SCENES = new Set<SceneId>(["cover", "pen", "wegovy", "foundayo", "close"]);
const PRODUCT_IMAGES = [
  "/assets/wegovy-flex-pens.webp",
  "/assets/wegovy-pill-25mg.webp",
  "/assets/wegovy-pill-bottle.webp",
  "/assets/foundayo-tablet-0.8mg.webp",
];

export default function Presenter() {
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const lockRef = useRef(true);
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
    lockRef.current = true;
    indexRef.current = wrapped;
    setIndex(wrapped);
  }

  function advance() {
    go(indexRef.current + 1);
  }

  function goCover() {
    if (indexRef.current === 0) return;
    lockRef.current = false;
    go(0);
  }

  const scene = SCENES[index];
  const sectionRef = useRef<HTMLElement>(null);
  const [readyScene, setReadyScene] = useState<SceneId | null>(null);
  const imagesReady = !IMAGE_SCENES.has(scene) || readyScene === scene;

  useEffect(() => {
    for (const src of PRODUCT_IMAGES) {
      const img = new Image();
      img.src = src;
    }
  }, []);

  useEffect(() => {
    lockRef.current = true;
    if (!imagesReady) return;
    const ms = reduceRef.current ? 280 : HOLD_MS;
    const timer = window.setTimeout(() => {
      lockRef.current = false;
    }, ms);
    return () => window.clearTimeout(timer);
  }, [index, imagesReady]);

  useEffect(() => {
    if (!IMAGE_SCENES.has(scene)) return;
    const root = sectionRef.current;
    if (!root) return;
    let live = true;
    const imgs = Array.from(root.querySelectorAll("img"));
    let frames = 0;
    const poll = () => {
      if (!live) return;
      frames += 1;
      const painted = imgs.every((img) => img.naturalWidth > 0);
      if (painted || frames > 600) {
        setReadyScene(scene);
        return;
      }
      window.requestAnimationFrame(poll);
    };
    poll();
    return () => {
      live = false;
    };
  }, [scene]);

  return (
    <main className="stage">
      <section
        ref={sectionRef}
        className={imagesReady ? "scene" : "scene scene-pending"}
        data-id={scene}
        key={scene}
        aria-live="polite"
        aria-busy={!imagesReady}
      >
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
      <button className="hit" type="button" onClick={onAdvance} aria-label="MariTide not approved, phase 3 in 2027, next scene">
        <Slot />
      </button>
      <h1 className="label serif">Not approved</h1>
      <p className="meta">MariTide · Phase 3</p>
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
    <svg className="chart" viewBox="0 0 560 390" role="img" aria-label="ATTAIN-1 treatment-regimen estimand, mean weight change at 72 weeks">
      <text x="0" y="28" fontSize="28" className="serif">
        ATTAIN-1
      </text>
      <text x="150" y="28" fontSize="16" fill="var(--muted)">
        72 weeks
      </text>
      <text x="0" y="54" fontSize="15" fill="var(--muted)">
        treatment-regimen estimand
      </text>
      {rows.map((row, i) => {
        const y = 84 + i * 72;
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
  const x = (billions: number) => 176 + (billions / 150) * 360;
  return (
    <svg className="chart" viewBox="0 0 720 348" role="img" aria-label="2030 obesity forecasts in billions of dollars: Goldman prior 130 billion before May 2025, Goldman 95 billion in May 2025, Goldman 105 billion in February 2026, Goldman 114 billion in July 2026">
      <text x="188" y="22" fontSize="16" fill="var(--muted)">
        $ billion · 2030
      </text>
      {[0, 50, 100, 150].map((tick) => (
        <g key={tick}>
          <line x1={x(tick)} y1="36" x2={x(tick)} y2="286" stroke="var(--line)" />
          <text x={x(tick)} y="332" fontSize="16" textAnchor="middle" fill="var(--muted)">
            {tick}
          </text>
        </g>
      ))}
      <text x="0" y="78" fontSize="16">
        Pre–May 2025
      </text>
      <text x="0" y="96" fontSize="14" fill="var(--muted)">
        Goldman prior
      </text>
      <circle cx={x(130)} cy="82" r="9" fill="none" stroke="var(--y2025)" strokeWidth="3" />
      <text x={x(130) + 16} y="88" fontSize="18" fill="var(--y2025)">
        $130B
      </text>
      <text x="0" y="150" fontSize="16">
        May 2025
      </text>
      <text x="0" y="168" fontSize="14" fill="var(--muted)">
        Goldman
      </text>
      <circle cx={x(95)} cy="154" r="9" fill="var(--y2025)" />
      <text x={x(95) + 16} y="160" fontSize="18" fill="var(--y2025)">
        $95B
      </text>
      <text x="0" y="222" fontSize="16">
        Feb 2026
      </text>
      <text x="0" y="240" fontSize="14" fill="var(--muted)">
        Goldman
      </text>
      <circle cx={x(105)} cy="226" r="9" fill="none" stroke="var(--y2026)" strokeWidth="3" />
      <text x={x(105) + 16} y="232" fontSize="18" fill="var(--y2026)">
        $105B
      </text>
      <text x="0" y="268" fontSize="16">
        Jul 2026
      </text>
      <text x="0" y="286" fontSize="14" fill="var(--muted)">
        Goldman
      </text>
      <circle cx={x(114)} cy="272" r="9" fill="var(--y2026)" />
      <text x={x(114) + 16} y="278" fontSize="18" fill="var(--y2026)">
        $114B
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

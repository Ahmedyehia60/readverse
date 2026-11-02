"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

type PlanetCategory = { name: string; books: unknown[] };
type PlanetLink = { id: string; from: string; to: string; title: string; link?: string };

export function LegacyPlanetMap({
  categories,
  links,
  onSelect,
  highlightedLinkId,
}: {
  categories: PlanetCategory[];
  links: PlanetLink[];
  onSelect: (name: string) => void;
  highlightedLinkId?: string | null;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 1280, height: 720 });
  const [isZoomedOut, setIsZoomedOut] = useState(false);
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(([entry]) => setViewportSize({
      width: entry.contentRect.width,
      height: entry.contentRect.height,
    }));
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  const columnsPerPage = viewportSize.width >= 1100 ? 4 : viewportSize.width >= 700 ? 3 : 2;
  const planetsPerPage = columnsPerPage * 2;
  const isMobileLayout = viewportSize.width < 700;
  const pageCount = isZoomedOut ? 1 : Math.max(1, Math.ceil(categories.length / planetsPerPage));
  const nodes = useMemo(() => {
    const seededRandom = (seed: string) => {
      let value = 2166136261;
      for (let index = 0; index < seed.length; index += 1) {
        value = Math.imul(value ^ seed.charCodeAt(index), 16777619);
      }
      return () => {
        value += 0x6d2b79f5;
        let next = value;
        next = Math.imul(next ^ (next >>> 15), next | 1);
        next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
        return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
      };
    };

    const positionsByPage = new Map<number, Array<{ x: number; y: number }>>();
    const minDistance = viewportSize.width < 700 ? 125 : viewportSize.width < 1100 ? 155 : 185;
    const placeRandomly = (categoryName: string, page: number) => {
      const existing = positionsByPage.get(page) ?? [];
      const random = seededRandom(`${page}:${categoryName}`);
      let point = { x: 50, y: 50 };
      for (let attempt = 0; attempt < 180; attempt += 1) {
        const candidate = { x: 10 + random() * 80, y: 19 + random() * 62 };
        const hasRoom = existing.every((position) => {
          const dx = ((candidate.x - position.x) * viewportSize.width) / 100;
          const dy = ((candidate.y - position.y) * viewportSize.height) / 100;
          return Math.hypot(dx, dy) >= minDistance;
        });
        point = candidate;
        if (hasRoom) break;
      }
      positionsByPage.set(page, [...existing, point]);
      return point;
    };

    if (isZoomedOut) {
      const positions: Array<{ x: number; y: number }> = [];
      return categories.map((category, index) => {
        const pointRandom = seededRandom(`${category.name}:${index}`);
        let point = { x: 50, y: 50 };
        for (let attempt = 0; attempt < 200; attempt += 1) {
          const candidate = { x: 8 + pointRandom() * 84, y: 12 + pointRandom() * 76 };
          const hasRoom = positions.every((position) => {
            const dx = ((candidate.x - position.x) * viewportSize.width) / 100;
            const dy = ((candidate.y - position.y) * viewportSize.height) / 100;
            return Math.hypot(dx, dy) >= Math.max(55, 160 - categories.length * 3);
          });
          point = candidate;
          if (hasRoom) break;
        }
        positions.push(point);
        return {
          ...category,
          x: point.x,
          y: point.y,
        };
      });
    }

    return categories.map((category, index) => {
      const page = Math.floor(index / planetsPerPage);
      const point = placeRandomly(category.name, page);
      return {
        ...category,
        x: isMobileLayout
          ? point.x
          : (page * 100 + point.x) / Math.max(1, Math.ceil(categories.length / planetsPerPage)),
        y: isMobileLayout
          ? (page * 100 + point.y) / Math.max(1, Math.ceil(categories.length / planetsPerPage))
          : point.y,
      };
    });
  }, [categories, isMobileLayout, isZoomedOut, planetsPerPage, viewportSize]);

  if (!categories.length) return null;

  return (
    <div ref={viewportRef} className={`relative h-[calc(100dvh-1rem)] min-h-[460px] w-full select-none overflow-y-hidden [scrollbar-color:rgba(168,139,232,.45)_transparent] [scrollbar-width:thin] ${isMobileLayout ? "touch-pan-y overflow-x-hidden overflow-y-auto" : "touch-pan-x overflow-x-auto overflow-y-hidden"}`} dir="ltr">
      <div className="relative transition-all duration-700" style={{
        width: isMobileLayout || isZoomedOut ? "100%" : `${pageCount * 100}%`,
        height: isMobileLayout && !isZoomedOut ? `${pageCount * 100}%` : "100%",
        minHeight: isMobileLayout && !isZoomedOut ? `${pageCount * (viewportSize.height || 720)}px` : "100%",
      }}>
      <svg className="absolute inset-0 z-0 h-full w-full" aria-hidden="true">
        <defs>
          <filter id="planet-link-glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <marker id="planet-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#8884d8" opacity=".6"/></marker>
        </defs>
        {links.map((link) => {
          const from = nodes.find((node) => node.name === link.from);
          const to = nodes.find((node) => node.name === link.to);
          if (!from || !to) return null;
          const highlighted = highlightedLinkId === link.id;
          const bookUrl = link.link?.startsWith("https://openlibrary.org/")
            ? link.link
            : `https://openlibrary.org/search?q=${encodeURIComponent(link.title)}`;
          const canvasWidth = viewportSize.width * (isMobileLayout ? 1 : pageCount);
          const canvasHeight = viewportSize.height * (isMobileLayout ? pageCount : 1);
          const start = { x: (from.x / 100) * canvasWidth, y: (from.y / 100) * canvasHeight };
          const end = { x: (to.x / 100) * canvasWidth, y: (to.y / 100) * canvasHeight };
          const length = Math.hypot(end.x - start.x, end.y - start.y) || 1;
          const radius = isZoomedOut
            ? categories.length > 16 ? (isMobileLayout ? 24 : 32) : categories.length > 8 ? (isMobileLayout ? 32 : 40) : (isMobileLayout ? 40 : 48)
            : isMobileLayout ? 48 : 72;
          const offsetX = ((end.x - start.x) / length) * radius;
          const offsetY = ((end.y - start.y) / length) * radius;
          const x1 = ((start.x + offsetX) / canvasWidth) * 100;
          const y1 = ((start.y + offsetY) / canvasHeight) * 100;
          const x2 = ((end.x - offsetX) / canvasWidth) * 100;
          const y2 = ((end.y - offsetY) / canvasHeight) * 100;
          return <g key={link.id}><line x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke={highlighted ? "#facc15" : "#8884d8"} strokeWidth={highlighted ? "4" : "2"} opacity={highlighted ? "1" : ".55"} filter="url(#planet-link-glow)" markerEnd={highlighted ? undefined : "url(#planet-arrow)"} style={{ pointerEvents: "none" }}/><foreignObject x={`${(from.x + to.x) / 2}%`} y={`${(from.y + to.y) / 2}%`} width="220" height="48" style={{ overflow: "visible", pointerEvents: "auto" }}><a href={bookUrl} target="_blank" rel="noreferrer" aria-label={`Open ${link.title} in Open Library`} className={`pointer-events-auto relative z-20 -translate-x-1/2 -translate-y-1/2 flex h-9 w-[210px] items-center justify-center truncate rounded-xl border px-3 text-center text-[10px] font-bold backdrop-blur-xl transition hover:scale-105 ${highlighted ? "border-yellow-400 bg-black text-yellow-200 shadow-[0_0_28px_rgba(250,204,21,.75)]" : "border-white/20 bg-[#080711] text-gray-100 shadow-[0_4px_18px_rgba(0,0,0,.85)] hover:border-purple-300"}`}>{link.title}</a></foreignObject></g>;
        })}
      </svg>
      {nodes.map((category, index) => (
        <button
          key={category.name}
          onClick={() => onSelect(category.name)}
          className={`group absolute flex cursor-pointer flex-col items-center transition-all duration-500 hover:z-30 hover:scale-110 ${highlightedLinkId && (category.name === links.find((link) => link.id === highlightedLinkId)?.from || category.name === links.find((link) => link.id === highlightedLinkId)?.to) ? "z-20 drop-shadow-[0_0_24px_rgba(250,204,21,.8)]" : "z-10"}`}
          style={{ left: `${category.x}%`, top: `${category.y}%`, transform: highlightedLinkId && (category.name === links.find((link) => link.id === highlightedLinkId)?.from || category.name === links.find((link) => link.id === highlightedLinkId)?.to) ? "translate(-50%, -58%) scale(1.12)" : "translate(-50%, -50%)" }}
        >
          <span className={`mb-2 max-w-[42vw] truncate whitespace-nowrap rounded-full border bg-black/60 px-3 py-1 font-medium text-white backdrop-blur-md transition group-hover:border-purple-400/40 group-hover:shadow-[0_0_24px_rgba(136,132,216,.35)] ${isZoomedOut ? "text-[9px] md:text-[10px]" : "text-[10px] md:text-xs"} ${highlightedLinkId && (category.name === links.find((link) => link.id === highlightedLinkId)?.from || category.name === links.find((link) => link.id === highlightedLinkId)?.to) ? "border-yellow-300 text-yellow-200 shadow-[0_0_18px_rgba(250,204,21,.55)]" : "border-white/10"}`}>{category.name}</span>
          <span className={`relative grid place-items-center ${isZoomedOut ? categories.length > 16 ? "size-12 md:size-16" : categories.length > 8 ? "size-16 md:size-20" : "size-20 md:size-24" : "size-24 md:size-36"}`}>
            <span className="absolute inset-0 rounded-full border border-purple-300/20 transition duration-700 group-hover:scale-125 group-hover:border-purple-300/50 group-hover:rotate-12"/>
            <span className="absolute inset-2 rounded-full bg-purple-500/15 blur-xl transition group-hover:bg-purple-400/30"/>
            <img src={`/images/${index % 25}.png`} alt="" className={`relative z-10 rounded-full object-cover drop-shadow-[0_0_22px_rgba(136,132,216,.4)] transition duration-700 group-hover:scale-110 ${isZoomedOut ? categories.length > 16 ? "size-10 md:size-14" : categories.length > 8 ? "size-14 md:size-16" : "size-16 md:size-20" : "size-20 md:size-32"}`} />
          </span>
        </button>
      ))}
      </div>
      <button onClick={() => setIsZoomedOut((zoomedOut) => !zoomedOut)} aria-label="Toggle global map view" className="absolute bottom-4 right-4 z-20 cursor-pointer rounded-2xl border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur-md transition hover:bg-white/20 md:bottom-10 md:right-10 md:p-4">
        {isZoomedOut ? <Maximize2 className="size-6 text-yellow-400"/> : <Minimize2 className="size-6 text-white"/>}
      </button>
      <div className="pointer-events-none absolute left-1/2 top-6 z-10 -translate-x-1/2 rounded-full bg-yellow-400 px-6 py-2 text-xs font-bold text-black shadow-lg">{isZoomedOut ? "All Planets View" : "Global View Mode"}</div>
    </div>
  );
}

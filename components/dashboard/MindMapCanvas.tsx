/* eslint-disable @next/next/no-img-element */
"use client";
import { ICategory, IBridge } from "@/models/users";

interface Props {
  mindMap: ICategory[];
  bridges: IBridge[];
  onCategoryClick: (cat: ICategory) => void;
  searchQuery?: string;
  highlightBook?: string | null;
  setHighlightBook: (val: string | null) => void;
}

export const MindMapCanvas = ({
  mindMap,
  bridges,
  onCategoryClick,
  searchQuery = "",
  highlightBook = null,
  setHighlightBook,
}: Props) => {
  if (!mindMap.length) return null;

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-transparent select-none"
      onClick={() => highlightBook && setHighlightBook(null)}
    >
      <div className="relative w-full h-full">
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#8884d8"
                className="opacity-50"
              />
            </marker>
          </defs>
          {bridges.map((bridge, index) => {
            const cat1 = mindMap.find((c) => c.name === bridge.fromCategory);
            const cat2 = mindMap.find((c) => c.name === bridge.toCategory);
            if (!cat1 || !cat2) return null;

            const isTargetBook =
              highlightBook &&
              bridge.recommendedBook.toLowerCase() ===
                highlightBook.toLowerCase();

            return (
              <line
                key={`line-${index}`}
                x1={`${cat1.x * 100}%`}
                y1={`${cat1.y * 100}%`}
                x2={`${cat2.x * 100}%`}
                y2={`${cat2.y * 100}%`}
                stroke={isTargetBook ? "#facc15" : "#8884d8"}
                strokeWidth={isTargetBook ? "3" : "4"}
                className={`transition-all duration-700 ${
                  isTargetBook ? "opacity-100" : "opacity-20"
                }`}
                strokeDasharray={isTargetBook ? "none" : "0"}
                filter={isTargetBook ? "url(#glow)" : "none"}
                markerEnd={isTargetBook ? "" : "url(#arrowhead)"}
              />
            );
          })}
        </svg>

        {bridges.map((bridge, index) => {
          const cat1 = mindMap.find((c) => c.name === bridge.fromCategory);
          const cat2 = mindMap.find((c) => c.name === bridge.toCategory);
          if (!cat1 || !cat2) return null;

          const midX = ((cat1.x + cat2.x) / 2) * 100;
          const midY = ((cat1.y + cat2.y) / 2) * 100;
          const isTargetBook =
            highlightBook &&
            bridge.recommendedBook.toLowerCase() ===
              highlightBook.toLowerCase();

          return (
            <div
              key={`bridge-text-${index}`}
              style={{
                position: "absolute",
                left: `${midX}%`,
                top: `${midY}%`,
                transform: "translate(-50%, -50%)",
              }}
              className={`z-20 transition-all duration-500 ${
                isTargetBook ? "scale-125 z-40" : "hover:scale-110"
              }`}
            >
              <a
                href={bridge.bookLink || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 bg-black/40 backdrop-blur-xl p-1.5 rounded-xl border transition-all ${
                  isTargetBook
                    ? "border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.4)] bg-black/80"
                    : "border-white/10"
                }`}
              >
                {bridge.bookImage && (
                  <img
                    src={bridge.bookImage}
                    alt=""
                    className={`w-7 h-9 object-cover rounded-md shadow-lg ${
                      isTargetBook ? "ring-2 ring-yellow-400" : ""
                    }`}
                  />
                )}
                <span
                  className={`text-[10px] font-bold leading-tight line-clamp-2 max-w-[90px] ${
                    isTargetBook ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  {bridge.recommendedBook}
                </span>
              </a>
            </div>
          );
        })}

        {mindMap.map((cat) => {
          const isHighlighted =
            searchQuery.length > 0 &&
            cat.name.toLowerCase().includes(searchQuery.toLowerCase());

          return (
            <div
              key={cat.name}
              style={{
                position: "absolute",
                top: `${cat.y * 100}%`,
                left: `${cat.x * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
              className={`flex flex-col items-center cursor-pointer transition-all duration-500 z-10 ${
                isHighlighted ? "scale-110 z-50" : "hover:z-30 hover:scale-105"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onCategoryClick(cat);
              }}
            >
              <div
                className={`mb-3 px-4 py-1 rounded-full backdrop-blur-md border transition-all duration-300 ${
                  isHighlighted
                    ? "bg-yellow-400 border-yellow-500 text-black font-black shadow-xl"
                    : "bg-black/40 border-white/10 text-white font-medium"
                }`}
              >
                <p className="text-[12px] whitespace-nowrap">{cat.name}</p>
              </div>

              <div
                className={`relative group w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-[2.5rem] overflow-hidden border-2 transition-all duration-700 ${
                  isHighlighted
                    ? "border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.3)] ring-8 ring-yellow-400/10"
                    : "border-white/10"
                }`}
              >
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                <img
                  src={cat.image || "/placeholder.png"}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

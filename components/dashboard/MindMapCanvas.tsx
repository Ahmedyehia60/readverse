/* eslint-disable @next/next/no-img-element */
import { ICategory, IBridge } from "@/models/users";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface Props {
  mindMap: ICategory[];
  bridges: IBridge[];
  onCategoryClick: (cat: ICategory) => void;
  searchQuery?: string;
}

export const MindMapCanvas = ({
  mindMap,
  bridges,
  onCategoryClick,
  searchQuery = "",
}: Props) => {
  if (!mindMap.length) return null;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-transparent">
      <TransformWrapper
        initialScale={1}
        minScale={0.2}
        maxScale={3}
        centerOnInit={false}
        limitToBounds={false}
        wheel={{ step: 0.1 }}
        doubleClick={{ disabled: true }}
        panning={{
          velocityDisabled: false,
        }}
      >
        <TransformComponent
          wrapperStyle={{ width: "100%", height: "100vh" }}
          contentStyle={{
            width: "100%",
            height: "100vh",
            cursor: "move",
          }}
        >
          <div className="relative w-screen h-screen">
            {/* 1. SVG Arrows/Lines (Bridges) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#8884d8" />
                </marker>
              </defs>
              {bridges.map((bridge, index) => {
                const cat1 = mindMap.find(
                  (c) => c.name === bridge.fromCategory
                );
                const cat2 = mindMap.find((c) => c.name === bridge.toCategory);
                if (!cat1 || !cat2) return null;

                return (
                  <line
                    key={`line-${index}`}
                    x1={`${cat1.x * 100}%`}
                    y1={`${cat1.y * 100}%`}
                    x2={`${cat2.x * 100}%`}
                    y2={`${cat2.y * 100}%`}
                    stroke="#8884d8"
                    strokeWidth="0.8"
                    className="opacity-40 animate-pulse"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}
            </svg>

            {/* 2. Recommended Books on Bridges */}
            {bridges.map((bridge, index) => {
              const cat1 = mindMap.find((c) => c.name === bridge.fromCategory);
              const cat2 = mindMap.find((c) => c.name === bridge.toCategory);
              if (!cat1 || !cat2) return null;

              const midX = ((cat1.x + cat2.x) / 2) * 100;
              const midY = ((cat1.y + cat2.y) / 2) * 100;

              return (
                <div
                  key={`bridge-text-${index}`}
                  style={{
                    position: "absolute",
                    left: `${midX}%`,
                    top: `${midY}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  className="z-20 pointer-events-auto"
                >
                  <a
                    href={bridge.bookLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-white/20 hover:scale-110 transition-transform no-underline"
                  >
                    {bridge.bookImage && (
                      <img
                        src={bridge.bookImage}
                        alt=""
                        className="w-8 h-10 object-cover rounded shadow-md"
                      />
                    )}
                    <span className="text-[9px] text-white font-medium leading-tight line-clamp-2 max-w-20">
                      {bridge.recommendedBook}
                    </span>
                  </a>
                </div>
              );
            })}

            {/* 3. Categories (Nodes) with Search Highlight */}
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
                  className={`flex flex-col items-center cursor-pointer transition-all duration-500 z-10 
                    ${
                      isHighlighted
                        ? "scale-125 z-50"
                        : "hover:z-30 hover:scale-105"
                    }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCategoryClick(cat);
                  }}
                >
                  <p
                    className={`text-[11px] text-center max-w-[120px] truncate mb-2 px-2 rounded-full backdrop-blur-sm transition-colors duration-300
                    ${
                      isHighlighted
                        ? "bg-yellow-400 text-black font-bold shadow-[0_0_2px_#facc15]"
                        : "bg-black/20 text-white"
                    }`}
                  >
                    {cat.name}
                  </p>

                  <div
                    className={`w-[110px] h-[110px] rounded-2xl overflow-hidden border-2 transition-all duration-500
                    ${
                      isHighlighted
                        ? "border-none shadow-[0_0_30px_rgba(250,204,21,0.8)] ring-4 ring-yellow-400/20"
                        : "border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    }`}
                  >
                    <img
                      src={cat.image || "/placeholder.png"}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

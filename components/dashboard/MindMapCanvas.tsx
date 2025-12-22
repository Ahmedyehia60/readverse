/* eslint-disable @next/next/no-img-element */
import { ICategory, IBridge } from "@/models/users";

interface Props {
  mindMap: ICategory[];
  bridges: IBridge[];
  onCategoryClick: (cat: ICategory) => void;
}

export const MindMapCanvas = ({ mindMap, bridges, onCategoryClick }: Props) => {
  if (!mindMap.length) return null;

  return (
    <div className="relative w-full h-screen overflow-hidden">
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
          const cat1 = mindMap.find((c) => c.name === bridge.fromCategory);
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
              strokeWidth="0.7"
              className="opacity-60 animate-pulse"
              markerEnd="url(#arrowhead)"
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

        return (
          <div
            key={`bridge-text-${index}`}
            style={{
              position: "absolute",
              left: `${midX}%`,
              top: `${midY}%`,
              transform: "translate(-50%, -50%)",
            }}
            className="z-20"
          >
            <a
              href={bridge.bookLink || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-black/40 backdrop-blur-sm p-1 rounded-lg border border-white/10 hover:bg-black/60 transition-all no-underline"
            >
              {bridge.bookImage && (
                <img
                  src={bridge.bookImage}
                  alt=""
                  className="w-8 h-10 object-cover rounded shadow-sm"
                />
              )}
              <span className="text-[10px] text-white font-medium leading-tight line-clamp-2 max-w-[100px]">
                {bridge.recommendedBook}
              </span>
            </a>
          </div>
        );
      })}

      {mindMap.map((cat) => (
        <div
          key={cat.name}
          style={{
            position: "absolute",
            top: `${cat.y * 100}%`,
            left: `${cat.x * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
          className="flex flex-col items-center cursor-pointer hover:scale-105 transition z-10"
          onClick={() => onCategoryClick(cat)}
        >
          <p className="text-xs text-white text-center max-w-[110px] truncate">
            {cat.name}
          </p>
          <div className="w-[100px] h-[100px] rounded-xl overflow-hidden shadow-lg border-2 border-white/10">
            <img
              src={cat.image || "/placeholder.png"}
              alt={cat.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

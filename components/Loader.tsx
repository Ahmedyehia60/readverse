// components/Loader.tsx
"use client";

import BookIcon from "./BookIcon";

type LoaderProps = {
  text?: string;
  fullScreen?: boolean;

  bookScale?: number;
  bookTop?: number;
  bookLeft?: number;
};

export default function Loader({
  fullScreen = true,

  bookScale = 2,
  bookTop = 0,
  bookLeft = 0,
}: LoaderProps) {
  return (
    <div
      className={[
        "relative w-full overflow-hidden",
        fullScreen ? "min-h-screen" : "h-full min-h-[300px]",
        "flex flex-col bg-background-light dark:bg-background-dark",
      ].join(" ")}
      style={{
        backgroundImage: "linear-gradient(135deg, #0B0C23, #16001E, #1A1A2E)",
      }}
    >
      <div className="flex flex-1 items-center justify-center px-4 py-5">
        <div className="flex flex-col items-center justify-center gap-4 w-full max-w-sm">
          <div className="relative flex items-center justify-center mb-1 w-full">
            <div className="absolute w-72 h-72 bg-[#F9B208]/30 rounded-full blur-3xl" />

            <div
              className="relative flex items-center justify-center drop-shadow-[0_0_25px_rgba(249,178,8,0.9)]"
              style={{
                transform: `translate(${bookLeft}px, ${bookTop}px) scale(${bookScale})`,
              }}
            >
              <BookIcon />
            </div>
          </div>

          {/* Progress */}
          <div className="flex flex-col gap-3 p-4 w-full">
            <div className="relative h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="progress-indeterminate" />
            </div>
            <p className="text-center text-white/70 text-sm">
              A moment please… preparing your magical read..
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

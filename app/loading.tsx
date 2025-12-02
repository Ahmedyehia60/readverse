"use client";
import Loader from "../components/Loader";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <Loader
        bookScale={1.6}
        bookTop={-100}
        bookLeft={-40}
        text="Loading worlds..."
      />
    </div>
  );
}

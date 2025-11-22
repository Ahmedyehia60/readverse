"use client";
import Loader from "../components/Loader";

export default function Loading() {
  return (
    <Loader
      bookScale={1.6}
      bookTop={-100}
      bookLeft={-40}
      text="Loading worlds..."
    />
  );
}

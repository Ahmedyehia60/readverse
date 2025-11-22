// components/BookIcon.tsx
import React from "react";
import "./book-loader.css";

export default function BookIcon() {
  return (
    <div className="book-container">
      <div className="book">
        <div className="page"></div>
        <div className="page backPage"></div>
        <div className="page pageFlip"></div>
        <div className="page pageFlip"></div>
        <div className="page pageFlip"></div>
      </div>
    </div>
  );
}

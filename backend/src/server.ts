import express from "express";
import { resolve } from "node:path";
import app from "./app";

const frontendDir = resolve(process.cwd(), "dist");
app.use(express.static(frontendDir, {
  index: false,
  maxAge: process.env.NODE_ENV === "production" ? "1d" : 0,
  setHeaders(response, path) {
    if (path.includes(`${process.platform === "win32" ? "\\" : "/"}assets${process.platform === "win32" ? "\\" : "/"}`)) {
      response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
  },
}));

app.use((request, response, next) => {
  if (request.path.startsWith("/api/")) {
    response.status(404).json({ error: "API endpoint not found." });
    return;
  }
  response.sendFile(resolve(frontendDir, "index.html"), (error) => {
    if (error) next(error);
  });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, "0.0.0.0", () => {
  console.log(`Readverse server listening on port ${port}`);
});

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

spawnSync(process.execPath, ["scripts/build.mjs"], { stdio: "inherit" });
const root = path.resolve("dist");
const mime = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".svg":"image/svg+xml", ".png":"image/png", ".jpg":"image/jpeg", ".webp":"image/webp", ".avif":"image/avif", ".mp4":"video/mp4", ".webm":"video/webm", ".woff2":"font/woff2", ".xml":"application/xml; charset=utf-8", ".txt":"text/plain; charset=utf-8" };

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    let file = path.join(root, pathname);
    if (!file.startsWith(root)) throw new Error("Invalid path");
    const info = await stat(file).catch(() => null);
    if (info?.isDirectory()) file = path.join(file, "index.html");
    if (!info && !path.extname(file)) file = path.join(file, "index.html");
    const data = await readFile(file);
    response.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream" });
    response.end(data);
  } catch {
    const data = await readFile(path.join(root, "404.html"));
    response.writeHead(404, { "Content-Type": mime[".html"] });
    response.end(data);
  }
}).listen(4173, "127.0.0.1", () => console.log("LavaMed preview: http://127.0.0.1:4173"));

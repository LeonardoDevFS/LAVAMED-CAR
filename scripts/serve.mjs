import { createServer } from "node:http";
import { createReadStream } from "node:fs";
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
    const extension = path.extname(file);
    const contentType = mime[extension] || "application/octet-stream";
    const finalInfo = await stat(file);
    const range = request.headers.range;
    if (range && [".mp4", ".webm"].includes(extension)) {
      const match = range.match(/bytes=(\d+)-(\d*)/);
      if (!match) throw new Error("Invalid range");
      const start = Number(match[1]);
      const end = match[2] ? Math.min(Number(match[2]), finalInfo.size - 1) : finalInfo.size - 1;
      if (start > end || start >= finalInfo.size) {
        response.writeHead(416, { "Content-Range": `bytes */${finalInfo.size}` });
        response.end();
        return;
      }
      response.writeHead(206, {
        "Accept-Ranges": "bytes",
        "Content-Range": `bytes ${start}-${end}/${finalInfo.size}`,
        "Content-Length": end - start + 1,
        "Content-Type": contentType
      });
      createReadStream(file, { start, end }).pipe(response);
      return;
    }
    const data = await readFile(file);
    response.writeHead(200, { "Accept-Ranges": [".mp4", ".webm"].includes(extension) ? "bytes" : "none", "Content-Length": data.length, "Content-Type": contentType });
    response.end(data);
  } catch {
    const data = await readFile(path.join(root, "404.html"));
    response.writeHead(404, { "Content-Type": mime[".html"] });
    response.end(data);
  }
}).listen(4173, "127.0.0.1", () => console.log("LavaMed preview: http://127.0.0.1:4173"));

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import handler from "./dist/server/server.js";

const port = process.env.PORT || 3000;

const clientDir = path.resolve("./dist/client");

const server = createServer(async (req, res) => {
  try {
    const filePath = path.join(clientDir, req.url);

    // Serve static assets
    if (req.url.startsWith("/assets/") && existsSync(filePath)) {
      const file = await readFile(filePath);

      if (req.url.endsWith(".js")) {
        res.writeHead(200, { "Content-Type": "application/javascript" });
      } else if (req.url.endsWith(".css")) {
        res.writeHead(200, { "Content-Type": "text/css" });
      } else {
        res.writeHead(200);
      }

      res.end(file);
      return;
    }

    // TanStack SSR
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    const request = new Request(url, {
      method: req.method,
      headers: req.headers,
    });

    const response = await handler.fetch(request);

    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    res.end(await response.text());
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end("Server Error");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Running on ${port}`);
});

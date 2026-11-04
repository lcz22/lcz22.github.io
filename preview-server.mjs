import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT) || 4173;
const host = '127.0.0.1';

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon'
};

const server = http.createServer((request, response) => {
  try {
    const requestUrl = new URL(request.url || '/', `http://${request.headers.host || host}`);
    const decoded = decodeURIComponent(requestUrl.pathname);
    const requested = decoded === '/' ? '/index.html' : decoded;
    const filePath = path.resolve(root, `.${requested}`);

    if (!filePath.startsWith(`${root}${path.sep}`) && filePath !== root) {
      response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Forbidden');
      return;
    }

    fs.stat(filePath, (statError, stats) => {
      if (statError || !stats.isFile()) {
        response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Not found');
        return;
      }

      response.writeHead(200, {
        'Content-Type': mime[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
        'Content-Length': stats.size,
        'Cache-Control': 'no-store'
      });

      if (request.method === 'HEAD') {
        response.end();
        return;
      }

      fs.createReadStream(filePath).pipe(response);
    });
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Server error');
  }
});

server.listen(port, host, () => {
  console.log(`人生支线 local preview: http://${host}:${port}/`);
});

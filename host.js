// run this file using 'node host.js'

const http = require("http");
const fs = require("fs");
const contentTypes = {
    ".html": "text/html",
    ".js":   "text/javascript",
    ".css":  "text/css",
    ".png":  "image/png",
}

http.createServer((request, response) => {
    try {
        const url = request.url.endsWith("/") ? request.url + "index.html" : request.url;
        const data = fs.readFileSync("." + url);
        response.writeHead(200, { "Content-Type": contentTypes[url.slice(url.lastIndexOf("."))] || "text/plain" });
        response.end(data);
    } catch (e) {
        response.writeHead(404, { "Content-Type": "text/plain" });
        response.end(e.toString());
    }
}).listen(8080, () => {
  console.log("page hosted at http://localhost:8080");
});

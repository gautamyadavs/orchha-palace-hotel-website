import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const dist = new URL("../dist/", import.meta.url);

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesBelow(path));
    else files.push(path);
  }
  return files;
}

const homepage = await readFile(new URL("index.html", dist), "utf8");
const enquiryPage = await readFile(new URL("weddings-events/index.html", dist), "utf8");
const robots = await readFile(new URL("robots.txt", dist), "utf8");
const sitemap = await readFile(new URL("sitemap-index.xml", dist), "utf8");
await readFile(new URL("404.html", dist), "utf8");

assert.match(homepage, /<link rel="canonical" href="https:\/\/orchhapalace\.com\/?"/);
assert.doesNotMatch(homepage, /noindex,nofollow/);
assert.match(enquiryPage, /data-lead-endpoint="\/api\/event-leads"/);
assert.match(enquiryPage, /data-action="event-enquiry"/);
assert.match(robots, /Allow: \//);
assert.match(robots, /https:\/\/orchhapalace\.com\/sitemap-index\.xml/);
assert.match(sitemap, /https:\/\/orchhapalace\.com\//);

const inspectable = (await filesBelow(fileURLToPath(dist))).filter((path) => /\.(?:html|css|js|xml|txt)$/.test(path));
for (const path of inspectable) {
  const contents = await readFile(path, "utf8");
  assert.doesNotMatch(contents, /\/orchha-palace-hotel-website\//, `GitHub Pages base path leaked into ${path}`);
  assert.doesNotMatch(contents, /(?:RESEND_API_KEY|TURNSTILE_SECRET_KEY|re_[A-Za-z0-9_]{16,})/, `A server secret leaked into ${path}`);
}

console.log(`Verified ${inspectable.length} production files for root-domain paths, indexing, and secret leakage.`);

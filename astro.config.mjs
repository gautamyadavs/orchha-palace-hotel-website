import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import { fileURLToPath } from "node:url";

const githubRepository = process.env.GITHUB_REPOSITORY?.split("/")[1];
const githubOwner = process.env.GITHUB_REPOSITORY?.split("/")[0];
const deploymentTarget = process.env.DEPLOY_TARGET || "local";
const isGitHubPages = deploymentTarget === "github-pages";
const production = process.env.PUBLIC_SITE_STATUS === "production";

if (isGitHubPages && (!githubRepository || !githubOwner)) {
  throw new Error("DEPLOY_TARGET=github-pages requires GITHUB_REPOSITORY.");
}

if (production && !process.env.PUBLIC_TURNSTILE_SITE_KEY) {
  throw new Error("PUBLIC_TURNSTILE_SITE_KEY is required for a production build.");
}

if (production && !process.env.PUBLIC_BOOKING_URL) {
  throw new Error("PUBLIC_BOOKING_URL is required for a production build.");
}

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || (isGitHubPages ? `https://${githubOwner}.github.io` : "https://orchhapalace.com"),
  base: isGitHubPages ? `/${githubRepository}` : "/",
  output: "static",
  integrations: [sitemap(), icon({ iconDir: fileURLToPath(new URL("./src/icons", import.meta.url)) })],
  build: {
    assets: "_assets",
    inlineStylesheets: "always"
  },
  vite: {
    server: {
      host: "0.0.0.0",
      allowedHosts: ["terminal.local", "localhost"]
    }
  }
});

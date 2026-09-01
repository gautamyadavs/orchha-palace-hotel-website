import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import { fileURLToPath } from "node:url";

const githubRepository = process.env.GITHUB_REPOSITORY?.split("/")[1];
const githubOwner = process.env.GITHUB_REPOSITORY?.split("/")[0];
const isGitHubPages = process.env.GITHUB_ACTIONS === "true" && Boolean(githubRepository && githubOwner);

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

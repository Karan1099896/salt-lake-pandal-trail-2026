import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const base = process.env.GITHUB_PAGES === "true" && repoName ? `/${repoName}/` : "/";

export default defineConfig({
  vite: { base },
  // The normal Lovable config builds a server. GitHub Pages needs a client-only SPA.
  nitro: false,
  tanstackStart: {
    spa: { enabled: true },
  },
});

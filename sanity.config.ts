import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemaTypes";

export default defineConfig({
  name: "orchha_palace",
  title: "Orchha Palace Website",
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || "replace-with-project-id",
  dataset: process.env.SANITY_STUDIO_DATASET || "production",
  plugins: [structureTool()],
  schema: { types: schemaTypes }
});

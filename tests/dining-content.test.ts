import assert from "node:assert/strict";
import test from "node:test";
import { currentDining, currentDiningMedia } from "../src/lib/dining-content.ts";
import type { DiningVenue, ImageAsset } from "../src/lib/types.ts";

const cafeImage = { id: "patio-cafe", src: "/images/patio-cafe.jpg", alt: "Patio Cafe terrace", subject: "Patio Cafe" } as ImageAsset;
const approved = [
  { slug: "annajal", name: "Annajal" },
  { slug: "dragon", name: "Dragon" },
  { slug: "patio-cafe", name: "Patio Cafe", image: cafeImage }
] as DiningVenue[];

test("an older CMS catalogue cannot restore Madira or overwrite the owner-selected cafe image", () => {
  const cms = [
    { slug: "annajal", name: "Annajal", description: "Current seasonal dining" },
    { slug: "madira-bar", name: "Madira Bar" },
    { slug: "patio-cafe", name: "Patio Cafe", image: { src: "/outdated.jpg" } }
  ] as DiningVenue[];
  const result = currentDining(cms, approved);
  assert.deepEqual(result.map(venue => venue.slug), ["annajal", "dragon", "patio-cafe"]);
  assert.equal(result[0].description, "Current seasonal dining");
  assert.equal(result[2].image.src, cafeImage.src);
});

test("incomplete CMS dining preserves every current outlet", () => {
  assert.deepEqual(currentDining([], approved), approved);
});

test("gallery removes closed-outlet images with CMS IDs and retains the current cafe photo", () => {
  const garden = { id: "garden", subject: "Garden", src: "/garden.jpg" } as ImageAsset;
  const media = [garden, { id: "cms-123", alt: "Madira bar interior" }, { id: "old-bar", src: "/madira-selected.webp" }, { id: "patio-cafe", src: "/wrong.jpg" }] as ImageAsset[];
  assert.deepEqual(currentDiningMedia(media, cafeImage), [garden, cafeImage]);
});

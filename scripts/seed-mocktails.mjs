#!/usr/bin/env node
/**
 * One-shot seed for the MocktailRecipes entity.
 *
 * Reads the canonical seed list from src/components/current/mocktailSeeds.js
 * and creates approved rows in Base44. Safe to re-run — it skips any
 * recipe whose `name` already exists as an approved row.
 *
 * Usage:
 *   cd /Users/md/current
 *   # Make sure .env.local has VITE_BASE44_APP_ID + VITE_BASE44_APP_BASE_URL
 *   node scripts/seed-mocktails.mjs
 *
 * Note: this uses the unauthenticated Base44 SDK call; if your app
 * requires auth for entity creation, run it from within the builder
 * instead (paste each row by hand), or extend this script with
 * base44.auth.login(...) using a service account.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// Load env so the SDK knows which app to talk to
const envPath = path.join(root, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const appId = process.env.VITE_BASE44_APP_ID;
const baseUrl = process.env.VITE_BASE44_APP_BASE_URL;
if (!appId || !baseUrl) {
  console.error("Missing VITE_BASE44_APP_ID or VITE_BASE44_APP_BASE_URL in .env.local");
  process.exit(1);
}

// Dynamic import so this script doesn't choke if the SDK isn't installed
const { createClient } = await import("@base44/sdk").catch(() => {
  console.error("Could not import @base44/sdk — run `npm install` first.");
  process.exit(1);
});

// Import seed data (TypeScript-style path resolution won't work in raw
// node; we read the JS file as text and eval the export, which avoids a
// build step).
const seedPath = path.join(root, "src/components/current/mocktailSeeds.js");
const seedSrc = fs.readFileSync(seedPath, "utf8");
// Strip the export keyword, eval, then grab the constant. Crude but safe
// for this single-purpose script.
const evalSrc = seedSrc.replace("export const", "var") + "\nMOCKTAIL_SEEDS;";
const MOCKTAIL_SEEDS = eval(evalSrc);

const base44 = createClient({ appId, requiresAuth: false });

console.log(`Connecting to ${baseUrl} (app ${appId})…`);

let existing = [];
try {
  existing = await base44.entities.MocktailRecipes.filter({ status: "approved" }, "", 200);
} catch (err) {
  console.error("Could not read existing MocktailRecipes:", err.message || err);
  process.exit(1);
}
const existingNames = new Set(existing.map(r => r.name));

let created = 0, skipped = 0;
for (const recipe of MOCKTAIL_SEEDS) {
  if (existingNames.has(recipe.name)) {
    skipped += 1;
    console.log(`  SKIP  ${recipe.name} (already exists)`);
    continue;
  }
  // Drop the client-side `id` field — Base44 assigns its own
  const { id, ...row } = recipe;
  try {
    await base44.entities.MocktailRecipes.create(row);
    created += 1;
    console.log(`  +     ${recipe.name}`);
  } catch (err) {
    console.error(`  FAIL  ${recipe.name}:`, err.message || err);
  }
}

console.log(`\nDone. ${created} created, ${skipped} skipped, ${MOCKTAIL_SEEDS.length} total in seed list.`);

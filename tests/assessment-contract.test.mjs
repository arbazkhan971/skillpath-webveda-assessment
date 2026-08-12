import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("Framer component keeps the assignment's API and resilience contract", async () => {
  const source = await readFile(new URL("framer/SkillpathCourses.tsx", root), "utf8");

  assert.match(source, /\/assignment\/course-data/);
  assert.match(source, /\/assignment\/country-code/);
  assert.equal(source.match(/method: "GET"/g)?.length, 1, "both requests use the shared GET helper");
  assert.doesNotMatch(source, /method: "POST"/);
  assert.match(source, /REQUEST_TIMEOUT_MS = 8000/);
  assert.match(source, /new AbortController\(\)/);
  assert.match(source, /ResizeObserver/);
  assert.match(source, /minimumFractionDigits: 2/);
  assert.match(source, /setCourseAttempt/);
  assert.match(source, /setCountryAttempt/);
});

test("Framer exposes exactly the two requested property controls", async () => {
  const source = await readFile(new URL("framer/SkillpathCourses.tsx", root), "utf8");
  const controls = source.match(/addPropertyControls\([\s\S]*?\n}\)/)?.[0] ?? "";

  assert.match(controls, /accent: \{ type: ControlType\.Color/);
  assert.match(controls, /heading: \{ type: ControlType\.String/);
  assert.equal((controls.match(/ControlType\./g) ?? []).length, 2);
});

test("a fresh clone contains every file required by the build", async () => {
  await Promise.all([
    access(new URL(".openai/hosting.json", root)),
    access(new URL("build/sites-vite-plugin.ts", root)),
    access(new URL("worker/index.ts", root)),
  ]);
});

test("the repository points reviewers to the published Framer page", async () => {
  const readme = await readFile(new URL("README.md", root), "utf8");
  assert.match(readme, /https:\/\/multiple-clarity-766479\.framer\.app\//);
});

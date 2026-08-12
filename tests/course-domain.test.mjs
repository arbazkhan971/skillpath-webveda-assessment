import assert from "node:assert/strict";
import test from "node:test";
import {
  filterAndSortCourses,
  formatCoursePrice,
  parseCountryPayload,
  parseCoursePayload,
  pricingRegionLabel,
} from "../app/course-domain.ts";

const course = Object.freeze({
  courseName: "Podcast Launchpad",
  courseCode: "POD-101",
  description: "Plan, record and publish a podcast.",
  mainCategory: "Creator skills",
  courseType: "Workshop",
  pricePaise: 199900,
  priceUsdCents: 3499,
  mangoId: "podcast-launchpad",
  refundable: true,
});

test("validates course and country payloads at the API boundary", () => {
  assert.deepEqual(parseCoursePayload([course]), [course]);
  assert.equal(parseCountryPayload({ country_code: "IN" }), "IN");
  assert.equal(parseCountryPayload({ country_code: "US" }), "US");
  assert.throws(() => parseCoursePayload({ courses: [course] }), /not an array/i);
  assert.throws(() => parseCountryPayload({ country_code: "GB" }), /not supported/i);
});

test("ignores isolated malformed course records without hiding valid data", () => {
  assert.deepEqual(parseCoursePayload([course, { courseName: "Incomplete" }]), [course]);
  assert.throws(() => parseCoursePayload([{ courseName: "Incomplete" }]), /valid courses/i);
});

test("converts paise and cents exactly once and always shows two decimals", () => {
  assert.equal(formatCoursePrice(course, "IN"), "₹1,999.00");
  assert.equal(formatCoursePrice(course, "US"), "$34.99");
  assert.equal(formatCoursePrice(course, null), null);
});

test("searches across useful fields and keeps source data immutable", () => {
  const second = {
    ...course,
    courseName: "Notion Second Brain",
    courseCode: "NOT-202",
    mainCategory: "Productivity",
    courseType: "Original",
    pricePaise: 149900,
    priceUsdCents: 1499,
    mangoId: "notion-second-brain",
    refundable: false,
  };
  const source = [course, second];

  assert.deepEqual(filterAndSortCourses(source, "productivity", "default", "IN"), [second]);
  assert.deepEqual(filterAndSortCourses(source, "original", "default", "IN"), [second]);
  assert.deepEqual(filterAndSortCourses(source, "pod-101", "default", "IN"), [course]);
  assert.deepEqual(filterAndSortCourses(source, "", "low", "US"), [second, course]);
  assert.deepEqual(source, [course, second]);
});

test("does not sort by a price whose currency is unknown", () => {
  const expensive = { ...course, courseName: "Expensive", pricePaise: 999900, mangoId: "expensive" };
  assert.deepEqual(filterAndSortCourses([expensive, course], "", "low", null), [expensive, course]);
  assert.equal(pricingRegionLabel(null), "Pricing unavailable");
});

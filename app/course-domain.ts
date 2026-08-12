export type Country = "IN" | "US";
export type SortOrder = "default" | "low" | "high";

export type Course = {
  courseName: string;
  courseCode: string;
  description: string;
  mainCategory: string;
  shortCourse?: string;
  courseType: string;
  pricePaise: number;
  priceUsdCents: number;
  mangoId: string;
  refundable: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCourse(value: unknown): value is Course {
  if (!isRecord(value)) return false;

  const strings = [
    value.courseName,
    value.courseCode,
    value.description,
    value.mainCategory,
    value.courseType,
    value.mangoId,
  ];

  return (
    strings.every((field) => typeof field === "string" && field.trim().length > 0) &&
    typeof value.pricePaise === "number" &&
    Number.isFinite(value.pricePaise) &&
    value.pricePaise >= 0 &&
    typeof value.priceUsdCents === "number" &&
    Number.isFinite(value.priceUsdCents) &&
    value.priceUsdCents >= 0 &&
    typeof value.refundable === "boolean"
  );
}

export function parseCoursePayload(payload: unknown): Course[] {
  if (!Array.isArray(payload)) {
    throw new Error("The courses response was not an array.");
  }

  const validCourses = payload.filter(isCourse);
  if (payload.length > 0 && validCourses.length === 0) {
    throw new Error("The courses response did not contain any valid courses.");
  }

  return validCourses;
}

export function parseCountryPayload(payload: unknown): Country {
  if (!isRecord(payload) || (payload.country_code !== "IN" && payload.country_code !== "US")) {
    throw new Error("The pricing region was not supported.");
  }

  return payload.country_code;
}

export function formatCoursePrice(course: Course, country: Country | null): string | null {
  if (!country) return null;

  const minorUnits = country === "IN" ? course.pricePaise : course.priceUsdCents;
  return new Intl.NumberFormat(country === "IN" ? "en-IN" : "en-US", {
    style: "currency",
    currency: country === "IN" ? "INR" : "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(minorUnits / 100);
}

export function filterAndSortCourses(
  courses: Course[],
  query: string,
  sort: SortOrder,
  country: Country | null,
): Course[] {
  const term = query.trim().toLocaleLowerCase();
  const filtered = courses.filter((course) => {
    if (!term) return true;
    return [
      course.courseName,
      course.description,
      course.mainCategory,
      course.courseType,
      course.courseCode,
    ].some((field) => field.toLocaleLowerCase().includes(term));
  });

  if (sort === "default" || !country) return filtered;

  const priceKey = country === "IN" ? "pricePaise" : "priceUsdCents";
  return [...filtered].sort((left, right) =>
    sort === "low" ? left[priceKey] - right[priceKey] : right[priceKey] - left[priceKey],
  );
}

export function pricingRegionLabel(country: Country | null): string {
  if (country === "IN") return "India · INR";
  if (country === "US") return "United States · USD";
  return "Pricing unavailable";
}

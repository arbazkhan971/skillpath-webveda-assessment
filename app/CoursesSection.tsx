"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE = "https://syncsphere-hiv6.onrender.com";

type Course = {
  courseName: string;
  courseCode: string;
  description: string;
  mainCategory: string;
  shortCourse: string;
  courseType: string;
  pricePaise: number;
  priceUsdCents: number;
  mangoId: string;
  refundable: boolean;
};

type Country = "IN" | "US";
type LoadState = "loading" | "error" | "empty" | "ready";

async function getJson<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    signal,
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.json() as Promise<T>;
}

function formatPrice(course: Course, country: Country | null) {
  if (!country) return null;
  const amount = country === "IN" ? course.pricePaise / 100 : course.priceUsdCents / 100;
  return new Intl.NumberFormat(country === "IN" ? "en-IN" : "en-US", {
    style: "currency",
    currency: country === "IN" ? "INR" : "USD",
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

export function CoursesSection() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [country, setCountry] = useState<Country | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [countryError, setCountryError] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"default" | "low" | "high">("default");
  const [attempt, setAttempt] = useState(0);

  const load = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setState("loading");
    setCountryError(false);

    Promise.allSettled([
      getJson<Course[]>("/assignment/course-data", controller.signal),
      getJson<{ country_code: Country }>("/assignment/country-code", controller.signal),
    ]).then(([courseResult, countryResult]) => {
      if (controller.signal.aborted) return;

      if (courseResult.status === "rejected") {
        setCourses([]);
        setState("error");
        return;
      }

      setCourses(courseResult.value);
      setState(courseResult.value.length === 0 ? "empty" : "ready");

      if (countryResult.status === "fulfilled" && ["IN", "US"].includes(countryResult.value.country_code)) {
        setCountry(countryResult.value.country_code);
      } else {
        // Never guess a currency: a missing price is safer than a confidently wrong one.
        setCountry(null);
        setCountryError(true);
      }
    });

    return () => controller.abort();
  }, [attempt]);

  const visibleCourses = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = term
      ? courses.filter((course) => `${course.courseName} ${course.description} ${course.mainCategory}`.toLowerCase().includes(term))
      : [...courses];

    if (sort !== "default" && country) {
      const key = country === "IN" ? "pricePaise" : "priceUsdCents";
      filtered.sort((a, b) => sort === "low" ? a[key] - b[key] : b[key] - a[key]);
    }
    return filtered;
  }, [courses, country, query, sort]);

  return (
    <section className="coursesSection" id="courses" aria-labelledby="courses-heading">
      <div className="shell">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">The course shelf</p>
            <h2 id="courses-heading">Pick a path.<br />Make it yours.</h2>
          </div>
          <p>Short on theory, rich in useful practice. Every course is designed to help you make something real.</p>
        </div>

        <div className="controls" aria-label="Course filters">
          <label className="searchField">
            <span className="srOnly">Search courses</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses" />
            <span aria-hidden="true">⌕</span>
          </label>
          <label className="sortField">
            <span className="srOnly">Sort courses</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} disabled={!country}>
              <option value="default">Featured order</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </label>
        </div>

        {countryError && state === "ready" && (
          <div className="priceNotice" role="status">
            Prices are temporarily unavailable. Course details are still ready to explore.
            <button onClick={load}>Retry prices</button>
          </div>
        )}

        {state === "loading" && (
          <div className="courseGrid" aria-label="Loading courses" aria-busy="true">
            {Array.from({ length: 6 }, (_, index) => <div className="courseCard skeleton" key={index}><div /><div /><div /><div /></div>)}
          </div>
        )}

        {state === "error" && (
          <div className="stateCard" role="alert">
            <span className="stateIcon">↻</span>
            <h3>The shelf didn’t load this time.</h3>
            <p>The connection can be temperamental. Your next try may be the one.</p>
            <button className="secondaryButton" onClick={load}>Try again</button>
          </div>
        )}

        {state === "empty" && (
          <div className="stateCard">
            <span className="stateIcon">○</span>
            <h3>New courses are on the way.</h3>
            <p>There is nothing on the shelf right now. Check back shortly.</p>
            <button className="secondaryButton" onClick={load}>Check again</button>
          </div>
        )}

        {state === "ready" && visibleCourses.length === 0 && (
          <div className="stateCard compact"><h3>No matching courses.</h3><p>Try a broader search.</p></div>
        )}

        {state === "ready" && visibleCourses.length > 0 && (
          <div className="courseGrid">
            {visibleCourses.map((course, index) => (
              <article className="courseCard" key={course.mangoId || course.courseCode}>
                <div className="cardTop">
                  <span className="cardNumber">{String(index + 1).padStart(2, "0")}</span>
                  {course.refundable && <span className="badge">Refundable</span>}
                </div>
                <div>
                  <p className="category">{course.mainCategory}</p>
                  <h3>{course.courseName}</h3>
                  <p className="description">{course.description}</p>
                </div>
                <div className="cardBottom">
                  <div><span>Format</span><strong>{course.courseType}</strong></div>
                  <div className="price"><span>Price</span><strong>{formatPrice(course, country) ?? "Unavailable"}</strong></div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

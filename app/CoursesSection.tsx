"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import {
  type Country,
  type Course,
  type SortOrder,
  filterAndSortCourses,
  formatCoursePrice,
  parseCountryPayload,
  parseCoursePayload,
  pricingRegionLabel,
} from "./course-domain";

const API_BASE = "https://syncsphere-hiv6.onrender.com";
const REQUEST_TIMEOUT_MS = 8_000;

type CourseState = "loading" | "error" | "empty" | "ready";
type CountryState = "loading" | "error" | "ready";

async function getJson<T>(
  path: string,
  signal: AbortSignal,
  parse: (payload: unknown) => T,
): Promise<T> {
  const requestController = new AbortController();
  const abortRequest = () => requestController.abort();
  const timeout = window.setTimeout(abortRequest, REQUEST_TIMEOUT_MS);
  signal.addEventListener("abort", abortRequest, { once: true });

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      signal: requestController.signal,
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    return parse(await response.json());
  } finally {
    window.clearTimeout(timeout);
    signal.removeEventListener("abort", abortRequest);
  }
}

export function CoursesSection() {
  const searchId = useId();
  const sortId = useId();
  const [courses, setCourses] = useState<Course[]>([]);
  const [country, setCountry] = useState<Country | null>(null);
  const [courseState, setCourseState] = useState<CourseState>("loading");
  const [countryState, setCountryState] = useState<CountryState>("loading");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOrder>("default");
  const [courseAttempt, setCourseAttempt] = useState(0);
  const [countryAttempt, setCountryAttempt] = useState(0);

  const retryCourses = useCallback(() => {
    setCourseState("loading");
    setCourseAttempt((attempt) => attempt + 1);
  }, []);
  const retryCountry = useCallback(() => {
    setCountry(null);
    setCountryState("loading");
    setSort("default");
    setCountryAttempt((attempt) => attempt + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    getJson("/assignment/course-data", controller.signal, parseCoursePayload)
      .then((payload) => {
        if (controller.signal.aborted) return;
        const nextCourses = payload;
        setCourses(nextCourses);
        setCourseState(nextCourses.length === 0 ? "empty" : "ready");
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setCourses([]);
        setCourseState("error");
      });

    return () => controller.abort();
  }, [courseAttempt]);

  useEffect(() => {
    const controller = new AbortController();

    getJson("/assignment/country-code", controller.signal, parseCountryPayload)
      .then((payload) => {
        if (controller.signal.aborted) return;
        setCountry(payload);
        setCountryState("ready");
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setCountry(null);
        setCountryState("error");
        setSort("default");
      });

    return () => controller.abort();
  }, [countryAttempt]);

  const visibleCourses = useMemo(
    () => filterAndSortCourses(courses, query, sort, country),
    [courses, country, query, sort],
  );

  const resultsLabel = query.trim()
    ? `${visibleCourses.length} of ${courses.length} courses match “${query.trim()}”`
    : `${visibleCourses.length} ${visibleCourses.length === 1 ? "course" : "courses"} available`;

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

        {courseState === "ready" && (
          <>
            <div className="controls" aria-label="Course filters">
              <div className="searchField">
                <label className="srOnly" htmlFor={searchId}>Search courses</label>
                <span aria-hidden="true">⌕</span>
                <input
                  id={searchId}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by name, topic or format"
                  type="search"
                />
                {query && <button className="clearSearch" type="button" onClick={() => setQuery("")} aria-label="Clear course search">Clear</button>}
              </div>
              <div className="sortField">
                <label htmlFor={sortId}>Sort by price</label>
                <select
                  id={sortId}
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortOrder)}
                  disabled={countryState !== "ready"}
                  aria-describedby={countryState === "error" ? "pricing-status" : undefined}
                >
                  <option value="default">Featured order</option>
                  <option value="low">Low to high</option>
                  <option value="high">High to low</option>
                </select>
              </div>
            </div>

            <div className="resultsMeta">
              <p aria-live="polite">{resultsLabel}</p>
              <p className={`regionBadge regionBadge--${countryState}`}>
                <span aria-hidden="true" />
                {countryState === "loading" ? "Detecting pricing region" : pricingRegionLabel(country)}
              </p>
            </div>
          </>
        )}

        {countryState === "error" && courseState === "ready" && (
          <div className="priceNotice" id="pricing-status" role="status">
            <div>
              <strong>Course details are ready; pricing is not.</strong>
              <span>We will never guess a currency when the region request fails.</span>
            </div>
            <button type="button" onClick={retryCountry}>Retry pricing only</button>
          </div>
        )}

        {courseState === "loading" && (
          <div className="courseGrid" aria-label="Loading courses" aria-busy="true">
            {Array.from({ length: 6 }, (_, index) => (
              <div className="courseCard skeleton" aria-hidden="true" key={index}><div /><div /><div /><div /></div>
            ))}
          </div>
        )}

        {courseState === "error" && (
          <div className="stateCard" role="alert">
            <span className="stateIcon" aria-hidden="true">↻</span>
            <p className="stateKicker">Recovery state</p>
            <h3>The shelf did not load this time.</h3>
            <p>The API is intentionally unreliable, so this screen is part of the experience—not a dead end.</p>
            <button className="secondaryButton" type="button" onClick={retryCourses}>Retry courses</button>
          </div>
        )}

        {courseState === "empty" && (
          <div className="stateCard" role="status">
            <span className="stateIcon" aria-hidden="true">○</span>
            <p className="stateKicker">Zero-data state</p>
            <h3>New courses are on the way.</h3>
            <p>The request worked, but the shelf is empty right now.</p>
            <button className="secondaryButton" type="button" onClick={retryCourses}>Check again</button>
          </div>
        )}

        {courseState === "ready" && visibleCourses.length === 0 && (
          <div className="stateCard compact" role="status">
            <p className="stateKicker">No search results</p>
            <h3>Nothing matched “{query.trim()}”.</h3>
            <p>Try a topic, format, or shorter phrase.</p>
            <button className="secondaryButton" type="button" onClick={() => setQuery("")}>Clear search</button>
          </div>
        )}

        {courseState === "ready" && visibleCourses.length > 0 && (
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
                  <div><span>Course code</span><strong>{course.courseCode}</strong></div>
                  <div className="price">
                    <span>Price</span>
                    <strong>{countryState === "loading" ? "Checking…" : formatCoursePrice(course, country) ?? "Unavailable"}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

# Skillpath — Junior Developer Assessment

A Framer learning-platform page built for WebVeda’s junior developer assessment. The interface is intentionally simple; the engineering underneath is prepared for unreliable data, partial failure and small screens.

**[Open the live Framer assessment →](https://multiple-clarity-766479.framer.app/)**  
**[View the GitHub repository →](https://github.com/arbazkhan971/skillpath-webveda-assessment)**

## A three-minute reviewer tour

1. Open the live page and notice that course content comes from the supplied API.
2. Search by a name, topic or format, then sort the results by regional price.
3. Refresh or retry if the intentionally flaky API fails. Course and country requests recover independently.
4. Narrow the browser: the catalog changes from three columns to two and then one.
5. In Framer, change the **Accent** colour or **Heading** property. Those are the component’s only two controls.

## Failure behaviour is a product decision

| Courses request | Country request | What the learner sees |
|---|---|---|
| Success with data | Success | Searchable cards with INR or USD pricing |
| Success with data | Failure | Cards remain usable; prices and price sorting are withheld; pricing retries independently |
| Success, empty array | Any result | A deliberate zero-data state with retry |
| Failure or timeout | Any result | A clear recovery state; retry affects the courses request only |

The app never guesses a currency. Showing no price is safer than confidently displaying the wrong one.

## Engineering details

- Both endpoints use explicit `GET` requests, an eight-second timeout and cleanup-safe `AbortController`s.
- Payloads are checked at the API boundary before they reach rendering code.
- Paise and cents are divided exactly once and formatted with `Intl.NumberFormat`.
- Search covers course name, description, category, format and course code.
- Sorting copies the result set, so API data is never mutated.
- The Framer component measures its own container with `ResizeObserver`, which makes its 3/2/1-column layout work inside Framer canvases as well as normal browser windows.
- Loading, API failure, empty data, partial country failure and zero search results each have a distinct state.
- Labels, live regions, focus styles, reduced-motion support and semantic elements are included for keyboard and assistive-technology users.
- The standalone Framer component exposes exactly two property controls: accent colour and section heading.

## Project map

```text
app/CoursesSection.tsx       Independent data loading and UI states
app/course-domain.ts         Validation, currency, search and sorting logic
framer/SkillpathCourses.tsx  Standalone paste-ready Framer component
tests/                       Domain and assignment-contract checks
ASSESSMENT_NOTE.md           Short reflection and AI-use disclosure
```

## Run and verify locally

Requires Node.js 22 or newer.

```bash
npm ci
npm run dev
npm run check
```

`npm run check` runs the focused test suite, accessibility-aware linting and the production build. The same command runs in GitHub Actions on every push and pull request.

## Assessment note

See [`ASSESSMENT_NOTE.md`](ASSESSMENT_NOTE.md) for the requested short reflection, limitations and AI-use disclosure.

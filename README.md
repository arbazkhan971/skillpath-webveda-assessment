# Skillpath — Junior Developer Assessment

A responsive learning-platform landing page and Framer code component built for the WebVeda junior developer assessment.

**Live Framer assessment:** [multiple-clarity-766479.framer.app](https://multiple-clarity-766479.framer.app/)

**GitHub repository:** [arbazkhan971/skillpath-webveda-assessment](https://github.com/arbazkhan971/skillpath-webveda-assessment)

## What is included

- Live course data from the supplied API (never hardcoded)
- Correct INR paise and USD cents conversion
- Independent handling when course or country requests fail
- Loading skeletons, error recovery, empty results, and retry controls
- Search, price sorting, and conditional refundable badges
- Three-, two-, and one-column responsive layouts
- Two Framer property controls: accent colour and section heading

The standalone Framer component is in [`framer/SkillpathCourses.tsx`](framer/SkillpathCourses.tsx). The `app/` directory contains the matching full-page implementation used for local validation.

## Run locally

```bash
npm install
npm run dev
npm run build
```

## Engineering note

See [`ASSESSMENT_NOTE.md`](ASSESSMENT_NOTE.md) for trade-offs, limitations, and how AI was used.

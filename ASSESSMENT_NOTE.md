# Skillpath assessment note

## What I would fix with two more days

I would add automated tests for loading, failure and empty responses, plus checks on slower phones and with longer course names. I would also cache the last valid country briefly and label cached prices clearly. Today, if the country call fails, I hide prices instead of guessing INR or USD.

## Where I got stuck / what I am not happy with

The awkward case was courses loading while the country request failed. I kept the courses visible, disabled price sorting and offered a country retry. That retry currently reloads both requests; I would make each retry independently with more time.

## AI used

I used OpenAI Codex to review the brief, challenge failure cases and build a local reference. I used Framer Agent for the page and component, then corrected its country parser and responsive-width logic after testing. I reviewed the requests, currency conversion, cleanup and breakpoints, and can explain every submitted line.

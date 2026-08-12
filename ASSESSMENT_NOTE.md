# Skillpath assessment note

## What I would fix with two more days

I would add browser-level tests that simulate slow responses, request timeouts and malformed records instead of relying on manual retries. I would also cache the last confirmed country briefly, label the price as cached and measure whether learners actually use search and sorting.

## Where I got stuck / what I am not happy with

The awkward case was courses loading while the country request failed. I did not want one optional request to erase useful course data, and I did not want to guess a currency. I kept the catalog visible, disabled price sorting and gave pricing its own retry. The trade-off is a little more state, but the learner gets an honest, recoverable screen.

## AI used

I used OpenAI Codex to review the brief, challenge failure cases and build a local reference. I used Framer Agent for the page and component, then corrected its country parser and container-width logic after testing. I reviewed the requests, validation, currency conversion, cleanup and breakpoints, and can explain every submitted line.

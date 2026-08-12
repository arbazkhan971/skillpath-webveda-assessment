# Skillpath assessment note

## What I would fix with two more days

I would first add tests for loading, failure and empty responses, because clicking retry again and again is not a real test plan. I would also remember the last valid country for a short time and clearly label the price as cached. Right now, if only the country call fails, I hide the prices instead of guessing INR or USD. It is less pretty, but I would rather show no price than the wrong one. I would also test the cards with longer real course names and spend time checking the page on a slower phone.

## Where I got stuck / what I am not happy with

The awkward case was when the courses load but the country does not. I kept the courses visible, disabled price sorting and added a separate retry for prices. The retry currently reloads both calls. It works and keeps the code easy to explain, but with more time I would let each request retry independently.

## AI used

I used OpenAI Codex to read the brief with me, draft the first version and question the failure cases. I rewrote the decisions around the country-call failure and reviewed the GET requests, paise/cents conversion, React cleanup and responsive breakpoints. I can explain every line I am submitting.

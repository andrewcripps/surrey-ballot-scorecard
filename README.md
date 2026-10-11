# Surrey Ballot Scorecard 2026

A free, non-partisan tool to help Surrey, BC voters compare candidates for **City Council** (vote up to 8) and **School Trustee** (vote up to 6) in the October 17, 2026 general local election, based on their own values rather than slate loyalty.

## How it works
- Set how much each criterion matters (experience, specific plan, your priorities, track record, independence).
- Score candidates 1–5 on each criterion.
- Your top scorers fill your ballot; you can vote for fewer than the maximum.
- Scores are saved only in your own browser (localStorage). Nothing is sent anywhere.

## Files
| File | What it is |
|---|---|
| `index.html` | Page structure |
| `styles.css` | Styling (light and dark themes) |
| `candidates.js` | All candidate data — edit this to update profiles |
| `app.js` | Scoring and ballot logic |

No build step. Open `index.html` in a browser to run it locally.

## Deploy
Import this repo at vercel.com/new. Framework preset: **Other**. No build command, output directory is the repo root. Every push to `main` redeploys.

## Sources and disclaimer
Candidate backgrounds and priorities paraphrase each candidate's own statement on the [City of Surrey candidate pages](https://www.surrey.ca/2026-municipal-election), plus slate websites. They are the candidates' claims, not verified facts. This tool does not endorse any candidate or slate.

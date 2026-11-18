# FixPoint website (fixpoint.li)

Edit on GitHub, Vercel rebuilds and publishes automatically.

## What to edit
- `src/content.js` – phone number (top), device brands and models (`DEV`), service areas (`PLACES`), and ALL German/English texts and prices (`T`, prices are in `rows`).
- `public/impressum.html`, `public/datenschutz.html` – legal pages (fill the [PLACEHOLDERS] in the Impressum).
- `src/template.html` – page layout. `src/head.html` – title, description, colours and styles.

## How to publish a change
1. Open the file on GitHub, click the pencil icon, edit, then "Commit changes".
2. Vercel starts a new deployment (about a minute). If the build fails, the old version stays live; check the error in the Vercel dashboard.

## Local build (optional)
`npm install && npm run build` creates the finished site in `dist/`.

## Deploy button
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR-GITHUB-USER/YOUR-REPO)
Replace YOUR-GITHUB-USER/YOUR-REPO with your repository (it must be public for the button).

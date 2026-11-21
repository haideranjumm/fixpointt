# FixPoint website (fixpoint.li)

## Editing the site
Open **https://fixpoint.li/admin**, enter the admin password, edit prices, areas, phone, devices/models or any text, and press Save.
Saving commits `content.json` to GitHub; Vercel rebuilds and the live site updates in about a minute.

## One-time setup in Vercel (Project -> Settings -> Environment Variables)
- `ADMIN_PASSWORD` - a long, unique password (the admin page asks for it when saving)
- `GITHUB_TOKEN` - a fine-grained GitHub token for THIS repository only, permission "Contents: Read and write"
- `GITHUB_REPO` - your repository as `username/repository`
- `GITHUB_BRANCH` - optional, defaults to `main`
Then redeploy once so the variables apply.

## Files
- `content.json` - all data and texts (the admin edits this file; you can also edit it on GitHub)
- `src/` - page layout, styles and logic. `public/` - legal pages, admin page, robots.txt, sitemap.xml
- `api/save.js` - the save function (checks the password, validates, commits to GitHub)
- `src/defaults.json` - built-in defaults (price estimates, a few texts). Anything saved in `content.json` wins over them.
- `build.js` - builds the site into `dist/`

Keep the folder structure when uploading (drag the folders `api`, `src` and `public` into GitHub's upload page).

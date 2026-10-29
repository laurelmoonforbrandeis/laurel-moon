# Laurel Moon website

The website for Laurel Moon, Brandeis University's oldest national literary magazine.

- **Site:** built with [Eleventy](https://www.11ty.dev/) from the files in `src/`.
- **Editor:** [Decap CMS](https://decapcms.org/) at `/admin/`, so club members can add issues and update the site without touching code.
- **Hosting:** [Netlify](https://www.netlify.com/), which rebuilds the site every time someone publishes a change.

Editors who just want to update the site should read **[EDITING-GUIDE.md](EDITING-GUIDE.md)** instead. This file is for whoever sets the site up or maintains it.

---

## How it fits together

1. Everything on the site (issues, poems, events, staff) lives as text files in this GitHub repository.
2. An editor logs in at `yourdomain/admin/` with their GitHub account and makes changes in a normal-looking form.
3. Decap CMS saves those changes back to GitHub.
4. Netlify notices the change, rebuilds the site, and publishes it, usually within a minute or two.

Nobody needs to install anything to edit. Only the person maintaining the code needs Node.js.

---

## One-time setup

You only do this once. It takes about an hour.

### 1. Put the code on GitHub

1. Create a free GitHub **organization** for the club (for example `laurelmoon-brandeis`) using a shared club email, not a personal one. An organization outlives any one student's account.
2. Create a repository in it called `laurel-moon` and push this folder to it.
3. Open `src/admin/config.yml` and replace `YOUR-GITHUB-ORG/laurel-moon` with the real organization and repository name.

### 2. Deploy on Netlify

1. Sign up for Netlify with the shared club email and choose **Add new project > Import an existing project > GitHub**.
2. Pick the `laurel-moon` repository. Netlify reads the build settings from `netlify.toml`, so you can accept the defaults.
3. Wait for the first deploy to finish and open the `something.netlify.app` address to check the site.

### 3. Connect the club's domain

1. In Netlify, open **Domain management** and add the club's domain. Netlify shows the DNS records to set at your domain registrar, or offers to manage DNS for you.
2. Once it works, put the domain in two places:
   - `src/admin/config.yml`: `site_url` and `display_url`
   - `src/_data/site.json`: `url` (or change it later in the editor under **Site settings > General**)

### 4. Let editors log in with GitHub

1. In GitHub, go to the organization's **Settings > Developer settings > OAuth Apps > New OAuth App** and enter:
   - **Homepage URL:** the club's domain, like `https://www.yourdomain.org`
   - **Authorization callback URL:** `https://api.netlify.com/auth/done`
2. Register it, then generate a client secret. Keep this page open.
3. In Netlify, open your project and go to **Project configuration > Access & security > OAuth > Authentication providers > Install provider**. Choose GitHub and paste the client ID and client secret.
4. Visit `yourdomain/admin/` and log in with GitHub to test.

### 5. Add editors, with access that ends on its own

Anyone who should be able to edit needs a free GitHub account and write access to this repository. Give that access through a team rather than person by person, so it can be taken away cleanly:

1. In the organization, create a team called `editors` and give it the **Write** role on this repository (**Settings > Collaborators and teams**).
2. Add each editor to the team. Don't add people individually as collaborators.
3. In the organization's settings, set **Base permissions** to **No permission** or **Read**, and turn on **Require two-factor authentication**.

Removing someone from the team ends their access immediately, even if they're still logged in to the editor.

To have access end automatically on a set date (like graduation), set up the separate **laurel-moon-editor-access** project that comes with this one. It keeps a list of editors and end dates, removes people from the team the morning after their date, and opens a GitHub issue to say so. Its README walks through the setup. Keep it in its own private repository: editors can change anything in this one, including a list of their own end dates.

### 6. Turn on newsletter signups

The email signup in the footer uses Netlify Forms. After the first deploy, open **Forms** in Netlify. If it asks you to enable form detection, turn it on and redeploy. Signups then appear under **Forms > newsletter**, and you can export them as a spreadsheet or set up email notifications there.

### 7. Replace the sample content

Everything in `[square brackets]` is a placeholder. The quickest way to fill it in is through the editor once you're logged in:

- **Site settings > General, Submissions, Events, Staff:** real text, email, Instagram, deadlines, and the submission form link.
- **Issues > Spring 2026:** the poem "Laundry, 1 a.m." is stand-in text written to show the layout. Replace it with the real featured piece, and fix the publication date.
- **Issues > Fall 2025:** a minimal sample. Fill it in or delete it.

---

## Working on the code

You need [Node.js](https://nodejs.org/) 18 or newer.

```bash
npm install        # once
npm start          # builds the site and serves it at http://localhost:8080
```

To try the editor on your own computer without touching the live site, run `npm run cms` in a second terminal, then open `http://localhost:8080/admin/`. Changes save straight to the files on your computer.

`npm run build` makes a production build in `_site/`.

### Where things live

| What | Where |
|---|---|
| Issues (one file per semester) | `src/issues/*.md` |
| Site text, submissions, events, staff | `src/_data/*.json` |
| Uploaded images and PDFs | `src/uploads/` |
| Page templates | `src/*.njk` and `src/_includes/` |
| Colors, fonts, spacing | `src/assets/css/style.css` (the `:root` block at the top) |
| Search, filters, reading controls | `src/assets/js/main.js` |
| What the editor shows | `src/admin/config.yml` |
| Collections and filters | `eleventy.config.js` |

### Page addresses

- `/`: home, featuring the newest issue
- `/issues/spring-2026/`: an issue (the address comes from the issue name)
- `/issues/spring-2026/laundry-1-a-m/`: a single poem, story, or artwork
- `/archive/`, `/about/`, `/submit/`

### Updating the editor

The editor (Decap CMS) is pinned to version 3.16.3 in `src/admin/index.html`, so it never changes on its own. To upgrade, check the [Decap CMS releases](https://github.com/decaporg/decap-cms/releases), change the version number in that file, and try adding and publishing a test issue locally (`npm start` plus `npm run cms`) before pushing the change.

### Changing cover colors or moon phases

The options editors pick from are defined in two places that must match:

- `COVER_COLORS` and `MOON_PHASES` at the top of `eleventy.config.js`
- the `cover_color` and `moon_phase` options in `src/admin/config.yml`

### Adding many old issues at once

Each back issue only needs a title and a date to appear in the archive. For a big batch it's faster to create the files directly than to use the editor, for example `src/issues/fall-1991.md`:

```yaml
---
title: Fall 1991
date: 1991-12-01
cover_color: midnight
moon_phase: crescent
pdf: /uploads/laurel-moon-fall-1991.pdf
pieces: []
---
```

---

## Alternative login without GitHub accounts

If asking every editor to make a GitHub account becomes a problem, Decap CMS can use Netlify Identity with Git Gateway, which lets editors log in with just an email address. As of 2026, Netlify Identity is supported, but Netlify lists Git Gateway as deprecated: existing setups keep working, and new setups are not recommended. Check Netlify's current documentation before switching. To switch, enable Identity and Git Gateway in Netlify, then change the `backend` block in `src/admin/config.yml` to:

```yaml
backend:
  name: git-gateway
  branch: main
```

and add Netlify's Identity script to `src/admin/index.html` as described in the Decap CMS docs.

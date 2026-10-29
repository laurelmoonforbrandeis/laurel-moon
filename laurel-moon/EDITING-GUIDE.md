# Editing the Laurel Moon website

This guide is for Laurel Moon staff. You don't need to know any code. Everything happens in the editor at **yourdomain/admin/**.

## Logging in

1. Go to **yourdomain/admin/** and choose **Login with GitHub**.
2. If you don't have access yet, ask the editor-in-chief or whoever manages the site to add your GitHub account. A GitHub account is free.

There's also an **Editor login** link at the bottom of every page on the site.

## How publishing works

Nothing you type goes live until you publish it, so it's safe to experiment.

1. Make your changes and click **Save**. The change is now a draft.
2. Set the status to **In review** if someone else should check it, or **Ready** when it's good to go.
3. Click **Publish**, then **Publish now**.
4. The live site updates on its own, usually within a minute or two. Refresh the page to see it.

The **Workflow** tab shows every draft in three columns (Drafts, In review, Ready), so the editor-in-chief can see what's waiting.

## Adding a new issue

Do this once each semester when the new issue comes out.

1. Open **Issues** and click **New Issue**.
2. **Issue name:** the season and year, like `Fall 2026`. This also becomes the web address, so double-check the spelling before you publish.
3. **Publication date:** the day the issue comes out. The issue with the newest date automatically becomes the current issue on the home page and in the menu.
4. **Short introduction:** two or three sentences. These appear on the home page while this is the newest issue.
5. **Cover:** upload a cover image if you have one, and write a short description of it for people using screen readers. If you skip the image, the site draws a moon cover instead. Pick a color and a moon phase that are different from the last issue.
6. **Issue PDF:** upload the full magazine if you have one. Readers get a **Download the PDF** button.
7. **Pieces:** add each poem, story, and artwork (see the next section).
8. **Staff for this issue:** the roles and names for this semester.
9. **Note from the editors:** optional, and appears near the top of the issue page.
10. Save, check it over, then publish.

## Adding pieces to an issue

Click **Add piece** for each one. Drag pieces up and down to set the order of the table of contents. The first piece is where **Start reading** begins.

- **Type:** Poetry, Prose, or Art. This controls how the piece is laid out and lets readers filter the contents.
- **Feature on the home page:** turn this on for one piece per issue. That piece fills the big dark section at the top of the home page. If you don't choose one, the first poem is featured.
- **School:** the contributor's school, written how they'd like it, for example `Brandeis University '27`.

**Poems.** Paste the poem into **Text** exactly as it should appear. Every line break, blank line between stanzas, and space at the start of a line is kept. If a poem uses unusual spacing, compare it against the PDF after publishing.

**Prose.** Leave a blank line between paragraphs.

**Art.** Upload the image under **Artwork image** and describe it under **Artwork description**, for example: "A charcoal drawing of a figure asleep on a train, face turned to the window." The **Text** box is optional and works for an artist statement or the medium and year.

**Bios.** Optional, and shown at the bottom of the piece's page.

## Fixing a typo in an old issue

Open **Issues**, choose the issue, open the piece, fix it, then save and publish. If you change a piece's title, its web address changes too, so old links to it will stop working. Avoid renaming pieces unless you need to.

## Opening and closing submissions

Go to **Site settings > Submissions**.

- **Submissions are open:** turn this off when the reading period ends. The home page and Submit page then show the closed message instead.
- **Issue taking submissions:** update this each semester, like `Spring 2027`.
- **Submission form link:** the Google Form or Submittable link where people send work.
- **Deadline** and the **limits** for poetry, prose, and art.
- **Full guidelines:** the complete rules, shown on the Submit page.

## Events

Go to **Site settings > Events** and add each reading, open mic, or workshop with its date, time, and location. Events disappear from the site on their own a few hours after they start, so you only need to clear out old ones now and then. When no events are coming up, the site says so automatically.

## About page, staff, and contact details

- **Site settings > General:** the About text, staff meeting time, club email, and Instagram.
- **Site settings > Staff:** the current staff list on the About page. Update it at the start of each year.

## End-of-year handover checklist

Before graduating seniors leave:

- Make sure at least two incoming staff members can log in to the editor.
- Update **Site settings > Staff** with the new staff.
- Check the **editor access list** (the `editors.yml` file in the club's private editor-access repository). Give new editors an end date, and make sure everyone leaving has one. People are removed automatically the morning after their date.
- If the person who made the editor-access token is leaving, have someone staying make a new one before they go.
- Make sure the organization still has at least two owners who are staying, and remove owner status from anyone leaving.
- Pass on the login details for the club's shared email, GitHub organization, Netlify account, and domain registrar.

## If something goes wrong

- **The site didn't update:** wait two or three minutes and refresh. If it still hasn't changed, ask the site manager to check the Deploys page in Netlify.
- **You published a mistake:** fix it and publish again. Every past version is saved in GitHub, so nothing is ever truly lost, and the site manager can restore an earlier version if needed.
- **You can't log in, or saving fails:** your access may have reached its end date. Ask the site manager to check that your GitHub account is on the editors team and in the editor access list.

# Carlvin Jerry Blog

Static Hugo site for [www.carlvinjerry.com](https://www.carlvinjerry.com/), hosted with GitHub Pages and the Toha Hugo theme.

## Branch Rules

- `main` is the production branch. Pushes to `main` deploy the public site.
- `develop` is the working branch. New blog posts, content fixes, and theme update PRs should target `develop`.
- Theme updates should come through Hugo module updates on `develop`, not by blindly merging the original Toha example-site fork.
- `upstream` may be used locally as a fetch-only reference for comparing against `hugo-toha/hugo-toha.github.io`.
- `gh-pages` is generated deployment output. Do not edit it manually.

## Adding A Blog Post

For ordinary blog posts, work directly on `develop`:

```powershell
git switch develop
git pull --ff-only origin develop
```

Add the post under `content/posts/...`. Article files should usually be named `index.md` or `index.markdown` inside a folder for that post.

Required front matter for article posts:

```yaml
---
title: "Post title"
date: 2026-07-15T10:00:00+03:00
description: "Short summary used by cards, previews, and checks."
summary: "Card summary used on post lists."
categories: ["Programming"]
tags: ["F#", "Code Sustainability"]
image: /images/example.png
hero: example.png
canonical: "https://original.example.com/post/"
---
```

Post rules enforced by `npm run check:blog`:

- front matter must exist and close correctly
- top-level front matter keys must not be duplicated
- `title` must be non-empty
- article posts must have a valid `date`
- article posts must have a non-empty `description`
- article posts must have a non-empty `summary`
- `tags`, when present, must be a list of strings
- `categories`, when present, must be a list of strings
- relative `image` or `hero` files must exist next to the post

If a post was first published elsewhere, set `canonical` in front matter and include a visible note near the top of the post:

```markdown
> Originally published at [Original Site](https://original.example.com/post/).
```

## Generating A Post Folder

Use the generator when you want Codex or the terminal to create the section, optional child section, post folder, front matter, copied cover image, canonical note, and `index.md` in one step.

```powershell
npm run new:post -- `
  --title "A Year Is Enough to Know What You Don't Know" `
  --date 2026-07-14T09:00:00+03:00 `
  --section Life `
  --subcategory Mentorship `
  --slug one-year-in-hod `
  --author "Carlvin Jerry" `
  --description "A reflective leadership essay on the first year in an HOD role." `
  --summary "This post reflects on one year in leadership, mentorship, difficult conversations, and sustainable team culture." `
  --categories "Life,Mentorship,Leadership" `
  --tags "Leadership,Mentorship,Career Growth,Team Culture,HOD" `
  --cover "C:\path\to\cover.jpg" `
  --source "C:\path\to\draft.md" `
  --canonical "https://original.example.com/post/"
```

Generator behavior:

- creates `content/posts/<section>/` when missing
- creates `content/posts/<section>/_index.md` when missing
- creates `content/posts/<section>/<subcategory>/` when `--subcategory` is provided
- creates the child `_index.md` with the correct sidebar parent
- creates `content/posts/<section>/<subcategory>/<slug>/index.md`
- copies the cover image into the post folder as `cover.<ext>`
- sets both `image` and `hero` to the copied cover image
- adds a visible original-publication note when `--canonical` is provided
- strips source front matter and a matching top-level `# Title` from imported drafts

Run checks before pushing:

```powershell
npm ci
npm run check:blog
hugo --gc --minify --enableGitInfo
```

Commit and push to `develop`:

```powershell
git add content/posts
git commit -m "Add my new post"
git push origin develop
```

After the push, GitHub Actions runs `Promote Site Changes`. If the full diff from `main` to `develop` only contains allowed site files and checks pass, it updates `main` automatically. The `main` deployment workflow then publishes the site.

## Blog Automerge

Direct pushes to `develop` are the normal path for blog posts. Blog PRs are still supported when you want review first, and can be merged automatically into `develop` when all of these are true:

- the PR targets `develop`
- the PR has the `automerge-blog` label
- `PR Workflows` passes
- changed files are limited to `content/posts/`, `assets/images/`, `static/images/`, or `static/files/`

Do not use `automerge-blog` for theme, workflow, dependency, or deployment changes.

Direct-push promotion from `develop` to `main` is intentionally limited to site files. Blog posts, config edits, theme module updates, layouts, data files, static files, and workflow maintenance can deploy this way after checks pass. If `develop` contains changes outside these paths, the promotion workflow skips the push to `main`:

- `content/`
- `assets/`
- `static/`
- `data/`
- `layouts/`
- `i18n/`
- `archetypes/`
- `scripts/`
- `.github/workflows/`
- `hugo.yaml`
- `go.mod`
- `go.sum`
- `package.json`
- `package-lock.json`
- `package.hugo.json`
- `README.md`

## Theme Updates

The site uses Toha as a Hugo module:

```text
github.com/hugo-toha/toha/v4
```

Personal look-and-feel changes live in local override files, not inside the downloaded theme module:

- `assets/styles/recursion.scss`
- `layouts/partials/header.html`
- `layouts/partials/sections/home.html`
- `layouts/partials/sections/about.html`
- `data/en/*.yaml`

This keeps future Toha updates mergeable. When updating the original theme, update the Hugo module and then review whether any local partial overrides need to be adjusted for upstream template changes.

To update the theme manually:

```powershell
git switch develop
git pull --ff-only origin develop
git switch -c update/theme

hugo mod get -u github.com/hugo-toha/toha/v4
hugo mod tidy
hugo mod npm pack
npm install
npm run check:blog
hugo --gc --minify --enableGitInfo

git add go.mod go.sum package.json package-lock.json packages
git commit -m "Update Toha theme"
git push -u origin update/theme
gh pr create --base develop --head update/theme --title "Update Toha theme"
```

Scheduled theme update PRs should target `develop`, not `main`.

## Deploying

Deployment happens when `main` changes:

1. Merge reviewed changes from `develop` into `main`.
2. GitHub Actions runs `Deploy Hugo Site to GitHub Pages`.
3. The workflow builds Hugo and publishes `public/` to `gh-pages`.
4. GitHub Pages serves the site at `https://www.carlvinjerry.com/`.

## Custom Domain

Canonical domain:

```text
www.carlvinjerry.com
```

Repository files that must match the canonical domain:

- `CNAME`
- `hugo.yaml` `baseURL`
- `.github/workflows/deploy.yml` `cname`

Namecheap DNS records:

```text
Type    Host   Value
CNAME   www    CarlvinJerry.github.io
A       @      185.199.108.153
A       @      185.199.109.153
A       @      185.199.110.153
A       @      185.199.111.153
```

The `www` CNAME serves the canonical site. The apex A records let `carlvinjerry.com` resolve through GitHub Pages and redirect to the configured custom domain when GitHub Pages is set up correctly.

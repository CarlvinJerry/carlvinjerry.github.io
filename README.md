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
categories: ["Programming"]
tags: ["F#", "Code Sustainability"]
image: /images/example.png
hero: example.png
---
```

Post rules enforced by `npm run check:blog`:

- front matter must exist and close correctly
- top-level front matter keys must not be duplicated
- `title` must be non-empty
- article posts must have a valid `date`
- article posts must have a non-empty `description`
- `tags`, when present, must be a list of strings
- `categories`, when present, must be a list of strings
- relative `image` or `hero` files must exist next to the post

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

After the push, GitHub Actions runs `Promote Blog Changes`. If the full diff from `main` to `develop` only contains blog/content asset files and checks pass, it updates `main` automatically. The `main` deployment workflow then publishes the site.

## Blog Automerge

Direct pushes to `develop` are the normal path for blog posts. Blog PRs are still supported when you want review first, and can be merged automatically into `develop` when all of these are true:

- the PR targets `develop`
- the PR has the `automerge-blog` label
- `PR Workflows` passes
- changed files are limited to `content/posts/`, `assets/images/`, `static/images/`, or `static/files/`

Do not use `automerge-blog` for theme, workflow, dependency, or deployment changes.

Direct-push promotion from `develop` to `main` is intentionally blog-only. If `develop` contains changes outside these paths, the promotion workflow skips the push to `main`:

- `content/posts/`
- `assets/images/`
- `static/images/`
- `static/files/`

## Theme Updates

The site uses Toha as a Hugo module:

```text
github.com/hugo-toha/toha/v4
```

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

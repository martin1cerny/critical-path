# CPM — Critical Path Analysis Tool (Czech / čeština)

A Czech-localized copy of the app at <https://cpm.dappli.org/>, downloaded and
translated on 2026-09-22.

## What this is

The original site is a compiled single-page app (React, built with Vite). Only
the production build is published — there is no source map, so the original
source code is not available. This copy therefore contains exactly what the site
serves, plus a translation layer:

```
index.html                      – app shell (edited: lang=cs, Czech <title>/meta, loads i18n-cs.js, analytics removed, relative paths + <base>)
i18n-cs.js                       – Czech translation overlay + base-path auto-detection
assets/index-BzlwJn9O.js         – the app bundle (patched: Ethereum sign-in disabled + subpath-aware router basename; otherwise original)
assets/exceljs.min-Do-cdZbn.js   – Excel-export library, loaded on demand (unchanged, original)
404.html                         – GitHub Pages SPA fallback (deep-link support)
.nojekyll                        – tells GitHub Pages to skip Jekyll processing
serve.py                         – tiny local web server with SPA routing (for testing)
```

## Removed features

- **Analytics / tracking removed.** The GoatCounter tracking snippet was deleted
  from `index.html`. Nothing is loaded from third-party analytics.
- **Ethereum wallet sign-in removed.** The app gated its entire wallet UI on a
  single provider-lookup function `xo()` (which returned MetaMask's
  `window.ethereum`). That function was patched to return `null`, so the wallet
  widget never renders, "Connect Wallet" never appears, and no sign-in,
  `eth_requestAccounts`, or message-signing can occur — for every visitor,
  including those with MetaMask installed. `window.ethereum` is no longer
  referenced anywhere in the bundle. (Verified by injecting a fake MetaMask
  provider and confirming no wallet UI appears.) The cross-device *sync* feature
  that depended on it is therefore also inert; all data stays local in IndexedDB
  as before.

## How the translation works

`i18n-cs.js` is a runtime **translation overlay**. It watches the page with a
`MutationObserver` and replaces English UI text (and input placeholders,
tooltips, `aria-label`s) with Czech, using a dictionary plus rules for dynamic
values. It deliberately does **not** modify the app's internal logic strings
(type tags, storage keys, error codes), so it cannot corrupt saved projects or
break behavior, and it re-applies automatically as you navigate.

It handles:
- All static UI text (landing page, project list, forms, editor, dialogs, menus,
  validation and error messages).
- Correct Czech pluralization for counts: `2 dny` / `5 dní`, `2 projekty`,
  `50 činností`, `64 závislostí`.
- Dynamic labels: `Day 25` → `Den 25`, `Float:8` → `Rez.:8`, dates like
  `22 Sept 2026` → `22. zář 2026`.
- The built-in demo project ("Mobile App Launch") including all 50 activity
  names and descriptions.
- JS-truncated activity names in the network diagram (e.g. `API Contract Des...`
  → `API katalogu pro...`).

## Run it locally

```bash
python serve.py            # then open http://127.0.0.1:8000/
```

## Hosting (root or subpath)

All asset references are relative and an injected `<base>` tag anchors them to
the app's own directory, so the same files work both at a domain root and under
a subdirectory with **no rebuild**:

- The React Router `basename` is set at runtime from `window.__CPM_BASE__`, which
  `i18n-cs.js` derives from its own script URL.
- `404.html` provides the single-page-app fallback so deep links / refreshes work
  on static hosts that don't rewrite unknown paths to `index.html`.

### GitHub Pages (project site)

This repo is ready to serve as-is:

1. Push to `main` (already done).
2. Repo **Settings → Pages → Build and deployment → Source: Deploy from a
   branch**, branch **`main`**, folder **`/ (root)`**. Save.
3. The site appears at `https://<user>.github.io/<repo>/` (e.g.
   `https://martin1cerny.github.io/critical-path/`).

`404.html` uses `pathSegmentsToKeep = 1`, which matches a project site served
under one path segment (`/critical-path/`). If you instead serve from a domain
root (a user/org site or a custom domain), set `pathSegmentsToKeep = 0` in
`404.html`.

Any other static host (Netlify, S3, nginx …) works too — at a root or a subpath.

## Known limitations

- **Excel export stays English.** The `.xlsx` file is generated inside the app
  bundle from English column labels; the overlay only affects on-screen text, so
  exported spreadsheets keep English headers. Changing that would require editing
  the minified bundle.
- **Project-card descriptions on the list page stay English** when long, because
  the app truncates them in code before rendering (the truncated fragment can't
  be matched to a full translation). The full description translates everywhere
  it is shown in full.
- This is a snapshot. If the upstream site ships a new build, this translation
  won't carry over automatically — the overlay dictionary would need updating
  (and the bundle filenames re-checked).

## Editing the translation

All Czech strings live in `i18n-cs.js` in the `DICT` object (exact-match) and the
`translateCore` rules (dynamic values). To change wording, edit the value there
and reload.

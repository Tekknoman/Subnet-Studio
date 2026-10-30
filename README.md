# Subnet Studio

Interactive IPv4 subnetting and address-reservation lab based on the OST campus exercise. Plain HTML, CSS and JavaScript; no framework, server or build step. Network data lives in `dist/ost-campus.json`.

## GitHub Pages deployments

| Environment | Source | Automatic trigger | Expected URL after enabling Pages |
|---|---|---|---|
| Development | Latest `dev` commit | Push to `dev` | https://tekknoman.github.io/Subnet-Studio/dev/ |
| Production | Latest PR merged into `prod` | PR merged into `prod` | https://tekknoman.github.io/Subnet-Studio/ |

GitHub Pages hosts one site per repository. The workflow assembles both environments into one artifact, then deploys them together. Updating dev does not promote dev code or unmerged/direct prod commits into production. Both branches are public, including the development URL.

### One-time GitHub setup

1. In **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
2. In **Settings → Environments → github-pages**, ensure deployment branch rules permit **dev** and **prod**. If a default rule permits only prod, add dev. Keep any desired reviewer policy, understanding that it will pause deployments for approval.
3. Open **Actions → Deploy dev and production to Pages → Run workflow**, selecting **prod**, to retry/bootstrap after the settings are ready. The manual trigger only republishes the latest eligible versions; it does not promote arbitrary prod commits.

No personal access token or repository secret is required. Workflow permissions provide read access during assembly and `pages: write` / `id-token: write` only in the deployment job. The GitHub connector used for setup cannot change Pages or environment settings, so these settings must be applied by the repository owner.

### Release process

- Commit/push changes to `dev`; development deploys automatically.
- Open a PR **from dev into prod**, review it, and merge it. Production deploys automatically. Merge commits, squash and rebase merges are supported.
- Until the first PR is merged into prod, the root URL displays a release-pending page linking to development. Initial source import is deliberately not treated as a production release.
- Closing a PR without merging does not deploy. Direct pushes to prod do not release, including on later dev deployments.
- Recommend protecting prod with a required PR rule. Such a rule is not installed by this setup.
- Use a revert PR merged into prod to roll back. Rerunning an old workflow deliberately resolves the latest eligible release instead of rolling production back.

Every publication resolves the latest dev head and the most recently merged prod PR's merge SHA, so queued deployments converge on current eligible versions. If either version fails tests, the combined deployment stops and the existing live site remains. As a single Pages artifact, the two URLs do not have independent availability/deployment histories. `deployment.json` records both source SHAs.

Do not force-rewrite/remove published merge commits or retarget historical merged PRs. The release selector uses merged PR history as its release record. `/dev/` is reserved and must not be present in production's own `dist` directory.

## Local use

```sh
npm test
python3 -m http.server 8080 --directory dist
```

Open http://localhost:8080. Serve over HTTP because the app loads its JSON via fetch.

- `dist/`: deployable app, network data, schema and format guide
- `test.mjs`: IPv4 and source-data checks
- `scripts/test-pages.mjs`: independent environment assembly checks
- `.github/workflows/pages.yml`: deployment automation

All application asset references are relative, so the same unchanged app works at the root project path and under `/dev/`. Uploads stay in the visitor's tab. See `dist/CONFIG.md` for custom plan format and documented course-solution corrections. This repository does not include the course PDFs or the ChatGPT Sites hosting configuration.

## Deployment components

Edit **`dist/app-config.json`**, separately from the network plan. Set a tab flag to `false` to hide it and skip its initialization:

```json
{
  "version": 1,
  "tabs": {
    "explore": true,
    "calculate": true,
    "practice": false,
    "guide": true
  },
  "components": {"importPlan": true, "exportPlan": true}
}
```

`practice` controls **Test your intuition**. All flags currently default to true; the example above demonstrates disabling practice. Omitted flags default to true. If Explore is disabled, the first enabled tab becomes the initial screen; the calculator still uses the loaded plan independently. Import/reset also fall back to an enabled tab. With all tabs disabled, a clear empty-state message appears. Invalid/missing configuration shows a warning and falls back to all components enabled, preserving app availability. These are presentation flags, not access controls.

Each deployed version uses the config committed with that version: a dev config change affects `/dev/` on push and reaches production when merged. Importing/exporting a network plan never changes these deployment settings.

Binary addresses in both the inspector and playground share one renderer: dotted 8-bit octets, two spaced 4-bit groups per octet, and decimal values below. Network/host colouring follows the exact prefix bit even within a group. On narrow screens the binary row scrolls horizontally to preserve readable bits.

## Visual network designer (version 2)

Open **05 Design a network**. Start a new root, copy the current example, or import JSON. Select a block in the tree or address map to inspect its children. Add/edit subnets, split a block into equal halves, and mark growth space as Reserved. Nest containers down to /32. Changing a container does not silently renumber children.

The timeline uses exact horizontal address positions and sizes. Overlapping siblings visibly intersect; hatched areas show the union-complement of child ranges (unassigned space). Zoom in or use the range list for tiny blocks. Out-of-parent spaces remain in the tree/list and generate diagnostics. The tree permits intentionally invalid draft layouts for teaching. Malformed JSON or CIDR syntax is rejected; semantic conflicts prevent validated export, but **Export draft** preserves work for later correction.

Drafts autosave to localStorage per deployment URL, including conflicts. Storage failure is reported; JSON export remains available. Undo/redo retains the last 50 editing actions in the current session. Refresh restores the latest saved draft, not undo history. Browser data clearing/private browsing can remove drafts. New/import/delete operations provide confirmations. Read-only mode disables space editing. Feature flags include `tabs.designer`.

Version 1 imports remain supported by the original explorer. The designer converts v1 to recursive v2: `roots[]` contain nodes with `id`, `name`, `cidr`, `status` (`container`, `active`, `reserved`) and `children[]`. Optional `requiredHosts`, `location`, provenance and other node metadata are retained. Growth envelopes become containers with active and reserved siblings. Institute slots remain reserved. v2 is app-specific and cannot be consumed by older v1-only deployments. Its exports can be imported into this designer, including through the main import button. Original explorer/calculator/practice behavior is preserved.

## Feature branch previews

Every push to `feat/**` republishes a combined artifact containing dev, the latest merged prod release, and **all current feature branches**. Preview URLs are listed at `/Subnet-Studio/features/`. Each branch gets a readable suffix plus a stable hash to prevent slug collisions. Existing previews are preserved on dev/prod deployments; deleted branches disappear after the next publication (branch deletion also triggers publication on the default branch).

Allow `dev`, `prod`, and `feat/*` in the `github-pages` environment. Nested feature names may require a matching additional rule. New feature branches must inherit the updated workflow (branch from updated dev). This is one Pages site: all included branches must pass tests before the combined artifact replaces the live site. A broken preview blocks that publication, leaving the last live artifact intact. All previews are public. Only trusted repository writers should push feature branches, since their test scripts run in Actions.

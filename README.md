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

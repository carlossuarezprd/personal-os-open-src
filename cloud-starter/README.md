# cloud-starter 🚀

Drop-in template that makes a **brand-new repo** behave the way you want in
Claude Code cloud sessions from the very first message — same personality,
same dev plugins, no manual setup.

## What's in here

| File | What it does | Scope it fixes |
|------|--------------|----------------|
| `CLAUDE.md` | Gen Z / brainrot tone + workflow rules (auto-commit, verify-before-hype, be straight) | Personality — normally does NOT travel between repos |
| `.claude/settings.json` | Enables official-marketplace plugins at session start: `typescript-lsp`, `commit-commands`, `pr-review-toolkit` | Plugins — normally do NOT travel between repos |

> Your **account skills** (find-skills, humanizer, xlsx, etc.) and built-in
> harness skills already follow you into every cloud session automatically —
> they're account-scoped, so this template doesn't need to touch them.

## How to use it

In a fresh/empty repo, copy both files to the repo root and commit them:

```bash
# from inside the new repo
cp -r /path/to/cloud-starter/CLAUDE.md .
cp -r /path/to/cloud-starter/.claude .
git add CLAUDE.md .claude/settings.json
git commit -m "Add Claude Code cloud starter (personality + dev plugins)"
git push
```

Next cloud session on that repo boots with the tone + plugins baked in. ✅

## Customizing the plugins

`.claude/settings.json` uses the `plugin-name@marketplace-name` format.

- **Official marketplace** (`claude-plugins-official`) plugins work with zero
  extra config — just add them to `enabledPlugins`.
- **Third-party marketplaces** (e.g. Superpowers) also need an
  `extraKnownMarketplaces` block pointing at the marketplace's GitHub repo. Run
  `/plugin marketplace list` on your desktop to get the exact `owner/repo`, then
  add:

  ```json
  {
    "extraKnownMarketplaces": {
      "superpowers-marketplace": {
        "source": { "source": "github", "repo": "OWNER/REPO" }
      }
    },
    "enabledPlugins": {
      "superpowers@superpowers-marketplace": true
    }
  }
  ```

## Heads up ⚠️

- Plugins that bundle **MCP servers needing secrets** (Stripe, Telegram, etc.)
  won't fully work in cloud until you set the API keys as **environment
  variables** on the cloud environment — there's no secrets store yet.
- The cloud environment needs **network access** ("Trusted" level is fine) to
  reach the marketplace source at session start.

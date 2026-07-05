# cloud-starter 🚀

Drop-in template that makes a **brand-new repo** behave the way you want in
Claude Code cloud sessions from the very first message — same personality,
same plugins, no manual setup.

## What's in here

| File | What it does | Scope it fixes |
|------|--------------|----------------|
| `CLAUDE.md` | Gen Z / brainrot tone + workflow rules (auto-commit, verify-before-hype, be straight) | Personality — normally does NOT travel between repos |
| `.claude/settings.json` | Enables your plugin roster at session start | Plugins — normally do NOT travel between repos |

> Your **account skills** (find-skills, humanizer, xlsx, skill-creator, etc.)
> and built-in harness skills already follow you into every cloud session
> automatically — they're account-scoped, so this template doesn't touch them.

## Plugins enabled

All from the **official Anthropic marketplace** (`claude-plugins-official`), so
no extra marketplace config is needed:

| Plugin | Notes |
|--------|-------|
| `superpowers` | Agentic skills framework (brainstorming, planning, TDD workflows) ✅ |
| `claude-md-management` | Helps manage CLAUDE.md files ✅ |
| `frontend-design` | Distinctive production-grade UI design ✅ |
| `typescript-lsp` | Real-time TS type errors + code navigation ✅ |
| `commit-commands` | Git commit / push / PR skills ✅ |
| `code-review` | Code review skills ✅ |
| `telegram` | ⚠️ Bundles an MCP server — needs a bot **API token** set as an env var on the cloud environment to actually work |
| `stripe` | ⚠️ Bundles an MCP server — needs a Stripe **API key** set as an env var to actually work |

### Not included: `claude-mem`

Your desktop `claude-mem` plugin is **not** in the official marketplace (it's
`thedotmack/claude-mem`) and it relies on a persistent local worker + on-disk
storage. Cloud sessions are ephemeral (the container is wiped after the
session), so its memory wouldn't persist across sessions anyway. Left it out on
purpose. Add it locally on your Mac where it belongs.

## How to use it

In a fresh/empty repo, copy both files to the repo root and commit them:

```bash
# from inside the new repo
cp /path/to/cloud-starter/CLAUDE.md .
cp -r /path/to/cloud-starter/.claude .
git add CLAUDE.md .claude/settings.json
git commit -m "Add Claude Code cloud starter (personality + plugins)"
git push
```

Next cloud session on that repo boots with the tone + plugins baked in. ✅

## Adding a third-party (non-official) plugin later

`.claude/settings.json` uses the `plugin-name@marketplace-name` format. For a
plugin outside the official marketplace, also declare its marketplace:

```json
{
  "extraKnownMarketplaces": {
    "some-marketplace": {
      "source": { "source": "github", "repo": "OWNER/REPO" }
    }
  },
  "enabledPlugins": {
    "some-plugin@some-marketplace": true
  }
}
```

Run `/plugin marketplace list` on your desktop to get the exact `owner/repo`.

## Heads up ⚠️

- Plugins that bundle **MCP servers needing secrets** (`stripe`, `telegram`)
  won't authenticate until you set the keys as **environment variables** on the
  cloud environment — there's no secrets store yet, and env vars are visible to
  anyone who can edit that environment.
- The cloud environment needs **network access** ("Trusted" level is fine) to
  reach the marketplace at session start.

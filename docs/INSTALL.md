# Install Relay

Relay version one is a plugin/skill package. It has no `relay` command-line
program: the skills read and write the protocol files directly.

The public repository is `https://github.com/fabianogoes/relay`.

For local development, replace `/absolute/path/to/relay` below with this
checkout's absolute path.

## Claude Code

Claude Code plugins discover skills under the plugin's `skills/` directory.
Test the checkout directly with:

```sh
git clone https://github.com/fabianogoes/relay.git
claude --plugin-dir ./relay
```

For a marketplace install, add the GitHub repository and install the `relay`
entry:

```text
/plugin marketplace add fabianogoes/relay
/plugin install relay@relay
```

Alternatively, expose the shared skills directly in a target project:

```sh
mkdir -p .claude
ln -s /absolute/path/to/relay/skills .claude/skills
```

The package metadata is `.claude-plugin/plugin.json`. Once Relay has a public
GitHub repository and marketplace entry, this section will add the equivalent
remote installation command.

## Codex

The Codex plugin manifest is `.codex-plugin/plugin.json`, and it exposes the
canonical `./skills/` directory. Install the local checkout through the Codex
plugin development flow, or link the skills for repository-scoped development:

```sh
mkdir -p .agents
ln -s /absolute/path/to/relay/skills .agents/skills
```

In Codex, open Plugins, choose the GitHub-imported `relay` marketplace, review
the listed skills, and select Install. The repository includes the Codex
catalog at `.agents/plugins/marketplace.json` for workspace import.

## OpenCode

OpenCode recognizes Agent Skills from `.opencode/skills/`, `.claude/skills/`,
and `.agents/skills/`. For local development:

```sh
mkdir -p .opencode
ln -s /absolute/path/to/relay/skills .opencode/skills
```

See [.opencode/INSTALL.md](../.opencode/INSTALL.md) for the adapter notes. The
OpenCode installation remains a native Agent Skills discovery link; no custom
runtime is installed.

## Updating

Relay uses one shared `skills/` directory. Refresh the checkout or installed
plugin, then start a new harness session so its skill registry is reloaded.

# OpenCode Adapter

The canonical Relay skills live in the repository's `skills/` directory.
OpenCode recognizes Agent Skills from `.opencode/skills/`, `.claude/skills/`,
and `.agents/skills/`, in addition to its global skill directories.

For a GitHub installation, tell OpenCode to fetch and follow this document:

```text
Fetch and follow instructions from https://raw.githubusercontent.com/fabianogoes/relay/main/.opencode/INSTALL.md
```

The remote checkout is:

```sh
git clone https://github.com/fabianogoes/relay.git
```

For local development, create a symbolic link from one of those discovery
paths to this repository's `skills/` directory. For example, from a target
project:

```sh
mkdir -p .opencode
ln -s /absolute/path/to/relay/skills .opencode/skills
```

For an installed release, use the same layout with the release's local path.
Relay intentionally relies on OpenCode's native skill discovery rather than a
custom UI or a background service.

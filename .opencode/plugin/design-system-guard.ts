import type { Plugin } from "@opencode-ai/plugin"

/**
 * Blocks agent reads of the design system's HTML files in OpenCode.
 *
 * The rule itself lives in `.agents/hooks/deny-design-system-html.sh`, shared
 * with the Claude Code `PreToolUse` hook in `.claude/settings.json`. This file
 * is only the OpenCode shell around it: one rule, several harnesses.
 *
 * This is a development tool for the Relay repository. It is not part of the
 * Relay package and is not installed by anyone using Relay.
 */

const GUARD = ".agents/hooks/deny-design-system-html.sh"

/** Tools whose arguments name a file to read. */
const PATH_TOOLS = new Set(["read", "grep", "glob"])

/** Tools that run a shell command, where the path is embedded in a string. */
const COMMAND_TOOLS = new Set(["bash"])

// Not "pattern": a grep pattern is a regex, and searching for the literal
// path string is a legitimate thing to do.
const PATH_KEYS = ["filePath", "file_path", "path", "glob"] as const

export const DesignSystemGuard: Plugin = async ({ directory, $ }) => {
  const guard = `${directory}/${GUARD}`

  const deny = async (args: string[]) => {
    const result = await $`sh ${guard} ${args}`.nothrow().quiet()
    if (result.exitCode === 0) return
    throw new Error(result.stderr.toString().trim() || "Blocked by the Relay design-system guard.")
  }

  return {
    "tool.execute.before": async (input, output) => {
      const args = (output.args ?? {}) as Record<string, unknown>

      if (PATH_TOOLS.has(input.tool)) {
        const paths = PATH_KEYS.map((key) => args[key]).filter(
          (value): value is string => typeof value === "string" && value.length > 0,
        )
        if (paths.length > 0) await deny(paths)
        return
      }

      if (COMMAND_TOOLS.has(input.tool)) {
        const command = args.command
        if (typeof command === "string" && command.length > 0) {
          await deny(["--command", command])
        }
      }
    },
  }
}

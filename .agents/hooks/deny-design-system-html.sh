#!/bin/sh
# Deny agent reads of the design system's HTML files.
#
# The prototypes are ~350 KB each and design-system.html only restates the
# README's tokens in CSS. Nothing in them is unrecorded: what was decided is in
# docs/adr/0001-arquitetura-inicial-da-ui.md, what was merely observed is in
# the folder's ui-proposal.md, and the tokens are in its README.md. They are
# browser artifacts, not agent input.
#
# One rule, several harness shells. Usage:
#
#   deny-design-system-html.sh <path>...       exit 1 if any path is blocked
#   deny-design-system-html.sh --command <cmd>  exit 1 if <cmd> dumps one
#   deny-design-system-html.sh --reason         print the operator-facing message
#   deny-design-system-html.sh --claude-hook
#       read a Claude Code PreToolUse payload on stdin and, when it targets a
#       blocked path, emit the deny decision on stdout (always exits 0)

set -eu

GUARDED_DIR='docs/design-system'

REASON="$GUARDED_DIR/*.html is not readable by an agent: the prototypes are ~350 KB each and design-system.html only restates the README tokens in CSS. Read $GUARDED_DIR/README.md for the tokens, docs/adr/0001-arquitetura-inicial-da-ui.md for what was decided, and $GUARDED_DIR/ui-proposal.md for what was merely observed. Open the HTML in a browser instead."

# A path is blocked when it lands on an .html file inside the guarded folder.
# Anchored at the end: the folder's .md files stay freely readable.
is_blocked_path() {
	case "$1" in
	*"$GUARDED_DIR"/*.html | *"$GUARDED_DIR"/*.HTML) return 0 ;;
	*) return 1 ;;
	esac
}

# A shell command is blocked only when it dumps a guarded file to stdout.
#
# Deliberately narrow. Merely naming the path is not a read: writing a document
# that documents this rule, grepping for stale links, or listing the folder all
# have to keep working. So the command must start with a dumper and must not
# redirect, which is what separates `cat <file>` from `cat > <file>`.
is_blocked_command() {
	case "$1" in
	*">"*) return 1 ;;
	esac
	case "$1" in
	*"$GUARDED_DIR"/*.html* | *"$GUARDED_DIR"/*.HTML*) ;;
	*) return 1 ;;
	esac
	case "$1" in
	cat\ * | head\ * | tail\ * | less\ * | more\ * | bat\ * | nl\ * | strings\ *) return 0 ;;
	*) return 1 ;;
	esac
}

# Pull the path-bearing fields out of a PreToolUse payload. jq when available,
# a sed fallback otherwise, so the guard never depends on an optional binary.
extract_paths() {
	if command -v jq >/dev/null 2>&1; then
		jq -r '[.tool_input.file_path, .tool_input.path, .tool_input.glob] | .[] | select(type == "string")' 2>/dev/null
	else
		# One -e per key: BRE alternation (\|) is a GNU extension, and BSD sed
		# would silently match nothing.
		sed -n \
			-e 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' \
			-e 's/.*"path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' \
			-e 's/.*"glob"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p'
	fi
}

extract_command() {
	if command -v jq >/dev/null 2>&1; then
		jq -r '.tool_input.command // empty' 2>/dev/null
	else
		sed -n 's/.*"command"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p'
	fi
}

deny_json() {
	printf '%s' "$REASON" | jq -R -s '{
		hookSpecificOutput: {
			hookEventName: "PreToolUse",
			permissionDecision: "deny",
			permissionDecisionReason: .
		}
	}' 2>/dev/null && return 0
	printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"The design system HTML is not readable by an agent. Read its README.md instead."}}'
}

case "${1-}" in
--reason)
	printf '%s\n' "$REASON"
	;;
--command)
	if [ "$#" -ge 2 ] && is_blocked_command "$2"; then
		printf '%s\n' "$REASON" >&2
		exit 1
	fi
	;;
--claude-hook)
	payload=$(cat)
	blocked=0
	# Word splitting here is wanted: one candidate path per field.
	# shellcheck disable=SC2013
	for candidate in $(printf '%s' "$payload" | extract_paths); do
		if is_blocked_path "$candidate"; then
			blocked=1
			break
		fi
	done
	if [ "$blocked" -eq 0 ]; then
		shell_command=$(printf '%s' "$payload" | extract_command)
		if [ -n "$shell_command" ] && is_blocked_command "$shell_command"; then
			blocked=1
		fi
	fi
	[ "$blocked" -eq 1 ] && deny_json
	exit 0
	;;
'')
	echo "usage: $(basename "$0") <path>... | --command <cmd> | --reason | --claude-hook" >&2
	exit 2
	;;
*)
	for candidate in "$@"; do
		if is_blocked_path "$candidate"; then
			printf '%s\n' "$REASON" >&2
			exit 1
		fi
	done
	;;
esac

#!/usr/bin/env bash
# Bash completion for agentic-payments CLI

_agentic_payments_completions() {
    local cur prev commands
    COMPREPLY=()
    cur="${COMP_WORDS[COMP_CWORD]}"
    prev="${COMP_WORDS[COMP_CWORD-1]}"
    commands="generate-key verify-signature create-mandate checkout webhook-verify"

    case "${prev}" in
        agentic-payments)
            COMPREPLY=( $(compgen -W "${commands}" -- ${cur}) )
            return 0
            ;;
        *)
            ;;
    esac
}

complete -F _agentic_payments_completions agentic-payments
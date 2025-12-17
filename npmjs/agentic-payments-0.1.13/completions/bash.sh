#!/usr/bin/env bash
# Bash completion script for agentic-payments

_agentic_payments_completion() {
    local cur prev opts base
    COMPREPLY=()
    cur="${COMP_WORDS[COMP_CWORD]}"
    prev="${COMP_WORDS[COMP_CWORD-1]}"

    # Root command options
    opts="generate gen verify mandate system sys completion --help --version --debug --no-color"

    # Handle subcommands
    case "${COMP_CWORD}" in
        1)
            COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
            return 0
            ;;
        *)
            case "${COMP_WORDS[1]}" in
                generate|gen)
                    case "${prev}" in
                        --format|-f)
                            COMPREPLY=( $(compgen -W "json hex pem" -- ${cur}) )
                            return 0
                            ;;
                        --output|-o)
                            COMPREPLY=( $(compgen -f -- ${cur}) )
                            return 0
                            ;;
                        *)
                            opts="--format --output --seed --help"
                            COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
                            return 0
                            ;;
                    esac
                    ;;
                verify)
                    case "${prev}" in
                        --format|-f)
                            COMPREPLY=( $(compgen -W "json hex pem" -- ${cur}) )
                            return 0
                            ;;
                        --data|-d)
                            COMPREPLY=( $(compgen -f -- ${cur}) )
                            return 0
                            ;;
                        --currency|-c)
                            COMPREPLY=( $(compgen -W "USD EUR GBP JPY AUD CAD CHF CNY" -- ${cur}) )
                            return 0
                            ;;
                        *)
                            opts="--amount --currency --agents --threshold --data --verbose --byzantine --help"
                            COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
                            return 0
                            ;;
                    esac
                    ;;
                mandate)
                    case "${COMP_CWORD}" in
                        2)
                            COMPREPLY=( $(compgen -W "create validate sign --help" -- ${cur}) )
                            return 0
                            ;;
                        *)
                            case "${COMP_WORDS[2]}" in
                                create)
                                    case "${COMP_CWORD}" in
                                        3)
                                            COMPREPLY=( $(compgen -W "intent cart payment" -- ${cur}) )
                                            return 0
                                            ;;
                                        *)
                                            case "${prev}" in
                                                --file|-f|--output|-o)
                                                    COMPREPLY=( $(compgen -f -- ${cur}) )
                                                    return 0
                                                    ;;
                                                *)
                                                    opts="--data --file --output --help"
                                                    COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
                                                    return 0
                                                    ;;
                                            esac
                                            ;;
                                    esac
                                    ;;
                                validate|sign)
                                    case "${prev}" in
                                        --file|-f|--output|-o)
                                            COMPREPLY=( $(compgen -f -- ${cur}) )
                                            return 0
                                            ;;
                                        *)
                                            opts="--file --data --key --output --help"
                                            COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
                                            return 0
                                            ;;
                                    esac
                                    ;;
                            esac
                            ;;
                    esac
                    ;;
                system|sys)
                    case "${COMP_CWORD}" in
                        2)
                            COMPREPLY=( $(compgen -W "start stop status metrics --help" -- ${cur}) )
                            return 0
                            ;;
                        *)
                            case "${COMP_WORDS[2]}" in
                                start)
                                    opts="--agents --port --daemon --help"
                                    COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
                                    return 0
                                    ;;
                                stop)
                                    opts="--force --help"
                                    COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
                                    return 0
                                    ;;
                                status)
                                    opts="--watch --help"
                                    COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
                                    return 0
                                    ;;
                                metrics)
                                    case "${prev}" in
                                        --format|-f)
                                            COMPREPLY=( $(compgen -W "table json prometheus" -- ${cur}) )
                                            return 0
                                            ;;
                                        *)
                                            opts="--format --help"
                                            COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
                                            return 0
                                            ;;
                                    esac
                                    ;;
                            esac
                            ;;
                    esac
                    ;;
                completion)
                    case "${COMP_CWORD}" in
                        2)
                            COMPREPLY=( $(compgen -W "install uninstall generate --help" -- ${cur}) )
                            return 0
                            ;;
                        *)
                            case "${COMP_WORDS[2]}" in
                                install|uninstall)
                                    case "${prev}" in
                                        --shell|-s)
                                            COMPREPLY=( $(compgen -W "bash zsh fish" -- ${cur}) )
                                            return 0
                                            ;;
                                        *)
                                            opts="--shell --dry-run --help"
                                            COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
                                            return 0
                                            ;;
                                    esac
                                    ;;
                                generate)
                                    if [[ ${COMP_CWORD} -eq 3 ]]; then
                                        COMPREPLY=( $(compgen -W "bash zsh fish" -- ${cur}) )
                                        return 0
                                    fi
                                    ;;
                            esac
                            ;;
                    esac
                    ;;
            esac
            ;;
    esac
}

# Register completion function
complete -F _agentic_payments_completion agentic-payments
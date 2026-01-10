#compdef agentic-payments
# Zsh completion script for agentic-payments

_agentic_payments() {
    local -a commands
    local -a generate_opts verify_opts mandate_cmds system_cmds completion_cmds

    commands=(
        'generate:Generate a new agent identity with cryptographic keys'
        'gen:Alias for generate'
        'verify:Verify a payment using multi-agent consensus'
        'mandate:Create, validate, and sign payment mandates'
        'system:System management and monitoring'
        'sys:Alias for system'
        'completion:Manage shell completions'
    )

    generate_opts=(
        '--format[Output format]:format:(json hex pem)'
        '--output[Write to file]:file:_files'
        '--seed[Seed for deterministic generation]:seed:'
        '--help[Display help]'
    )

    verify_opts=(
        '--amount[Payment amount]:amount:'
        '--currency[Currency code]:currency:(USD EUR GBP JPY AUD CAD CHF CNY)'
        '--agents[Number of agents]:count:'
        '--threshold[Consensus threshold]:threshold:'
        '--data[Load from file]:file:_files'
        '--verbose[Show individual agent votes]'
        '--byzantine[Enable Byzantine fault tolerance]'
        '--help[Display help]'
    )

    mandate_cmds=(
        'create:Create a new mandate'
        'validate:Validate a mandate'
        'sign:Sign a mandate with agent credentials'
    )

    system_cmds=(
        'start:Start the Agentic Payments system'
        'stop:Stop the Agentic Payments system'
        'status:Display system status and health'
        'metrics:Display detailed performance metrics'
    )

    completion_cmds=(
        'install:Install shell completions'
        'uninstall:Remove shell completions'
        'generate:Generate completion script'
    )

    _arguments -C \
        '(--help -h)'{--help,-h}'[Display help]' \
        '(--version -v)'{--version,-v}'[Display version]' \
        '--debug[Enable debug output]' \
        '--no-color[Disable colored output]' \
        '1: :->command' \
        '*::arg:->args'

    case $state in
        command)
            _describe 'command' commands
            ;;
        args)
            case $words[1] in
                generate|gen)
                    _arguments $generate_opts
                    ;;
                verify)
                    _arguments $verify_opts
                    ;;
                mandate)
                    case $CURRENT in
                        2)
                            _describe 'mandate command' mandate_cmds
                            ;;
                        *)
                            case $words[2] in
                                create)
                                    case $CURRENT in
                                        3)
                                            _values 'mandate type' 'intent' 'cart' 'payment'
                                            ;;
                                        *)
                                            _arguments \
                                                '--data[Mandate data]:json:' \
                                                '--file[Load from file]:file:_files' \
                                                '--output[Save to file]:file:_files' \
                                                '--help[Display help]'
                                            ;;
                                    esac
                                    ;;
                                validate)
                                    _arguments \
                                        '--file[Mandate file]:file:_files' \
                                        '--data[Mandate data]:json:' \
                                        '--help[Display help]'
                                    ;;
                                sign)
                                    _arguments \
                                        '--file[Mandate file]:file:_files' \
                                        '--key[Private key]:hex:' \
                                        '--output[Save to file]:file:_files' \
                                        '--help[Display help]'
                                    ;;
                            esac
                            ;;
                    esac
                    ;;
                system|sys)
                    case $CURRENT in
                        2)
                            _describe 'system command' system_cmds
                            ;;
                        *)
                            case $words[2] in
                                start)
                                    _arguments \
                                        '--agents[Number of agents]:count:' \
                                        '--port[API port]:port:' \
                                        '--daemon[Run as daemon]' \
                                        '--help[Display help]'
                                    ;;
                                stop)
                                    _arguments \
                                        '--force[Force stop]' \
                                        '--help[Display help]'
                                    ;;
                                status)
                                    _arguments \
                                        '--watch[Watch mode]' \
                                        '--help[Display help]'
                                    ;;
                                metrics)
                                    _arguments \
                                        '--format[Output format]:format:(table json prometheus)' \
                                        '--help[Display help]'
                                    ;;
                            esac
                            ;;
                    esac
                    ;;
                completion)
                    case $CURRENT in
                        2)
                            _describe 'completion command' completion_cmds
                            ;;
                        *)
                            case $words[2] in
                                install|uninstall)
                                    _arguments \
                                        '--shell[Target shell]:shell:(bash zsh fish)' \
                                        '--dry-run[Show without changes]' \
                                        '--help[Display help]'
                                    ;;
                                generate)
                                    case $CURRENT in
                                        3)
                                            _values 'shell' 'bash' 'zsh' 'fish'
                                            ;;
                                    esac
                                    ;;
                            esac
                            ;;
                    esac
                    ;;
            esac
            ;;
    esac
}

_agentic_payments "$@"
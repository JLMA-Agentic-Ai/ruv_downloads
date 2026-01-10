# Fish completion script for agentic-payments

# Disable file completion by default
complete -c agentic-payments -f

# Root commands
complete -c agentic-payments -n "__fish_use_subcommand" -a "generate" -d "Generate agent identity"
complete -c agentic-payments -n "__fish_use_subcommand" -a "gen" -d "Alias for generate"
complete -c agentic-payments -n "__fish_use_subcommand" -a "verify" -d "Verify payment with consensus"
complete -c agentic-payments -n "__fish_use_subcommand" -a "mandate" -d "Manage payment mandates"
complete -c agentic-payments -n "__fish_use_subcommand" -a "system" -d "System management"
complete -c agentic-payments -n "__fish_use_subcommand" -a "sys" -d "Alias for system"
complete -c agentic-payments -n "__fish_use_subcommand" -a "completion" -d "Shell completions"

# Global options
complete -c agentic-payments -l help -d "Display help"
complete -c agentic-payments -s h -d "Display help"
complete -c agentic-payments -l version -d "Display version"
complete -c agentic-payments -s v -d "Display version"
complete -c agentic-payments -l debug -d "Enable debug output"
complete -c agentic-payments -l no-color -d "Disable colored output"

# Generate command
complete -c agentic-payments -n "__fish_seen_subcommand_from generate gen" -l format -d "Output format" -a "json hex pem"
complete -c agentic-payments -n "__fish_seen_subcommand_from generate gen" -s f -d "Output format" -a "json hex pem"
complete -c agentic-payments -n "__fish_seen_subcommand_from generate gen" -l output -d "Output file" -r
complete -c agentic-payments -n "__fish_seen_subcommand_from generate gen" -s o -d "Output file" -r
complete -c agentic-payments -n "__fish_seen_subcommand_from generate gen" -l seed -d "Generation seed"
complete -c agentic-payments -n "__fish_seen_subcommand_from generate gen" -l help -d "Display help"

# Verify command
complete -c agentic-payments -n "__fish_seen_subcommand_from verify" -l amount -d "Payment amount"
complete -c agentic-payments -n "__fish_seen_subcommand_from verify" -s a -d "Payment amount"
complete -c agentic-payments -n "__fish_seen_subcommand_from verify" -l currency -d "Currency code" -a "USD EUR GBP JPY AUD CAD CHF CNY"
complete -c agentic-payments -n "__fish_seen_subcommand_from verify" -s c -d "Currency code" -a "USD EUR GBP JPY AUD CAD CHF CNY"
complete -c agentic-payments -n "__fish_seen_subcommand_from verify" -l agents -d "Number of agents"
complete -c agentic-payments -n "__fish_seen_subcommand_from verify" -s n -d "Number of agents"
complete -c agentic-payments -n "__fish_seen_subcommand_from verify" -l threshold -d "Consensus threshold"
complete -c agentic-payments -n "__fish_seen_subcommand_from verify" -s t -d "Consensus threshold"
complete -c agentic-payments -n "__fish_seen_subcommand_from verify" -l data -d "Data file" -r
complete -c agentic-payments -n "__fish_seen_subcommand_from verify" -s d -d "Data file" -r
complete -c agentic-payments -n "__fish_seen_subcommand_from verify" -l verbose -d "Show agent votes"
complete -c agentic-payments -n "__fish_seen_subcommand_from verify" -s v -d "Show agent votes"
complete -c agentic-payments -n "__fish_seen_subcommand_from verify" -l byzantine -d "Byzantine fault tolerance"
complete -c agentic-payments -n "__fish_seen_subcommand_from verify" -l help -d "Display help"

# Mandate command
complete -c agentic-payments -n "__fish_seen_subcommand_from mandate; and not __fish_seen_subcommand_from create validate sign" -a "create" -d "Create mandate"
complete -c agentic-payments -n "__fish_seen_subcommand_from mandate; and not __fish_seen_subcommand_from create validate sign" -a "validate" -d "Validate mandate"
complete -c agentic-payments -n "__fish_seen_subcommand_from mandate; and not __fish_seen_subcommand_from create validate sign" -a "sign" -d "Sign mandate"

# Mandate create
complete -c agentic-payments -n "__fish_seen_subcommand_from mandate; and __fish_seen_subcommand_from create" -a "intent cart payment" -d "Mandate type"
complete -c agentic-payments -n "__fish_seen_subcommand_from mandate; and __fish_seen_subcommand_from create" -l data -d "Mandate data"
complete -c agentic-payments -n "__fish_seen_subcommand_from mandate; and __fish_seen_subcommand_from create" -s d -d "Mandate data"
complete -c agentic-payments -n "__fish_seen_subcommand_from mandate; and __fish_seen_subcommand_from create" -l file -d "Data file" -r
complete -c agentic-payments -n "__fish_seen_subcommand_from mandate; and __fish_seen_subcommand_from create" -s f -d "Data file" -r
complete -c agentic-payments -n "__fish_seen_subcommand_from mandate; and __fish_seen_subcommand_from create" -l output -d "Output file" -r
complete -c agentic-payments -n "__fish_seen_subcommand_from mandate; and __fish_seen_subcommand_from create" -s o -d "Output file" -r

# Mandate validate
complete -c agentic-payments -n "__fish_seen_subcommand_from mandate; and __fish_seen_subcommand_from validate" -l file -d "Mandate file" -r
complete -c agentic-payments -n "__fish_seen_subcommand_from mandate; and __fish_seen_subcommand_from validate" -s f -d "Mandate file" -r
complete -c agentic-payments -n "__fish_seen_subcommand_from mandate; and __fish_seen_subcommand_from validate" -l data -d "Mandate data"
complete -c agentic-payments -n "__fish_seen_subcommand_from mandate; and __fish_seen_subcommand_from validate" -s d -d "Mandate data"

# Mandate sign
complete -c agentic-payments -n "__fish_seen_subcommand_from mandate; and __fish_seen_subcommand_from sign" -l file -d "Mandate file" -r
complete -c agentic-payments -n "__fish_seen_subcommand_from mandate; and __fish_seen_subcommand_from sign" -s f -d "Mandate file" -r
complete -c agentic-payments -n "__fish_seen_subcommand_from mandate; and __fish_seen_subcommand_from sign" -l key -d "Private key"
complete -c agentic-payments -n "__fish_seen_subcommand_from mandate; and __fish_seen_subcommand_from sign" -s k -d "Private key"
complete -c agentic-payments -n "__fish_seen_subcommand_from mandate; and __fish_seen_subcommand_from sign" -l output -d "Output file" -r
complete -c agentic-payments -n "__fish_seen_subcommand_from mandate; and __fish_seen_subcommand_from sign" -s o -d "Output file" -r

# System command
complete -c agentic-payments -n "__fish_seen_subcommand_from system sys; and not __fish_seen_subcommand_from start stop status metrics" -a "start" -d "Start system"
complete -c agentic-payments -n "__fish_seen_subcommand_from system sys; and not __fish_seen_subcommand_from start stop status metrics" -a "stop" -d "Stop system"
complete -c agentic-payments -n "__fish_seen_subcommand_from system sys; and not __fish_seen_subcommand_from start stop status metrics" -a "status" -d "Show status"
complete -c agentic-payments -n "__fish_seen_subcommand_from system sys; and not __fish_seen_subcommand_from start stop status metrics" -a "metrics" -d "Show metrics"

# System start
complete -c agentic-payments -n "__fish_seen_subcommand_from system sys; and __fish_seen_subcommand_from start" -l agents -d "Number of agents"
complete -c agentic-payments -n "__fish_seen_subcommand_from system sys; and __fish_seen_subcommand_from start" -s a -d "Number of agents"
complete -c agentic-payments -n "__fish_seen_subcommand_from system sys; and __fish_seen_subcommand_from start" -l port -d "API port"
complete -c agentic-payments -n "__fish_seen_subcommand_from system sys; and __fish_seen_subcommand_from start" -s p -d "API port"
complete -c agentic-payments -n "__fish_seen_subcommand_from system sys; and __fish_seen_subcommand_from start" -l daemon -d "Run as daemon"

# System stop
complete -c agentic-payments -n "__fish_seen_subcommand_from system sys; and __fish_seen_subcommand_from stop" -l force -d "Force stop"

# System status
complete -c agentic-payments -n "__fish_seen_subcommand_from system sys; and __fish_seen_subcommand_from status" -l watch -d "Watch mode"
complete -c agentic-payments -n "__fish_seen_subcommand_from system sys; and __fish_seen_subcommand_from status" -s w -d "Watch mode"

# System metrics
complete -c agentic-payments -n "__fish_seen_subcommand_from system sys; and __fish_seen_subcommand_from metrics" -l format -d "Output format" -a "table json prometheus"
complete -c agentic-payments -n "__fish_seen_subcommand_from system sys; and __fish_seen_subcommand_from metrics" -s f -d "Output format" -a "table json prometheus"

# Completion command
complete -c agentic-payments -n "__fish_seen_subcommand_from completion; and not __fish_seen_subcommand_from install uninstall generate" -a "install" -d "Install completions"
complete -c agentic-payments -n "__fish_seen_subcommand_from completion; and not __fish_seen_subcommand_from install uninstall generate" -a "uninstall" -d "Remove completions"
complete -c agentic-payments -n "__fish_seen_subcommand_from completion; and not __fish_seen_subcommand_from install uninstall generate" -a "generate" -d "Generate completion script"

# Completion install/uninstall
complete -c agentic-payments -n "__fish_seen_subcommand_from completion; and __fish_seen_subcommand_from install uninstall" -l shell -d "Target shell" -a "bash zsh fish"
complete -c agentic-payments -n "__fish_seen_subcommand_from completion; and __fish_seen_subcommand_from install uninstall" -s s -d "Target shell" -a "bash zsh fish"
complete -c agentic-payments -n "__fish_seen_subcommand_from completion; and __fish_seen_subcommand_from install" -l dry-run -d "Show without changes"

# Completion generate
complete -c agentic-payments -n "__fish_seen_subcommand_from completion; and __fish_seen_subcommand_from generate" -a "bash zsh fish" -d "Shell type"
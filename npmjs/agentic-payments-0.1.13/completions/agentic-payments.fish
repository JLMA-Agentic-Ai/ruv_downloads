# Fish completion for agentic-payments CLI

complete -c agentic-payments -f

complete -c agentic-payments -n "__fish_use_subcommand" -a generate-key -d "Generate new Ed25519 keypair"
complete -c agentic-payments -n "__fish_use_subcommand" -a verify-signature -d "Verify Ed25519 signature"
complete -c agentic-payments -n "__fish_use_subcommand" -a create-mandate -d "Create AP2 intent mandate"
complete -c agentic-payments -n "__fish_use_subcommand" -a checkout -d "Create ACP checkout session"
complete -c agentic-payments -n "__fish_use_subcommand" -a webhook-verify -d "Verify ACP webhook signature"
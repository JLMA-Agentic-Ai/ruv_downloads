#compdef agentic-payments
# Zsh completion for agentic-payments CLI

_agentic_payments() {
    local -a commands
    commands=(
        'generate-key:Generate new Ed25519 keypair'
        'verify-signature:Verify Ed25519 signature'
        'create-mandate:Create AP2 intent mandate'
        'checkout:Create ACP checkout session'
        'webhook-verify:Verify ACP webhook signature'
    )

    _describe 'command' commands
}

_agentic_payments "$@"
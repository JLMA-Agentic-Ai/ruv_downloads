# Redefining the MoELayer with a corrected forward method
class MoELayer(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim, num_experts):
        super(MoELayer, self).__init__()
        self.experts = nn.ModuleList([Expert(input_dim, hidden_dim, output_dim) for _ in range(num_experts)])
        self.gate = GatingNetwork(input_dim, num_experts)

    def forward(self, x):
        gating_scores = self.gate(x)  # Shape: [batch_size, num_tokens, num_experts]
        expert_outputs = torch.stack([expert(x) for expert in self.experts], dim=1)  # Shape: [batch_size, num_experts, num_tokens, output_dim]
        
        # We need to transpose expert_outputs to match the dimensions of gating_scores for einsum
        expert_outputs = expert_outputs.transpose(1, 2)  # Shape: [batch_size, num_tokens, num_experts, output_dim]

        # The corrected einsum operation
        # bteo -> b is batch size, t is number of tokens, e is number of experts, o is output dimension
        # We sum over the experts dimension
        output = torch.einsum('bte,bteo->bto', gating_scores, expert_outputs)
        return output

# Redefining the TransformerWithMoE with the corrected MoELayer
class TransformerWithMoE(nn.Module):
    def __init__(self, num_layers, dim, head_dim, hidden_dim, n_heads, num_experts, vocab_size):
        super(TransformerWithMoE, self).__init__()
        self.embedding = nn.Embedding(vocab_size, dim)
        self.layers = nn.ModuleList([nn.TransformerEncoderLayer(d_model=dim, nhead=n_heads) for _ in range(num_layers)])
        self.moe_layer = MoELayer(dim, hidden_dim, dim, num_experts)
        self.output_layer = nn.Linear(dim, vocab_size)

    def forward(self, x):
        x = self.embedding(x)
        for layer in self.layers:
            x = layer(x)
        x = self.moe_layer(x)
        logits = self.output_layer(x)
        return logits

# Initialize the corrected model
corrected_model = TransformerWithMoE(
    num_layers=2,               # Just 2 layers for testing
    dim=16,                     # Small dimension for the model
    head_dim=4,                 # Small head dimension
    hidden_dim=32,              # Small hidden dimension
    n_heads=2,                  # Only 2 heads
    num_experts=2,              # Only 2 experts
    vocab_size=100,             # Small vocabulary size
)

# Run the dummy data through the corrected model
corrected_output = corrected_model(dummy_input)

# Print the output shape to verify the forward pass
corrected_output.shape
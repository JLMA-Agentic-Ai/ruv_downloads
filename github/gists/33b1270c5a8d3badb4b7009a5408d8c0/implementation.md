Basic PyTorch implementation of Llama 3.2:

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class RMSNorm(nn.Module):
    def __init__(self, dim, eps=1e-6):
        super().__init__()
        self.eps = eps
        self.weight = nn.Parameter(torch.ones(dim))

    def forward(self, x):
        norm = torch.mean(x * x, dim=-1, keepdim=True)
        return x * torch.rsqrt(norm + self.eps) * self.weight

class RotaryEmbedding(nn.Module):
    def __init__(self, dim, max_position_embeddings=2048, base=10000):
        super().__init__()
        inv_freq = 1.0 / (base ** (torch.arange(0, dim, 2).float() / dim))
        self.register_buffer("inv_freq", inv_freq)
        self.max_seq_len_cached = max_position_embeddings
        t = torch.arange(self.max_seq_len_cached, dtype=self.inv_freq.dtype)
        freqs = torch.einsum("i,j->ij", t, self.inv_freq)
        emb = torch.cat((freqs, freqs), dim=-1)
        self.register_buffer("cos_cached", emb.cos()[None, None, :, :])
        self.register_buffer("sin_cached", emb.sin()[None, None, :, :])

    def forward(self, x, seq_len=None):
        if seq_len > self.max_seq_len_cached:
            self._set_cos_sin_cache(seq_len)
        return (
            self.cos_cached[:, :, :seq_len, ...],
            self.sin_cached[:, :, :seq_len, ...],
        )

class FeedForward(nn.Module):
    def __init__(self, dim, hidden_dim, multiple_of=256):
        super().__init__()
        hidden_dim = int(2 * hidden_dim / 3)
        hidden_dim = multiple_of * ((hidden_dim + multiple_of - 1) // multiple_of)
        self.w1 = nn.Linear(dim, hidden_dim, bias=False)
        self.w2 = nn.Linear(hidden_dim, dim, bias=False)
        self.w3 = nn.Linear(dim, hidden_dim, bias=False)

    def forward(self, x):
        return self.w2(F.silu(self.w1(x)) * self.w3(x))

class Attention(nn.Module):
    def __init__(self, dim, num_heads=8, head_dim=64, bias=False):
        super().__init__()
        self.num_heads = num_heads
        self.head_dim = head_dim
        self.wq = nn.Linear(dim, num_heads * head_dim, bias=bias)
        self.wk = nn.Linear(dim, num_heads * head_dim, bias=bias)
        self.wv = nn.Linear(dim, num_heads * head_dim, bias=bias)
        self.wo = nn.Linear(num_heads * head_dim, dim, bias=bias)
        self.rotary_emb = RotaryEmbedding(head_dim)

    def forward(self, x, mask=None):
        b, t, c = x.size()
        q, k, v = self.wq(x), self.wk(x), self.wv(x)
        q = q.view(b, t, self.num_heads, self.head_dim).transpose(1, 2)
        k = k.view(b, t, self.num_heads, self.head_dim).transpose(1, 2)
        v = v.view(b, t, self.num_heads, self.head_dim).transpose(1, 2)

        cos, sin = self.rotary_emb(q, seq_len=t)
        q, k = apply_rotary_pos_emb(q, k, cos, sin)

        att = (q @ k.transpose(-2, -1)) * (1.0 / math.sqrt(k.size(-1)))
        if mask is not None:
            att = att.masked_fill(mask == 0, float('-inf'))
        att = F.softmax(att, dim=-1)
        y = att @ v

        y = y.transpose(1, 2).contiguous().view(b, t, c)
        return self.wo(y)

class TransformerBlock(nn.Module):
    def __init__(self, dim, num_heads, ffn_dim, norm_eps):
        super().__init__()
        self.attention = Attention(dim, num_heads)
        self.feed_forward = FeedForward(dim, ffn_dim)
        self.attention_norm = RMSNorm(dim, eps=norm_eps)
        self.ffn_norm = RMSNorm(dim, eps=norm_eps)

    def forward(self, x, mask=None):
        h = x + self.attention.forward(self.attention_norm(x), mask)
        out = h + self.feed_forward.forward(self.ffn_norm(h))
        return out

class Llama32(nn.Module):
    def __init__(self, vocab_size, dim, num_layers, num_heads, ffn_dim, norm_eps):
        super().__init__()
        self.token_emb = nn.Embedding(vocab_size, dim)
        self.layers = nn.ModuleList([
            TransformerBlock(dim, num_heads, ffn_dim, norm_eps)
            for _ in range(num_layers)
        ])
        self.norm = RMSNorm(dim, eps=norm_eps)
        self.lm_head = nn.Linear(dim, vocab_size, bias=False)

    def forward(self, x, mask=None):
        x = self.token_emb(x)
        for layer in self.layers:
            x = layer(x, mask)
        x = self.norm(x)
        return self.lm_head(x)

def apply_rotary_pos_emb(q, k, cos, sin):
    q_embed = (q * cos) + (rotate_half(q) * sin)
    k_embed = (k * cos) + (rotate_half(k) * sin)
    return q_embed, k_embed

def rotate_half(x):
    x1, x2 = x[..., : x.shape[-1] // 2], x[..., x.shape[-1] // 2 :]
    return torch.cat((-x2, x1), dim=-1)

# Example usage
vocab_size = 32000
dim = 4096
num_layers = 32
num_heads = 32
ffn_dim = 11008
norm_eps = 1e-6

model = Llama32(vocab_size, dim, num_layers, num_heads, ffn_dim, norm_eps)

# Generate a sample input
batch_size = 1
seq_len = 1024
input_ids = torch.randint(0, vocab_size, (batch_size, seq_len))

# Forward pass
output = model(input_ids)
print(output.shape)  # Should be (batch_size, seq_len, vocab_size)
```

This implementation includes the key components of Llama 3.2:

1. RMSNorm for layer normalization
2. Rotary positional embeddings
3. SwiGLU activation in the feed-forward network
4. Attention mechanism with rotary embeddings

Note that this is a basic implementation and doesn't include all the optimizations and features of the full Llama 3.2 model, such as:

- Grouped-query attention (GQA)
- KV cache for efficient inference
- Quantization support
- Vision capabilities (for the larger models)

To use this model for text generation, you would need to implement additional functions for tokenization, sampling, and decoding. Additionally, you would need to load pre-trained weights or train the model from scratch on a large corpus of text data.

For production use or more advanced features, it's recommended to use the official implementations or well-maintained libraries like Hugging Face Transformers, which provide optimized and fully-featured versions of Llama 3.2.

Sources
[1] meta-llama/Llama-3.2-1B-Instruct - Hugging Face https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
[2] Step-by-Step Guide: Fine-Tuning Meta's Llama 3.2 1B Model https://drlee.io/step-by-step-guide-fine-tuning-metas-llama-3-2-1b-model-f1262eda36c8?gi=4ae4d6214dc8
[3] Torch Compile: 2x Faster Llama 3.2 with Low Effort https://towardsdatascience.com/torch-compile-2x-faster-llama-3-2-with-low-effort-d17c102ac405
[4] pytorch/torchtune: PyTorch native finetuning library - GitHub https://github.com/pytorch/torchtune/actions
[5] Implement Llama 3 From Scratch - PyTorch - YouTube https://www.youtube.com/watch?v=lrWY4O5kUTY
[6] Distilling Llama3.1 8B into Llama3.2 1B using Knowledge Distillation https://pytorch.org/torchtune/stable/tutorials/llama_kd_tutorial.html
[7] Llama 3.2: Revolutionizing edge AI and vision with open ... - AI at Meta https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/
[8] Coding Llama 3 from scratch in PyTorch - Part 1 - YouTube https://www.youtube.com/watch?v=6nYfl_iOKFM
[9] torchchat added support for all the llama 3.2 models including vision https://www.reddit.com/r/LocalLLaMA/comments/1fx4q51/torchchat_added_support_for_all_the_llama_32/
[10] Llama 3.2 From Scratch (A Standalone Notebook) - GitHub https://github.com/rasbt/LLMs-from-scratch/blob/main/ch05/07_gpt_to_llama/standalone-llama32.ipynb

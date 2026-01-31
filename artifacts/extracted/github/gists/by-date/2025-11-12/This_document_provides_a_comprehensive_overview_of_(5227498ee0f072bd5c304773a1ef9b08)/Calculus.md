# NEUMANN: Differentiable Logic Programs for Abstract Visual Reasoning

## Message Passing
Given node features \( h \) and neighboring nodes \( N(i) \), the new feature for a node \( i \) is computed as:
$$
h_i' = \text{ReLU}\left(\sum_{j \in N(i)} W_m h_j + b_m\right)
$$

## Program Induction Loss
The loss function for program induction over dataset \( D \) with target values \( y \) and predictions \( \hat{y} \) is:
$$
L(\theta) = \sum_{(x, y) \in D} (y - f(x, \theta))^2
$$

## Gradient Descent Update
Parameters \( \theta \) are updated using gradient descent:
$$
\theta \leftarrow \theta - \eta \frac{\partial L}{\partial \theta}
$$

# Scheduled Policy Optimization for Natural Language Communication

## Policy Gradient
The gradient of the policy \( \pi \) with respect to trajectory \( \tau \) and reward function \( R \) is:
$$
\nabla_\theta J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta} \left[ \sum_{t=0}^T \nabla_\theta \log \pi_\theta(a_t | s_t) R(\tau) \right]
$$

## Scheduled Learning Loss
The combined loss function incorporating both Learning from Demonstrations (LfD) and Reinforcement Learning (RL) is:
$$
L = \alpha L_{LfD} + (1 - \alpha) L_{RL}
$$

## Gradient Descent Update
Parameters \( \theta \) are updated using gradient descent:
$$
\theta \leftarrow \theta - \eta \frac{\partial L}{\partial \theta}
$$

# LEFT: Logic-Enhanced Foundation Model

## Logic Execution
The result of applying the logic program \( P \) to features \( x \) is:
$$
f(P, x) = \sum_{i} P_i x_i
$$

## Loss Function
The loss function for dataset \( D \) with target values \( y \) and predictions \( \hat{y} \) is:
$$
L(\theta) = \sum_{i=1}^n (y_i - f(P_i, x_i))^2
$$

## Gradient Descent Update
Parameters \( \theta \) are updated using gradient descent:
$$
\theta \leftarrow \theta - \eta \frac{\partial L}{\partial \theta}
$$

# ALMARL: Attention-based LSTM and Multi-Agent Reinforcement Learning

## Attention Mechanism
The attention weights \( \alpha \) for scores \( s \) are computed as:
$$
\alpha_i = \frac{\exp(s_i)}{\sum_{j} \exp(s_j)}
$$

## Policy Gradient
The gradient of the policy \( \pi \) with respect to trajectory \( \tau \) and reward function \( R \) is:
$$
\nabla_\theta J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta} \left[ \sum_{t=0}^T \nabla_\theta \log \pi_\theta(a_t | s_t) R(\tau) \right]
$$

## Gradient Descent Update
Parameters \( \theta \) are updated using gradient descent:
$$
\theta \leftarrow \theta + \eta \nabla_\theta J(\theta)
$$

# DeepPath: Reinforcement Learning for Knowledge Graph Reasoning

## Q-Learning Update
The Q-value update for state \( s \), action \( a \), reward \( r \), and next state \( s' \) is:
$$
Q(s, a) \leftarrow Q(s, a) + \alpha \left( r + \gamma \max_{a'} Q(s', a') - Q(s, a) \right)
$$

## Policy
The policy \( \pi \) for state \( s \) using softmax is:
$$
\pi(a|s) = \frac{\exp(Q(s, a))}{\sum_{a'} \exp(Q(s, a'))}
$$

## Gradient Descent Update
Parameters \( \theta \) are updated using gradient descent (if applicable):
$$
\theta \leftarrow \theta - \eta \frac{\partial L}{\partial \theta}
$$

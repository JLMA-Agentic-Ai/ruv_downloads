# Smart LLM Proxy

A cost-optimized proxy for routing between GPT-4o, Claude 3.5 Sonnet, and Gemini 1.5 Pro using LiteLLM.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Monitoring](#monitoring)
- [Security](#security)
- [Citations](#citations)

## Features

- **Smart Routing**: Efficiently route requests between multiple LLM providers.
- **Response Caching**: Utilize Redis for caching responses to reduce latency and costs.
- **Cost Optimization**: Optimize usage based on cost-effectiveness.
- **API Compatibility**: Compatible with OpenAI API endpoints for seamless integration.
- **Web UI**: Provides a user-friendly interface for testing and monitoring.

## Project Structure

Here's a complete setup for a LiteLLM proxy with smart routing between GPT-4o, Claude 3.5 Sonnet, and Gemini 1.5 Pro.

### Dockerfile

```dockerfile
FROM ghcr.io/berriai/litellm:main-latest

WORKDIR /app

# Install additional dependencies
RUN pip install --no-cache-dir redis psycopg2-binary

# Copy configuration files
COPY litellm_config.yaml /app/config.yaml
COPY .env /app/.env

# Set environment variables
ENV LITELLM_MASTER_KEY="sk-1234"
ENV SERVER_ROOT_PATH="/api/v1"
ENV UI_BASE_PATH="/api/v1/ui"

# Expose port
EXPOSE 4000

# Run proxy with detailed debugging
CMD ["--config", "/app/config.yaml", "--port", "4000", "--detailed_debug"]
```

### docker-compose.yml

```yaml
version: "3.9"

services:
  webui:
    image: ghcr.io/open-webui/open-webui:main
    restart: unless-stopped
    ports:
      - "3000:8080"
    environment:
      - OPENAI_API_KEY=dummy
      - OPENAI_API_BASE_URL=http://litellm:4000/v1
    volumes:
      - open-webui:/app/backend/data

  litellm:
    build: .
    restart: unless-stopped
    ports:
      - "4000:4000"
    environment:
      - LITELLM_MASTER_KEY=${LITELLM_MASTER_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - REDIS_HOST=redis
      - DATABASE_URL=${DATABASE_URL}
    volumes:
      - ./litellm_config.yaml:/app/config.yaml

  redis:
    image: redis:alpine
    restart: unless-stopped
    ports:
      - "6379:6379"

volumes:
  open-webui:
```

### litellm_config.yaml

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      max_tokens: 4096
      temperature: 0.7

  - model_name: claude-3-sonnet
    litellm_params:
      model: anthropic/claude-3-sonnet-20240229
      max_tokens: 4096
      temperature: 0.7

  - model_name: gemini-pro
    litellm_params:
      model: gemini/gemini-1.5-pro-latest
      max_tokens: 4096
      temperature: 0.7

router_settings:
  routing_strategy: "cost-optimal"
  timeout: 30
  cache_responses: true
  redis_cache:
    host: redis
    port: 6379
    ttl: 3600
```

### .env.sample

```plaintext
# API Keys
LITELLM_MASTER_KEY=sk-your-master-key
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-your-anthropic-key
GEMINI_API_KEY=your-gemini-key

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Server Settings
SERVER_ROOT_PATH=/api/v1
UI_BASE_PATH=/api/v1/ui
```

## Quick Start

1. **Access the Docker File**

   Visit the [Docker file on GitHub](https://gist.github.com/ruvnet/e7b9bfa62c62a95aabd15c22710fd624) to get started.

2. **Clone the Repository**

   ```bash
   git clone https://gist.github.com/ruvnet/e7b9bfa62c62a95aabd15c22710fd624 smart-llm-proxy
   cd smart-llm-proxy
   ```

2. **Copy and Configure Environment Variables**

   Copy `.env.sample` to `.env` and fill in your API keys:

   ```bash
   cp .env.sample .env
   ```

   Edit the `.env` file to include your actual API keys and database credentials.

3. **Build and Start the Services**

   Ensure you have Docker and Docker Compose installed. Then, run:

   ```bash
   docker compose up -d
   ```

4. **Access the Services**

   - **API Endpoint**: [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
   - **Web UI**: [http://localhost:3000](http://localhost:3000)

## Configuration

- **Model Settings and Routing Strategy**

  Modify `litellm_config.yaml` to adjust model settings and routing strategies.

- **Environment Variables**

  Configure environment variables in the `.env` file for API keys, database connections, and server paths.

- **Redis Cache Settings**

  Adjust Redis cache TTL and other settings in `litellm_config.yaml` under `router_settings.redis_cache`.

## Monitoring

Access the monitoring dashboard at [http://localhost:3000/ui](http://localhost:3000/ui) to:

- **Track Usage and Costs**: Monitor how different models are being utilized and their associated costs.
- **Monitor Request Latency**: Keep an eye on the response times of your requests.
- **View Routing Decisions**: Understand how requests are being routed between different LLM providers.
- **Test Different Models**: Experiment with various models directly from the UI.

## Security

- **API Protection**: All API endpoints are secured with the master key defined in `.env`.
- **Strong API Keys**: Ensure you set strong and unique API keys in production environments.
- **Network Security**: Implement proper network security measures, such as firewalls and SSL, when deploying the proxy.

## Citations

1. [OpenWebUILiteLLM](https://notes.dt.in.th/OpenWebUILiteLLM)
2. [BerriAI/litellm](https://github.com/BerriAI/litellm)
3. [etalab-ia/albert-models](https://github.com/etalab-ia/albert-models)
4. [LiteLLM Proxy Deployment Docs](https://docs.litellm.ai/docs/proxy/deploy)
5. [Using GPT-4o, Gemini 1.5 Pro, and Claude 3.5 Sonnet for Free](https://pieces.app/blog/how-to-use-gpt-4o-gemini-1-5-pro-and-claude-3-5-sonnet-free)
6. [YouTube Tutorial](https://www.youtube.com/watch?v=m5Ro5jQqf0M)
7. [Google Cloud Vertex AI Caching](https://cloud.google.com/vertex-ai/docs/pipelines/configure-caching)
8. [LiteLLM Answer Proxy Docker Setup](https://www.restack.io/p/litellm-answer-proxy-docker-setup-cat-ai)
9. [Aider Chat dotenv Configuration](https://aider.chat/docs/config/dotenv.html)


### How to Use the Script

1. **Save the Script**

   Save the above script to a file, for example, `setup.sh`.

2. **Make the Script Executable**

   Open your terminal, navigate to the directory containing `setup.sh`, and run:

   ```bash
   chmod +x setup.sh
   ```

3. **Run the Script**

   Execute the script:

   ```bash
   ./setup.sh
   ```

4. **Follow the Prompts**

   The script will prompt you to enter various environment variables and keys. You can leave the optional LLM keys blank by pressing `Enter` if you do not wish to provide them.

5. **Access the Services**

   Once the script completes, you can access the services using the URLs provided at the end of the script execution.

### Script Breakdown

- **Prerequisites Check**: The script first checks if both Docker and Docker Compose are installed on your system. If not, it will prompt you to install them.

- **Project Directory**: It creates a directory named `smart-llm-proxy` and navigates into it.

- **Environment Variables Prompt**: 
  - **Required**: `LITELLM_MASTER_KEY`, `OPENAI_API_KEY`, `DATABASE_URL`, `SERVER_ROOT_PATH`, `UI_BASE_PATH`
  - **Optional**: `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`

- **File Creation**: The script creates the following files with the provided configurations:
  - `.env`: Contains all the environment variables.
  - `Dockerfile`: Defines the Docker image for LiteLLM.
  - `docker-compose.yml`: Sets up the services (`webui`, `litellm`, `redis`).
  - `litellm_config.yaml`: Configures the models and routing settings.

- **Docker Compose Up**: Builds and starts the Docker containers in detached mode.

- **Completion Message**: Provides URLs to access the API Endpoint, Web UI, and Monitoring Dashboard.

### Notes

- **Optional LLM Keys**: If you choose not to provide `ANTHROPIC_API_KEY` or `GEMINI_API_KEY`, the `.env` file will leave these variables empty. Ensure that your `litellm_config.yaml` and application logic can handle cases where these keys are not provided.

- **Environment Variables Security**: Make sure to keep your `.env` file secure, especially the API keys. Do not commit it to version control systems.

- **Docker Permissions**: Ensure that your user has the necessary permissions to run Docker commands. You might need to run the script with `sudo` or add your user to the `docker` group.

- **Customization**: Feel free to modify the `litellm_config.yaml` or other configuration files as needed to suit your specific requirements.

### Troubleshooting

- **Docker Daemon Not Running**: If you encounter issues related to Docker, ensure that the Docker daemon is running.

- **Port Conflicts**: If ports `3000`, `4000`, or `6379` are already in use, you may need to stop the services using them or modify the `docker-compose.yml` to use different ports.

- **Missing Dependencies**: Ensure all dependencies like Docker and Docker Compose are properly installed and up to date.


```bash
#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Function to prompt for input with a default value
prompt() {
    local PROMPT_MESSAGE=$1
    local DEFAULT_VALUE=$2
    read -p "$PROMPT_MESSAGE [$DEFAULT_VALUE]: " INPUT
    if [ -z "$INPUT" ]; then
        echo "$DEFAULT_VALUE"
    else
        echo "$INPUT"
    fi
}

# Check for Docker installation
if ! command -v docker &> /dev/null
then
    echo "Docker is not installed. Please install Docker and try again."
    exit 1
fi

# Check for Docker Compose installation
if ! command -v docker-compose &> /dev/null
then
    echo "Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Create project directory
PROJECT_DIR="smart-llm-proxy"
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Prompt for environment variables
echo "Please enter the required environment variables."

# Required Variables
LITELLM_MASTER_KEY=$(prompt "Enter LITELLM_MASTER_KEY" "sk-your-master-key")
OPENAI_API_KEY=$(prompt "Enter OPENAI_API_KEY" "sk-your-openai-key")

# Optional Variables
ANTHROPIC_API_KEY=$(prompt "Enter ANTHROPIC_API_KEY (optional)" "")
GEMINI_API_KEY=$(prompt "Enter GEMINI_API_KEY (optional)" "")

# Database URL
DATABASE_URL=$(prompt "Enter DATABASE_URL" "postgresql://user:password@host:5432/dbname")

# Server Settings
SERVER_ROOT_PATH=$(prompt "Enter SERVER_ROOT_PATH" "/api/v1")
UI_BASE_PATH=$(prompt "Enter UI_BASE_PATH" "/api/v1/ui")

# Create .env file
cat <<EOF > .env
# API Keys
LITELLM_MASTER_KEY=$LITELLM_MASTER_KEY
OPENAI_API_KEY=$OPENAI_API_KEY
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-}
GEMINI_API_KEY=${GEMINI_API_KEY:-}

# Database
DATABASE_URL=$DATABASE_URL

# Server Settings
SERVER_ROOT_PATH=$SERVER_ROOT_PATH
UI_BASE_PATH=$UI_BASE_PATH
EOF

echo ".env file created successfully."

# Create Dockerfile
cat <<'EOF' > Dockerfile
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
EOF

echo "Dockerfile created successfully."

# Create docker-compose.yml
cat <<'EOF' > docker-compose.yml

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
EOF

echo "docker-compose.yml created successfully."

# Create litellm_config.yaml
cat <<'EOF' > litellm_config.yaml
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
EOF

echo "litellm_config.yaml created successfully."

# Build and run Docker containers
echo "Building and starting Docker containers..."
docker-compose up -d

echo "Docker containers are up and running."

# Display access information
echo "========================================"
echo "Smart LLM Proxy Setup Complete!"
echo ""
echo "Access the services at:"
echo "API Endpoint: http://localhost:4000/api/v1"
echo "Web UI: http://localhost:3000"
echo "Monitoring Dashboard: http://localhost:3000/ui"
echo "========================================"
```

### References

- [OpenWebUILiteLLM](https://notes.dt.in.th/OpenWebUILiteLLM)
- [BerriAI/litellm](https://github.com/BerriAI/litellm)
- [etalab-ia/albert-models](https://github.com/etalab-ia/albert-models)
- [LiteLLM Proxy Deployment Docs](https://docs.litellm.ai/docs/proxy/deploy)
- [Using GPT-4o, Gemini 1.5 Pro, and Claude 3.5 Sonnet for Free](https://pieces.app/blog/how-to-use-gpt-4o-gemini-1-5-pro-and-claude-3-5-sonnet-free)
- [YouTube Tutorial](https://www.youtube.com/watch?v=m5Ro5jQqf0M)
- [Google Cloud Vertex AI Caching](https://cloud.google.com/vertex-ai/docs/pipelines/configure-caching)
- [LiteLLM Answer Proxy Docker Setup](https://www.restack.io/p/litellm-answer-proxy-docker-setup-cat-ai)
- [Aider Chat dotenv Configuration](https://aider.chat/docs/config/dotenv.html)

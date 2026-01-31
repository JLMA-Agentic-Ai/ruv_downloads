#!/bin/bash

set -e

# 1. Clone the specified repository into /workspace
echo "Cloning repository into /workspace..."
git clone https://gist.github.com/ba1497632143ea9f12062c9c2c1879ad.git /workspace

# 2. Navigate to the workspace directory
cd /workspace

# 3. Initialize a SPARC project
echo "Initializing SPARC project..."
npx create-sparc init --force

# 4. Install Mastra CLI globally
echo "Installing Mastra CLI globally..."
npm install -g mastra

# 5. Install core and dev NPM libraries
echo "Installing NPM packages (Mastra, Jest, TypeScript)..."
npm install \
  @mastra/core \
  @types/jest \
  ts-jest \
  jest \
  typescript \
  sqlite3 \
  @fastify/sqlite \
  dotenv

# 6. Create Mastra directory structure
echo "Setting up Mastra agent structure..."
mkdir -p src/mastra/agents

# 7. Create a basic Mastra agent
cat <<EOL > src/mastra/agents/agent.ts
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";

export const myAgent = new Agent({
  name: "my-agent",
  instructions: "You are a helpful assistant.",
  model: openai("gpt-4o-mini"),
});
EOL

# 8. Create Mastra index file to register the agent
cat <<EOL > src/mastra/index.ts
import { Mastra } from "@mastra/core";
import { myAgent } from "./agents/agent";

export const mastra = new Mastra({
  agents: { myAgent },
});
EOL

# 9. Set up .env.template for environment variables
echo "Setting up .env.template..."
cat <<EOL > .env.template
# Add your environment variables here
OPENAI_API_KEY=your-openai-api-key
DATABASE_URL=sqlite:///./dev.db
EOL

# 10. Set up Python backend: FastAPI, FastMCP, SQLite, Pydantic
echo "Setting up Python backend environment..."
python3 -m venv .venv
source .venv/bin/activate

pip install --upgrade pip
pip install \
  fastapi \
  "uvicorn[standard]" \
  fastmcp \
  pydantic \
  sqlite-utils

deactivate

echo "Setup complete. The environment is now ready for offline use."

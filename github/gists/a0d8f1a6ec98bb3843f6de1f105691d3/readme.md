### **Single File Agent Template for Deno**
**File Name:** `agent.ts`

---

### **Installation & Setup**
1. **Install Deno (if not already installed)**
   ```sh
   curl -fsSL https://deno.land/install.sh | sh
   ```
   Or install via package managers:
   - macOS (Homebrew): `brew install deno`
   - Windows (Scoop): `scoop install deno`
   - Linux: Use the official install script above.

2. **Set Environment Variables**
   ```sh
   export OPENROUTER_API_KEY="your_openrouter_api_key"
   export OPENROUTER_MODEL="openai/o3-mini-high"  # Optional, defaults to GPT-3.5
   ```

---

### **Running Locally**
Execute the agent with:
```sh
deno run --allow-net --allow-env agent.ts
```
- `--allow-net`: Grants network access for API calls.
- `--allow-env`: Allows reading the `OPENROUTER_API_KEY`.

---

### **Deployment Instructions**
#### **Deploy to Fly.io**
1. **Install Fly.io CLI** (if not already installed)
   ```sh
   curl -L https://fly.io/install.sh | sh
   ```
2. **Login to Fly.io**
   ```sh
   fly auth login
   ```
3. **Initialize the project**
   ```sh
   fly launch --name my-agent --no-deploy
   ```
4. **Set secrets**
   ```sh
   fly secrets set OPENROUTER_API_KEY=your_openrouter_api_key
   ```
5. **Deploy**
   ```sh
   fly deploy
   ```

---

#### **Deploy as a Supabase Edge Function**
1. **Install the Supabase CLI**
   ```sh
   npm install -g supabase
   ```
2. **Login to Supabase**
   ```sh
   supabase login
   ```
3. **Create a new function**
   ```sh
   supabase functions new myagent
   ```
4. **Replace `myagent/index.ts` with `agent.ts`**
5. **Set the API key**
   ```sh
   supabase secrets set OPENROUTER_API_KEY=your_openrouter_api_key
   ```
6. **Deploy**
   ```sh
   supabase functions deploy myagent --no-verify-jwt
   ```

---

### **Usage**
Once deployed, send a request to the endpoint (Fly.io or Supabase).
```sh
curl -X POST "https://your-deployment-url" \
     -H "Content-Type: application/json" \
     -d '{ "query": "What is 2+2?" }'
```
The agent will process the request and return a response.

---

This **Single File Agent** follows the **ReACT pattern**, integrates **OpenRouter API**, supports **tool usage**, and is **optimized for serverless environments** like **Fly.io and Supabase Edge Functions**. 🚀
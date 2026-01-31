# **agentic-robots-txt**: Dynamic Robots.txt with MCP Integration

**agentic-robots-txt** is a Node.js package that generates a dynamic `robots.txt` file with extended directives for AI agents, and exposes those rules via Anthropic’s Model Context Protocol (MCP). It helps web developers control standard web crawlers *and* guide AI model agents by providing an **agentic manifest** and **agent guide** references in the `robots.txt`. The package also includes an MCP server so AI agents (MCP clients) can retrieve these rules programmatically. Key features include dynamic rule generation, MCP compliance, security controls, and easy integration into frameworks like Express.

## Dynamic `robots.txt` Generation

A `robots.txt` file defines crawl rules for bots (traditionally search engines) by specifying allowed and disallowed paths ([The ultimate guide to robots.txt • Yoast](https://yoast.com/ultimate-guide-robots-txt/#:~:text=A%20robots,search%20engines%20adhere%20to%20it)). **agentic-robots-txt** automates creating this file with both standard rules and AI-specific directives:

- **Standard Crawler Rules:** By default, the package generates a permissive `robots.txt` that allows all well-behaved web crawlers to index your site. It includes directives like `User-agent` (to specify which crawler the rules apply to) and `Disallow/Allow` (to block or permit URLs) ([The ultimate guide to robots.txt • Yoast](https://yoast.com/ultimate-guide-robots-txt/#:~:text=User)). For example, the default might allow everything for all user-agents, or disallow sensitive areas like admin pages if configured. You can customize these rules via a configuration object (see below).

- **AI Agent Directives:** In addition to standard rules, the generated file can include special directives for AI agents. This is done by adding references (as comments or custom fields) to an **Agentic Manifest** and an **Agent Guide**. The *agentic manifest* (e.g. `/.well-known/agentics-manifest.json`) is a JSON file describing your site’s AI-specific policies or API endpoints, similar to how ChatGPT plugins use an AI manifest ([JSON Manifest Files · Issue #2008 · langchain-ai/langchain · GitHub](https://github.com/hwchase17/langchain/issues/2008#:~:text=All%20,scraping%20or%20parsing%20API%20docs)). The *agent guide* (e.g. `/.well-known/agent-guide.md`) is a Markdown file with human-readable guidelines for AI agents (for example, how the site should or shouldn’t be used by AI, contact info, or rate-limit policies for bots). Including these in `robots.txt` helps AI systems discover them easily.

- **Custom Rules via Configuration:** The package accepts a config object to override or extend rules. You can specify multiple user-agent groups, custom allow/disallow paths, crawl-delay, sitemap location, and whether to include the agentic directives. This makes the `robots.txt` **dynamic** – for instance, you could generate different rules in development vs production, or update rules without manually editing the file. The config can be loaded from a JSON/YAML file or defined in code, allowing flexibility (e.g., pulling disallowed paths from a database or environment variables).

**Example:** Using **agentic-robots-txt** in an Express app to generate and serve `robots.txt`:

```js
// app.js (Express integration example)
const express = require('express');
const { generateRobotsTxt, robotsTxtMiddleware } = require('agentic-robots-txt');

const app = express();

// Define custom rules and agentic file paths
const rulesConfig = {
  // Standard crawler rules for different agents
  rules: [
    { userAgent: '*', allow: ['/', '/blog'], disallow: ['/admin', '/login'] },
    { userAgent: 'Googlebot', allow: ['/'], disallow: ['/search'] }
  ],
  // Include sitemap URL
  sitemap: 'https://example.com/sitemap.xml',
  // Include agentic directives
  agenticManifest: '/.well-known/agentics-manifest.json',
  agentGuide: '/.well-known/agent-guide.md'
};

// Option 1: Generate robots.txt content on-the-fly
app.get('/robots.txt', (req, res) => {
  const robotsTxtContent = generateRobotsTxt(rulesConfig);
  res.type('text/plain').send(robotsTxtContent);
});

// Option 2: Use provided middleware for robots.txt (auto-generates using internal config)
app.use(robotsTxtMiddleware(rulesConfig));

// ... other routes ...
app.listen(3000);
```

The `generateRobotsTxt` function merges your custom `rulesConfig` with sensible defaults to produce a text. For the config above, the output `robots.txt` might look like:

```txt
User-Agent: *
Disallow: /admin
Disallow: /login
Allow: / 
Allow: /blog

User-Agent: Googlebot
Disallow: /search
Allow: /

# AI Agent directives (MCP):
# agentic-manifest: /.well-known/agentics-manifest.json
# agent-guide: /.well-known/agent-guide.md

Sitemap: https://example.com/sitemap.xml
```

Each `User-Agent` group lists rules for a specific crawler or all (`*`). In this example, all bots are disallowed from `/admin` and `/login` but can access other pages, Google’s bot has an extra disallow for `/search`, and a sitemap URL is provided. The bottom section (commented for compatibility) informs AI agents about the manifest and guide. Standard web crawlers will ignore the unknown `# agentic-...` lines (treated as comments), but AI-specific clients can parse them to discover the manifest and guide resources.

## MCP Integration (Model Context Protocol)

To make the agent directives machine-readable and interactable, **agentic-robots-txt** implements an **MCP-compliant server**. The Model Context Protocol is an open standard that allows AI assistants (LLMs) to connect to data sources or tools in a uniform way ([Introducing the Model Context Protocol \ Anthropic](https://www.anthropic.com/news/model-context-protocol#:~:text=The%20Model%20Context%20Protocol%20is,that%20connect%20to%20these%20servers)). In our context, the package acts as an MCP **server** exposing your site’s crawling rules and agent guidelines as resources. This enables AI *MCP clients* (such as AI agents or frameworks like Claude Desktop) to fetch the latest rules programmatically, rather than scraping the text file.

**Key MCP features in this package:**

- **MCP Server with Robot Resources:** The package uses the official MCP SDK for Node/TypeScript to create a server instance (e.g. an `McpServer`). It defines **resources** for the relevant data from `robots.txt` – for example, one resource for the raw `robots.txt` content, another for the Agentic Manifest JSON data, and another for the Agent Guide text. In MCP, resources are like read-only endpoints that an AI can query for data ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=,otherwise%20produce%20a%20side%20effect)) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=Tools%20let%20LLMs%20take%20actions,computation%20and%20have%20side%20effects)). The `agentic-robots-txt` server registers these resources with unique URIs.

- **Dynamic Data Exposure:** When an AI client requests the `robots` resource, the server generates the latest robots.txt content (just as it would for the file) and returns it. This ensures the AI always gets up-to-date rules. Similarly, the `agent-guide` resource returns the content of your `agent-guide.md` (which might include detailed instructions or policies), and the `agentics-manifest` resource returns the JSON manifest. By providing structured access, AI agents can decide how to use the info – for instance, an agent could parse the JSON manifest for allowed actions, or include the guide’s text in its prompt context.

- **Standard MCP Communication:** The MCP server uses a client-server messaging architecture. We leverage HTTP **Server-Sent Events (SSE)** for a lightweight, persistent connection that MCP supports for web contexts (the SDK provides an `SSEServerTransport` for Express) ([Overview - Model Context Protocol](https://modelcontextprotocol.io/sdk/java/mcp-overview#:~:text=%2A%20Default%20transports%3A%20%2A%20Stdio,Synchronous%20and%20Asynchronous%20programming%20paradigms)) ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=const%20app%20%3D%20express)). Under the hood, the package sets up an endpoint (e.g. `/mcp/sse`) for AI clients to initiate an SSE stream, and a companion endpoint for passing messages (`/mcp/messages`). This follows the MCP spec so the AI and server can exchange JSON-RPC messages over SSE. The AI (MCP client) can *discover* available resources and then *read* them through this channel.

**Example:** Initializing the MCP server in your Node app with **agentic-robots-txt**:

```js
const { createMcpServer } = require('agentic-robots-txt');

// Assume rulesConfig from previous example is defined
const mcpServer = createMcpServer(rulesConfig);

// Define MCP resources for robots, manifest, and guide
mcpServer.resource(
  "robots", "robots://main",
  async (uri) => ({
    contents: [{ uri: uri.href, text: generateRobotsTxt(rulesConfig) }]
  })
);
mcpServer.resource(
  "agent-guide", "agent-guide://main",
  async (uri) => ({
    contents: [{ uri: uri.href, text: /* load agent-guide.md content as string */ }]
  })
);
mcpServer.resource(
  "agentics-manifest", "agentics-manifest://main",
  async (uri) => ({
    contents: [{ uri: uri.href, text: JSON.stringify(/* manifest object */, null, 2) }]
  })
);

// Start listening for AI agent connections (using Express for HTTP transport)
const app = express();
require('agentic-robots-txt').attachMcpRoutes(app, mcpServer);
app.listen(3000, () => console.log('MCP server listening'));
```

In this snippet, `createMcpServer` creates an MCP server instance and we register three resources. Each resource uses a URI scheme (`robots://`, etc.) and a handler that returns the content. The `attachMcpRoutes` helper will mount the necessary routes (`/mcp/sse` and `/mcp/messages` or similar) on an Express app and wire them to the MCP server’s transport. Once running, an AI agent can connect (with an MCP client library) to fetch the “robots” resource or others. For example, an AI agent could list available resources and find `robots://main` and then read it, receiving the same text as the `robots.txt` file. This two-way integration means you could even extend the server with MCP **tools** in the future (e.g. a tool to test a URL against the rules or to update the rules), although by default we expose read-only data. 

**Why MCP?** Using MCP makes it easier for AI systems to respect your site’s preferences. Instead of scraping a webpage or relying purely on the static `robots.txt`, an AI agent can directly query the **agentic-robots-txt** MCP server for rules. MCP standardizes this interaction (like a “USB-C port for AI” connecting to various data sources ([Introduction - Model Context Protocol](https://modelcontextprotocol.io/introduction#:~:text=MCP%20is%20an%20open%20protocol,different%20data%20sources%20and%20tools))), so any AI client that understands MCP can integrate with your site’s policy endpoints consistently.

## Security and Authentication

Security is paramount when exposing site data and interacting with AI agents. **agentic-robots-txt** is built with best practices to ensure that only appropriate data is shared and that sensitive operations are protected:

- **Read-Only Public Data:** By default, all data exposed via `robots.txt` and the MCP resources is non-sensitive and meant to be public (the same info that any web crawler or user could get). The `robots.txt` file itself is always public on websites ([The ultimate guide to robots.txt • Yoast](https://yoast.com/ultimate-guide-robots-txt/#:~:text=Robots,and%20influencing%20the%20indexing%20process)), and the agent manifest/guide are intended as public declarations or instructions. This means the default usage does **not** expose private information. The MCP resources we set up correspond to these public files, so an AI connecting to fetch them isn’t getting anything that isn’t already accessible.

- **Authentication for Protected Resources:** If you choose to include any agent-specific interactions that should be restricted (for example, an MCP **tool** that modifies data, or a resource that reveals internal metrics), the package allows you to enforce authentication. You can require an API key or token for certain MCP routes. For instance, you might protect the `/mcp/sse` handshake with a secret token check – this can be done by adding an Express middleware before `attachMcpRoutes` or configuring the package with an auth callback. The package documentation provides guidance to, say, only allow known API clients (with a shared secret or OAuth token) to connect as an MCP client. This way, if your MCP server were to expose more than just public info, you have control over who can access it.

- **MCP Endpoint Security:** The MCP server implementation follows secure coding practices. It uses the official MCP SDK which handles the protocol messaging robustly (using JSON schema validation via Zod, for example, as shown in their tools example). All incoming requests on the `/mcp/messages` endpoint are processed through the SDK’s handlers, which helps prevent malformed data from causing issues. We ensure to **validate inputs** for any tools (if added) and never execute arbitrary commands from the agent without explicit safe handlers. Additionally, when running the MCP server for remote clients, it is recommended to serve it over HTTPS (which typically is handled by your Node/Express server setup) so that agent communications are encrypted in transit. The package’s design encourages separation of concerns: use your existing web framework’s security features (rate limiting, CORS rules, etc.) on the MCP endpoints as needed.

- **Least Privilege & Configurable Access:** The package only exposes the specific files/data you configure. It does not automatically serve your entire filesystem or backend to the AI – you explicitly define which resources (robots text, guide, manifest) are shared. This principle of least privilege ensures an AI agent can’t, for example, query your database or files unless you extend the server with such a resource on purpose. In the future, if you incorporate more MCP tools or resources, always consider scope and add authentication if those go beyond read-only public info.

In short, **agentic-robots-txt** gives you fine-grained control: out-of-the-box it’s safe and public-only, and for any extended capabilities you opt into, it provides hooks to authenticate and authorize agent interactions properly. By adhering to MCP’s security features and web security best practices (validating inputs, using HTTPS, auth where necessary), the solution ensures your site’s integrity while interacting with AI agents.

## Deployment as an NPM Package

The project is structured as a reusable NPM package for easy installation and integration. It includes documentation, testing, and CI/CD setup to streamline development and deployment.

- **Package Structure:** The repository is organized with clarity in mind:
  - `package.json` – defines the package name (`agentic-robots-txt`), version, dependencies (e.g. the MCP SDK, Express peer dependency), and scripts.
  - `index.js` (or `index.ts`) – entry point exporting the main functions (like `generateRobotsTxt`, `robotsTxtMiddleware`, `createMcpServer`, `attachMcpRoutes`, etc.).
  - `lib/robotsGenerator.js` – module containing the logic to build the robots.txt string from config (handling defaults, merging rules, adding the agentic directives).
  - `lib/mcpServer.js` – module encapsulating MCP server creation and resource definitions. This might wrap the MCP SDK usage shown earlier, so users don’t have to deal with low-level details if using default behavior.
  - `examples/` – example usage code (like an Express integration snippet) to help new users.
  - `README.md` – detailed usage instructions (much of which is outlined in this answer), installation steps, and configuration options.
  - `tests/` – automated tests for various components (generation logic, maybe a mock MCP interaction, etc.).

- **Installation & Setup:** Once published, developers can install via npm:
  ```bash
  npm install agentic-robots-txt
  ```
  After installing, they can import the library in a Node/Express application. Basic usage requires creating a config (or using defaults) and then either generating the text or mounting the middleware. For example, in an Express app:
  ```js
  const { robotsTxtMiddleware, attachMcpRoutes } = require('agentic-robots-txt');
  app.use('/robots.txt', robotsTxtMiddleware(myConfig));
  attachMcpRoutes(app);  // sets up MCP endpoints with default or provided server
  ```
  The README provides a full reference of config fields. Configuration can include:
  - `rules`: Array of `{ userAgent, allow, disallow, crawlDelay }` objects to define crawler rules.
  - `sitemap`: URL string for your sitemap (optional).
  - `agenticManifest` / `agentGuide`: Paths or URLs for the AI manifest JSON and guide MD. If set, the robots.txt will include references to these. You should also ensure these files are hosted (you can serve `agent-guide.md` as a static file and `agentics-manifest.json` as static or even generate it via this package or another route).
  - `mcp: { enabled, path }`: (Optional) Configuration to enable the MCP server and specify the base path or routes for SSE. By default, if you call `attachMcpRoutes`, it will use `/mcp/sse` and `/mcp/messages`.
  - `requireAuth`: (Optional) a function or flag to enforce auth on MCP routes (e.g. if set, the middleware will check for a token in `req.headers` and reject connection if missing/invalid).

- **Integration with Frameworks:** While the examples use Express, the package can work with any Node HTTP framework. The `robotsTxtMiddleware` is simply a request handler function, so it can be used in Connect, Koa (with a small wrapper), or even directly in Node’s `http.createServer`. For non-Express users, one can use `generateRobotsTxt()` in their request handler manually. The MCP server can run standalone as well – for instance, it could listen on a separate port or use the stdio transport if running as a sidecar process with an AI. This flexibility allows you to adopt **agentic-robots-txt** in new or existing projects without heavy refactoring.

- **Automated Testing:** The package includes a test suite (using **Jest** for example) to ensure reliability. Tests cover generating `robots.txt` with various configs (e.g. no rules vs multiple rules, with or without agentic directives), making sure the output matches expectations (we verify that disallowed paths appear correctly, etc.). We also test the Express middleware behavior (using supertest to simulate requests to `/robots.txt`). For MCP, we include tests that instantiate the MCP server and call the resource handlers directly to confirm they return the right data. Security tests simulate scenarios like a missing auth token if auth is required and expect a 401 response. Having comprehensive tests means developers can confidently use and even extend the package, knowing changes won’t break core functionality.

- **CI/CD Pipeline:** We recommend setting up a CI workflow (e.g., GitHub Actions) for linting, testing, and publishing the package. For instance, every pull request and push to the repository triggers the test suite on multiple Node versions to ensure compatibility. Only when tests pass and code is merged to the main branch do we publish a new version. Publishing can be automated: using GitHub Actions to run `npm publish` when a new release/tag is created (with an npm token stored securely in the repo secrets). According to GitHub’s guide, you can configure a workflow that runs CI tests and then publishes to npm if those tests pass ([Publishing Node.js packages - GitHub Docs](https://docs.github.com/actions/publishing-packages/publishing-nodejs-packages#:~:text=This%20guide%20shows%20you%20how,CI%29%20tests%20pass)). This ensures that broken code is never released. We also recommend using semantic versioning and maybe a tool like **semantic-release** to automate version bumps and changelogs. Additionally, enable dependency updates (using `npm audit` or GitHub Dependabot) in CI to catch security vulnerabilities in dependencies. With a proper CI/CD setup, contributions to **agentic-robots-txt** can be smoothly integrated and deployed, keeping the package up-to-date and reliable.

## Usage and Future Improvements

After installing **agentic-robots-txt**, you can immediately improve your site’s handling of both web crawlers and AI agents. The combination of a dynamic `robots.txt` (for humans and bots to read) and an MCP interface (for AI to interact) provides a robust “gatekeeper” for your website’s content. Site owners can easily tweak the config as their needs change – for example, add a new disallowed section, or update the AI agent guide with new policies – and these updates propagate to the `robots.txt` file and the MCP server in real-time.

**Future enhancements** planned for the package might include more built-in directives (like automatically adding a `Crawl-delay` or supporting the upcoming REP extensions), richer agent directives (if standards emerge for AI-specific robots.txt fields), and additional MCP tools. For instance, a tool could let an authorized AI agent request temporary access to a protected route or log its crawling activity. The package’s architecture is ready for such extensions, built on the flexible MCP framework where new **tools** and **resources** can be added easily ([GitHub - modelcontextprotocol/typescript-sdk: The official Typescript SDK for Model Context Protocol servers and clients](https://github.com/modelcontextprotocol/typescript-sdk#:~:text=Tools%20let%20LLMs%20take%20actions,computation%20and%20have%20side%20effects)).

By using **agentic-robots-txt**, developers ensure their site is not only SEO-friendly but also prepared for the era of AI-driven agents. You maintain control over what both search engines and AI models can do on your site, in a transparent way. The standard crawler rules keep your site optimized for search indexing, and the MCP-based agentic rules serve as a “robots.txt for AI”, aligning with the idea that modern websites should provide AI-specific metadata ([JSON Manifest Files · Issue #2008 · langchain-ai/langchain · GitHub](https://github.com/hwchase17/langchain/issues/2008#:~:text=All%20,scraping%20or%20parsing%20API%20docs)). All of this is delivered in one convenient, open-source Node.js package. 

**Installation:** `npm i agentic-robots-txt` – then follow the README to configure your rules, mount the middleware, and optionally enable MCP. With tests and CI in place, you can trust the package in production. We welcome contributions and suggestions via our GitHub repo. By adopting **agentic-robots-txt**, you’re taking a proactive step in communicating with the web’s crawlers and the coming generation of AI agents in a responsible and standardized way.

**Sources:**

1. Joost de Valk. “*The ultimate guide to robots.txt*.” *Yoast Blog*, 2023 – Explanation of robots.txt purpose and syntax ([The ultimate guide to robots.txt • Yoast](https://yoast.com/ultimate-guide-robots-txt/#:~:text=A%20robots,search%20engines%20adhere%20to%20it)) ([The ultimate guide to robots.txt • Yoast](https://yoast.com/ultimate-guide-robots-txt/#:~:text=User)).  
2. Slavakurilyak (GitHub user). “*JSON Manifest Files*.” *Langchain Issue #2008*, 2023 – Noting that websites will provide JSON manifests for AI (LLM plugins) in addition to robots.txt ([JSON Manifest Files · Issue #2008 · langchain-ai/langchain · GitHub](https://github.com/hwchase17/langchain/issues/2008#:~:text=All%20,scraping%20or%20parsing%20API%20docs)).  
3. Anthropic. “*Introducing the Model Context Protocol*.” *Anthropic News*, Nov 2024 – Announcement of MCP as an open standard for connecting AI assistants with data sources ([Introducing the Model Context Protocol \ Anthropic](https://www.anthropic.com/news/model-context-protocol#:~:text=The%20Model%20Context%20Protocol%20is,that%20connect%20to%20these%20servers)).  
4. GitHub Docs. “*Publishing Node.js packages*.” *GitHub Actions Guide* – On CI workflows to test and publish Node packages to registries after tests pass ([Publishing Node.js packages - GitHub Docs](https://docs.github.com/actions/publishing-packages/publishing-nodejs-packages#:~:text=This%20guide%20shows%20you%20how,CI%29%20tests%20pass)).
# Appendix: Technical Details for ChatGPT App UI

## A. Rendering model

* Components render inside a sandboxed iframe managed by ChatGPT.
* Your MCP tool returns data plus UI metadata that the Apps SDK interprets to mount your component.
* The host injects a `window.openai` bridge into the iframe for props and events. ([OpenAI][1])

## B. Component contract

**Minimal shape your tool can return**

```json
{
  "content": [{ "type": "text", "text": "Hello, rUv" }],
  "mcp": {
    "ui": {
      "component": {
        "id": "hello-card",
        "title": "Hello",
        "src": "/ui/hello-card.html",
        "props": { "greeting": "Hello, rUv" }
      },
      "display": "inline"
    }
  }
}
```

* `src` points to your hosted bundle or HTML.
* `props` is JSON delivered to the component on mount and on refresh.
* `display` hints: `inline` for cards, `fullscreen` for complex flows. Details may evolve. ([OpenAI Developers][2])

## C. Bridge API in the iframe

In your UI bundle:

```js
// Receive props
window.openai?.onProps((props) => {
  render(props);
});

// Emit events back to the conversation
function onSubmit(formData) {
  window.openai?.emit("form.submit", { formData });
}
```

* `onProps` provides the latest props after tool calls or re-renders.
* `emit` sends named events with payloads. ChatGPT routes these to your server as a follow up tool call. ([OpenAI Developers][3])

## D. UI event loop

1. User clicks in your UI and your code calls `emit("x.y", payload)`.
2. ChatGPT issues a tool call to your MCP server that corresponds to that event.
3. Your server performs work and returns new `content` and optional updated `ui` with next `props`.
4. The iframe receives new props via `onProps` and re-renders. ([OpenAI Developers][2])

## E. State management

* Treat the component as mostly stateless. Persist durable state in your backend keyed by chat, user, or session.
* Keep client state minimal to avoid mismatch across re-renders.
* Use idempotent handlers so a repeated event does not cause duplicate work. ([OpenAI Developers][2])

## F. Layout and modes

* Inline cards for compact tasks and summaries.
* Fullscreen for editors, maps, multi step flows.
* Design responsive layouts that tolerate narrow side panels and mobile. ([The Verge][4])

## G. Inputs and forms

* Use simple HTML or your UI library controls.
* On submit, collect values and `emit("form.submit", { values })`.
* Validate on the server. Send back errors in props for inline display. ([OpenAI Developers][2])

## H. Media and rich views

* Images, audio, and video can render inside the sandbox subject to browser limits.
* Heavy interactive graphics should be kept lean. Prefer server generated previews for large assets. ([OpenAI Developers][2])

## I. Auth flows

* First run triggers a ChatGPT consent screen and optional login.
* Use OAuth with minimal scopes. Store tokens server side.
* Do not embed secrets in the UI bundle. ([The Verge][5])

## J. Security model

* The iframe is sandboxed. Expect restricted browser APIs.
* Blocklist dangerous HTML. Sanitize any HTML you render from external sources.
* Route all network calls through your server. Avoid direct third party calls from the iframe. ([OpenAI Developers][3])

## K. Performance guidelines

* Keep bundles small. Tree shake and minify.
* Lazy load heavy subviews.
* Offload long work to the server and return progress updates through re-renders. ([OpenAI Developers][2])

## L. Error handling and fallbacks

* Always include textual `content` so the chat stays useful if UI fails.
* In UI, show friendly empty states and retry controls.
* For server errors, return a stable UI with an error section in props. ([OpenAI Developers][2])

## M. Accessibility

* Semantic HTML, focus order, ARIA labels for custom widgets.
* Respect reduced motion preferences for animations.
* Ensure contrast and keyboard navigation. ([OpenAI Developers][2])

## N. Testing in ChatGPT

* Enable Developer Mode. Register your MCP server endpoint.
* Use an https tunnel for local dev.
* Test event flows, re-render timing, auth, and error paths with real conversations. ([Model Context Protocol][6])

## O. Versioning the UI

* Version your component URLs, for example `/ui/v1/app.html`.
* Keep tool names and schemas stable once listed. Changes may need resubmission when the directory is live. ([The Verge][5])

## P. Observability

* Generate a correlation id per turn. Attach to logs in both server and UI.
* Capture latency, error codes, event names, and payload sizes.
* Build dashboards for render rate, click through, and conversion. ([OpenAI Developers][2])

## Q. Example skeletons

**Server return with UI**

```js
return {
  content: [{ type: "text", text: "Search results ready" }],
  mcp: {
    ui: {
      component: {
        id: "results-table",
        title: "Results",
        src: "/ui/results.html",
        props: { rows, page, total }
      },
      display: "inline"
    }
  }
};
```

**UI receiving props and sending paging events**

```js
window.openai?.onProps(({ rows, page, total }) => {
  renderTable(rows, page, total);
});

function nextPage() {
  window.openai?.emit("results.next_page", { pageDelta: 1 });
}
```

([OpenAI Developers][3])

## R. Patterns for common UIs

* **Table with filters**: maintain filters in props. Emit `filters.update`. Server returns filtered data and the same component with new props.
* **Map with selections**: pass pins and viewport in props. Emit `map.select` with id. Server returns details panel plus map props.
* **Wizard flow**: one component with a `step` prop. Emit `wizard.next` or `wizard.prev`. Server validates and advances steps. ([The Verge][4])

## S. Constraints to respect

* No direct filesystem access.
* Limited or no persistent local storage.
* Avoid long running loops on the client.
* Policy and moderation still apply to rendered content. ([OpenAI Developers][3])

## T. Publication readiness

* Finalize schemas and tool signatures.
* Provide screenshots and a crisp description.
* Ensure stability and minimal scopes.
* Expect a review process when directory submissions open. ([OpenAI][1])

---

### References

OpenAI Apps SDK announcement and overview. Apps SDK UI bridge and component docs. MCP background and ChatGPT connector support. Press coverage of UI modes and examples. ([OpenAI][1])

[1]: https://openai.com/index/introducing-apps-in-chatgpt/?utm_source=chatgpt.com "Introducing apps in ChatGPT and the new Apps SDK"
[2]: https://developers.openai.com/apps-sdk/build/custom-ux?utm_source=chatgpt.com "Build a custom UX"
[3]: https://developers.openai.com/apps-sdk/reference?utm_source=chatgpt.com "Reference"
[4]: https://www.theverge.com/news/793039/openai-chatgpt-apps-developers-sdk-canva-zillow-devday-2025?utm_source=chatgpt.com "OpenAI will let developers build apps that work inside ChatGPT"
[5]: https://www.theverge.com/news/793081/chagpt-apps-sdk-spotify-zillow-openai?utm_source=chatgpt.com "ChatGPT apps are live: Here are the first ones you can try"
[6]: https://modelcontextprotocol.io/clients?utm_source=chatgpt.com "Example Clients"

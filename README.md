# nen-desktop

TypeScript SDK for the [Nen Desktop API](https://getnen.ai). Create cloud desktops, execute computer-use tools, and manage RDP sessions programmatically.

## Installation

```bash
npm install nen-sdk-js
```

## Quick Start

```typescript
import { NenDesktop } from "nen-sdk-js";

const client = new NenDesktop({ apiKey: "sk_nen_..." });

// Create a desktop
const desktop = await client.createDesktop();
console.log(`Created: ${desktop.desktopId} (status: ${desktop.status})`);

// Check its status
const status = await client.getDesktop(desktop.desktopId);
console.log(`Status: ${status.status}, IP: ${status.publicIp}`);

// Clean up
await client.deleteDesktop(desktop.desktopId);
```

## Configuration

```typescript
const client = new NenDesktop({
  apiKey: "sk_nen_...",
  baseUrl: "https://desktop.api.getnen.ai", // default
  timeout: 30_000,                           // default (milliseconds)
});
```

The `execute()` method uses a 120-second timeout regardless of the client timeout, since tool execution can be slow.

## API Reference

### Desktop CRUD

| Method | Description |
|--------|-------------|
| `createDesktop(desktopType?)` | Create a new desktop. Returns `Desktop`. |
| `listDesktops()` | List all active desktops. Returns `Desktop[]`. |
| `getDesktop(desktopId)` | Get a single desktop. Returns `Desktop`. |
| `updateDesktop(desktopId, { name })` | Update desktop name. Returns `Desktop`. |
| `deleteDesktop(desktopId)` | Delete a desktop. Returns `DeleteResponse`. |

### Tool Execution

| Method | Description |
|--------|-------------|
| `execute(desktopId, { tool, action, params? })` | Execute a tool action. Returns `ExecuteResult`. |
| `listTools(desktopId)` | List available tools. Returns `ToolSchema[]`. |
| `getToolLogs(desktopId)` | Get tool execution logs. Returns `unknown[]`. |

### Sessions

| Method | Description |
|--------|-------------|
| `createSession(desktopId)` | Create or reconnect an RDP session. Returns `SessionInfo`. |
| `getSession(desktopId)` | Get session status. Returns `SessionInfo`. |
| `deleteSession(desktopId)` | Disconnect the session. Returns `void`. |

## Error Handling

All API errors throw `NenDesktopError`, which carries `statusCode` and `responseBody`:

```typescript
import { NenDesktop, NenDesktopError } from "nen-sdk-js";

const client = new NenDesktop({ apiKey: "sk_nen_..." });

try {
  await client.getDesktop("dsk_nonexistent");
} catch (e) {
  if (e instanceof NenDesktopError) {
    console.log(`Error ${e.statusCode}: ${e.responseBody}`);
  }
}
```

## Zero Dependencies

This SDK uses the native `fetch` API (Node 20+, modern browsers) and has no runtime dependencies.

## Examples

See the full agent example in the [Nen documentation](https://docs.getnen.ai/examples/anthropic).

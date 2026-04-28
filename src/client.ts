import { NenDesktopError } from "./errors.js";
import type {
  DeleteResponse,
  Desktop,
  ExecuteResult,
  NenDesktopOptions,
  SessionInfo,
  ToolSchema,
} from "./types.js";

const DEFAULT_BASE_URL = "https://desktop.api.getnen.ai";
const DEFAULT_TIMEOUT = 30_000;
const EXECUTE_TIMEOUT = 120_000;

function toDesktop(raw: Record<string, unknown>): Desktop {
  return {
    desktopId: raw.desktop_id as string,
    desktopType: raw.desktop_type as string,
    status: raw.status as string,
    workspaceId: raw.workspace_id as string,
    instanceId: (raw.instance_id as string) ?? "",
    publicIp: (raw.public_ip as string) ?? "",
    privateIp: (raw.private_ip as string) ?? "",
    name: (raw.name as string) ?? "",
    controllerArn: (raw.controller_arn as string) ?? "",
    session: raw.session
      ? {
          href: (raw.session as Record<string, unknown>).href as string,
          active: (raw.session as Record<string, unknown>).active as boolean,
          interactive: (raw.session as Record<string, unknown>)
            .interactive as boolean,
        }
      : null,
    createdAt: (raw.created_at as number) ?? 0,
    updatedAt: (raw.updated_at as number) ?? 0,
  };
}

function toDeleteResponse(raw: Record<string, unknown>): DeleteResponse {
  return {
    desktopId: raw.desktop_id as string,
    status: raw.status as string,
  };
}

function toExecuteResult(raw: Record<string, unknown>): ExecuteResult {
  return {
    status: (raw.status as string) ?? "",
    output: (raw.output as string) ?? "",
    error: (raw.error as string) ?? "",
    base64Image: (raw.base64_image as string) ?? "",
  };
}

function toToolSchema(raw: Record<string, unknown>): ToolSchema {
  return {
    name: raw.name as string,
    description: raw.description as string,
    parameters: (raw.parameters as Record<string, unknown>) ?? {},
  };
}

function toSessionInfo(raw: Record<string, unknown>): SessionInfo {
  return {
    href: raw.href as string,
    active: raw.active as boolean,
    interactive: raw.interactive as boolean,
  };
}

export class NenDesktop {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeout: number;

  constructor(options: NenDesktopOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
  }

  // -- Desktops --

  async createDesktop(desktopType = "sandbox"): Promise<Desktop> {
    const resp = await this.request("POST", "/desktops", {
      body: { desktop_type: desktopType },
    });
    return toDesktop(resp);
  }

  async listDesktops(): Promise<Desktop[]> {
    const resp = await this.request("GET", "/desktops");
    return (resp as unknown as Record<string, unknown>[]).map(toDesktop);
  }

  async getDesktop(desktopId: string): Promise<Desktop> {
    const resp = await this.request("GET", `/desktops/${desktopId}`);
    return toDesktop(resp);
  }

  async updateDesktop(
    desktopId: string,
    options: { name: string },
  ): Promise<Desktop> {
    const resp = await this.request("PATCH", `/desktops/${desktopId}`, {
      body: { name: options.name },
    });
    return toDesktop(resp);
  }

  async deleteDesktop(desktopId: string): Promise<DeleteResponse> {
    const resp = await this.request("DELETE", `/desktops/${desktopId}`);
    return toDeleteResponse(resp);
  }

  // -- Execute / Tools --

  async execute(
    desktopId: string,
    options: {
      tool: string;
      action: string;
      params?: Record<string, unknown>;
    },
  ): Promise<ExecuteResult> {
    const resp = await this.request("POST", `/desktops/${desktopId}/execute`, {
      body: {
        action: {
          tool: options.tool,
          action: options.action,
          params: options.params ?? {},
        },
      },
      timeout: EXECUTE_TIMEOUT,
    });
    return toExecuteResult(resp);
  }

  // -- Computer-use action helpers --

  async screenshot(desktopId: string): Promise<ExecuteResult> {
    return this.execute(desktopId, { tool: "computer", action: "screenshot" });
  }

  async leftClick(desktopId: string, x: number, y: number): Promise<ExecuteResult> {
    return this.execute(desktopId, { tool: "computer", action: "left_click", params: { coordinate: [x, y] } });
  }

  async rightClick(desktopId: string, x: number, y: number): Promise<ExecuteResult> {
    return this.execute(desktopId, { tool: "computer", action: "right_click", params: { coordinate: [x, y] } });
  }

  async doubleClick(desktopId: string, x: number, y: number): Promise<ExecuteResult> {
    return this.execute(desktopId, { tool: "computer", action: "double_click", params: { coordinate: [x, y] } });
  }

  async middleClick(desktopId: string, x: number, y: number): Promise<ExecuteResult> {
    return this.execute(desktopId, { tool: "computer", action: "middle_click", params: { coordinate: [x, y] } });
  }

  async mouseMove(desktopId: string, x: number, y: number): Promise<ExecuteResult> {
    return this.execute(desktopId, { tool: "computer", action: "mouse_move", params: { coordinate: [x, y] } });
  }

  async typeText(desktopId: string, text: string): Promise<ExecuteResult> {
    return this.execute(desktopId, { tool: "computer", action: "type", params: { text } });
  }

  async keyPress(desktopId: string, key: string): Promise<ExecuteResult> {
    return this.execute(desktopId, { tool: "computer", action: "key", params: { text: key } });
  }

  async scroll(
    desktopId: string,
    x: number,
    y: number,
    options: { direction: "up" | "down"; amount?: number },
  ): Promise<ExecuteResult> {
    return this.execute(desktopId, {
      tool: "computer",
      action: "scroll",
      params: { coordinate: [x, y], direction: options.direction, amount: options.amount ?? 3 },
    });
  }

  async cursorPosition(desktopId: string): Promise<ExecuteResult> {
    return this.execute(desktopId, { tool: "computer", action: "cursor_position" });
  }

  async listTools(desktopId: string): Promise<ToolSchema[]> {
    const resp = await this.request("GET", `/desktops/${desktopId}/tools`);
    return (resp as unknown as Record<string, unknown>[]).map(toToolSchema);
  }

  async getToolLogs(desktopId: string): Promise<unknown[]> {
    const resp = await this.request("GET", `/desktops/${desktopId}/tool-logs`);
    return resp as unknown as unknown[];
  }

  // -- Sessions --

  async createSession(desktopId: string): Promise<SessionInfo> {
    const resp = await this.request("PUT", `/desktops/${desktopId}/session`);
    return toSessionInfo(resp);
  }

  async getSession(desktopId: string): Promise<SessionInfo> {
    const resp = await this.request("GET", `/desktops/${desktopId}/session`);
    return toSessionInfo(resp);
  }

  async deleteSession(desktopId: string): Promise<void> {
    await this.request("DELETE", `/desktops/${desktopId}/session`);
  }

  // -- Internal --

  private async request(
    method: string,
    path: string,
    options?: {
      body?: Record<string, unknown>;
      timeout?: number;
    },
  ): Promise<Record<string, unknown>> {
    const url = `${this.baseUrl}${path}`;
    const timeout = options?.timeout ?? this.timeout;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const init: RequestInit = {
        method,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          ...(options?.body ? { "Content-Type": "application/json" } : {}),
        },
        signal: controller.signal,
        ...(options?.body ? { body: JSON.stringify(options.body) } : {}),
      };

      const resp = await fetch(url, init);

      if (resp.status >= 400) {
        const body = await resp.text();
        throw new NenDesktopError(resp.status, body);
      }

      // 204 No Content — return empty object
      if (resp.status === 204) {
        return {};
      }

      return (await resp.json()) as Record<string, unknown>;
    } finally {
      clearTimeout(timer);
    }
  }
}

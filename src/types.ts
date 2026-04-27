export interface SessionInfo {
  href: string;
  active: boolean;
  interactive: boolean;
}

export interface Desktop {
  desktopId: string;
  desktopType: string;
  status: string;
  workspaceId: string;
  instanceId: string;
  publicIp: string;
  privateIp: string;
  name: string;
  controllerArn: string;
  session: SessionInfo | null;
  createdAt: number;
  updatedAt: number;
}

export interface DeleteResponse {
  desktopId: string;
  status: string;
}

export interface ExecuteResult {
  status: string;
  output: string;
  error: string;
  base64Image: string;
  [key: string]: unknown;
}

export interface ToolSchema {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface NenDesktopOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

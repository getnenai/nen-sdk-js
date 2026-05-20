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

/**
 * A single entry returned by `listFiles`. `modified` is a Unix-epoch number
 * with sub-second resolution.
 *
 * Note: this shadows the DOM `File` interface in browser-typed projects.
 * Import as `File as NenFile` if you need both.
 */
export interface File {
  name: string;
  size: number;
  modified: number;
}

/** Response from `uploadFile` (POST /desktops/{id}/files/{name}). */
export interface UploadFileResponse {
  success: boolean;
  size: number;
  filename: string;
}

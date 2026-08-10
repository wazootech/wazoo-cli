import { client } from "@wazoo/client";

export interface GlobalOptions {
  apiUrl?: string;
  token?: string;
  json?: boolean;
}

export function configureClient(options: GlobalOptions) {
  const baseUrl =
    options.apiUrl || process.env.WAZOO_API_URL || "https://api.wazoo.dev";
  const token =
    options.token || process.env.WAZOO_API_TOKEN || process.env.WORLDS_TOKEN;

  client.setConfig({
    baseUrl,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return { baseUrl, token };
}

export async function fetchWorldsData(
  endpointPath: string,
  method: "GET" | "POST",
  body?: unknown,
  options?: GlobalOptions,
) {
  const { token } = configureClient(options || {});
  const worldsApiBase =
    process.env.WORLDS_API_URL || "https://worlds-api.wazoo.dev";
  const url = `${worldsApiBase}${endpointPath}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Worlds API request failed [${response.status}]: ${errorText}`,
    );
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

export function formatOutput(data: unknown, jsonMode?: boolean) {
  if (jsonMode) {
    console.log(JSON.stringify(data, null, 2));
  } else if (typeof data === "string") {
    console.log(data);
  } else {
    console.dir(data, { depth: null, colors: true });
  }
}

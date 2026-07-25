import { client } from "@wazoo/client";

export interface GlobalOptions {
  apiUrl?: string;
  token?: string;
  json?: boolean;
}

export function configureClient(options: GlobalOptions) {
  const baseUrl = options.apiUrl || process.env.WAZOO_API_URL || "https://api.wazoo.dev";
  const token = options.token || process.env.WAZOO_API_TOKEN || process.env.WORLDS_TOKEN;

  client.setConfig({
    baseUrl,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return { baseUrl, token };
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

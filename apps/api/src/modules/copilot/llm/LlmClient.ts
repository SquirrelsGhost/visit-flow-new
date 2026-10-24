export interface LlmToolCall {
  id: string;
  name: string;
  /** JSON-Text, so wie das Modell ihn geschrieben hat. */
  arguments: string;
}

export type LlmMessage =
  | { role: "system" | "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: { id: string; type: "function"; function: { name: string; arguments: string } }[] }
  | { role: "tool"; tool_call_id: string; content: string };

/** Werkzeug im Format der Chat-Completions-API. */
export interface LlmTool {
  type: "function";
  function: { name: string; description: string; parameters: object };
}

/** Ein Stück der Antwort: Text sofort, Werkzeug-Aufrufe am Ende vollständig. */
export type LlmChunk = { type: "text"; text: string } | { type: "tool"; call: LlmToolCall };

export interface LlmStreamOptions {
  tools?: readonly LlmTool[];
  signal?: AbortSignal;
}

/** Sprachmodell hinter Enes. Tests setzen eine Attrappe ein, die feste Stücke streamt. */
export interface LlmClient {
  stream(messages: readonly LlmMessage[], options?: LlmStreamOptions): AsyncIterable<LlmChunk>;
}

export interface AzureOpenAiConfig {
  endpoint: string;
  apiKey: string;
  deployment: string;
  apiVersion: string;
}

const MAX_TOKENS = 600;
const TEMPERATURE = 0.7;

interface StreamDelta {
  content?: string;
  tool_calls?: { index: number; id?: string; function?: { name?: string; arguments?: string } }[];
}

/**
 * Liest "data: {...}"-Zeilen einer SSE-Antwort. Text geht sofort weiter, Werkzeug-Aufrufe kommen
 * in Stücken (Name, dann Argumente) und werden je Index gesammelt und am Ende ausgegeben.
 */
export async function* readSseChunks(body: ReadableStream<Uint8Array>): AsyncGenerator<LlmChunk> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const calls = new Map<number, LlmToolCall>();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const data = line.startsWith("data:") ? line.slice(5).trim() : "";
      if (!data || data === "[DONE]") continue;
      let delta: StreamDelta | undefined;
      try {
        delta = (JSON.parse(data) as { choices?: { delta?: StreamDelta }[] }).choices?.[0]?.delta;
      } catch {
        continue; // unvollständige Zeile: wird mit dem nächsten Stück erneut gelesen
      }
      if (delta?.content) yield { type: "text", text: delta.content };
      for (const part of delta?.tool_calls ?? []) {
        const call = calls.get(part.index) ?? { id: "", name: "", arguments: "" };
        calls.set(part.index, {
          id: part.id ?? call.id,
          name: call.name + (part.function?.name ?? ""),
          arguments: call.arguments + (part.function?.arguments ?? ""),
        });
      }
    }
  }
  for (const call of calls.values()) if (call.id && call.name) yield { type: "tool", call };
}

/**
 * Azure OpenAI (EU-Region wie in v1, gleiche Variablen AZURE_OPENAI_*), direkt über fetch und
 * ohne SDK. Antworten kommen gestreamt, Werkzeuge über Function Calling.
 */
export function azureOpenAiClient(config: AzureOpenAiConfig, fetchImpl: typeof fetch = fetch): LlmClient {
  const url = `${config.endpoint.replace(/\/$/, "")}/openai/deployments/${encodeURIComponent(config.deployment)}/chat/completions?api-version=${encodeURIComponent(config.apiVersion)}`;
  return {
    async *stream(messages, options = {}) {
      const tools = options.tools?.length ? { tools: options.tools, tool_choice: "auto" } : {};
      const response = await fetchImpl(url, {
        method: "POST",
        signal: options.signal,
        headers: { "Content-Type": "application/json", "api-key": config.apiKey },
        body: JSON.stringify({ messages, stream: true, max_tokens: MAX_TOKENS, temperature: TEMPERATURE, ...tools }),
      });
      if (!response.ok || !response.body) throw new Error(`Azure OpenAI antwortet mit ${response.status}`);
      yield* readSseChunks(response.body);
    },
  };
}

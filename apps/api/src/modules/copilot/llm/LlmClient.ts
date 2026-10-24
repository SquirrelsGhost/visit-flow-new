export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** Sprachmodell hinter Enes. Tests setzen eine Attrappe ein, die feste Wörter streamt. */
export interface LlmClient {
  /** Liefert die Antwort Stück für Stück, so wie das Modell sie erzeugt. */
  stream(messages: readonly LlmMessage[], signal?: AbortSignal): AsyncIterable<string>;
}

export interface AzureOpenAiConfig {
  endpoint: string;
  apiKey: string;
  deployment: string;
  apiVersion: string;
}

const MAX_TOKENS = 600;
const TEMPERATURE = 0.7;

/** Liest "data: {...}"-Zeilen einer SSE-Antwort und gibt die Text-Deltas weiter. */
export async function* readSseDeltas(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const data = line.startsWith("data:") ? line.slice(5).trim() : "";
      if (!data || data === "[DONE]") continue;
      try {
        const parsed = JSON.parse(data) as { choices?: { delta?: { content?: string } }[] };
        const text = parsed.choices?.[0]?.delta?.content;
        if (text) yield text;
      } catch {
        // unvollständige Zeile: wird mit dem nächsten Stück erneut gelesen
      }
    }
  }
}

/**
 * Azure OpenAI (EU-Region wie in v1, gleiche Variablen AZURE_OPENAI_*), direkt über fetch und
 * ohne SDK. Antworten kommen gestreamt.
 */
export function azureOpenAiClient(config: AzureOpenAiConfig, fetchImpl: typeof fetch = fetch): LlmClient {
  const url = `${config.endpoint.replace(/\/$/, "")}/openai/deployments/${encodeURIComponent(config.deployment)}/chat/completions?api-version=${encodeURIComponent(config.apiVersion)}`;
  return {
    async *stream(messages, signal) {
      const response = await fetchImpl(url, {
        method: "POST",
        signal,
        headers: { "Content-Type": "application/json", "api-key": config.apiKey },
        body: JSON.stringify({ messages, stream: true, max_tokens: MAX_TOKENS, temperature: TEMPERATURE }),
      });
      if (!response.ok || !response.body) throw new Error(`Azure OpenAI antwortet mit ${response.status}`);
      yield* readSseDeltas(response.body);
    },
  };
}

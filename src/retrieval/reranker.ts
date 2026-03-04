/**
 * MOD4: Reranker Provider
 *
 * 通过 HTTP 调用兼容 Cohere/Jina/OpenAI-style 的 rerank API，
 * 对检索候选文档进行交叉编码器重排序。
 */

import type { RerankProvider, RerankResult } from "./types";

/** 创建 RerankProvider 所需的配置 */
export interface RerankProviderConfig {
  /** Reranker API 端点 */
  baseURL: string;
  /** API Key */
  apiKey: string;
  /** 模型名称 */
  model: string;
  /** 请求超时（毫秒，默认 10000） */
  timeoutMs?: number;
}

/**
 * 创建基于 HTTP API 的 RerankProvider。
 *
 * 兼容 Cohere / Jina / 其他实现了 POST /rerank 的服务：
 * ```
 * POST {baseURL}/rerank
 * { model, query, documents, top_n }
 * → { results: [{ index, relevance_score }] }
 * ```
 */
export function createRerankProvider(config: RerankProviderConfig): RerankProvider {
  const { baseURL, apiKey, model, timeoutMs = 10_000 } = config;

  async function rerank(
    query: string,
    documents: string[],
    topK?: number
  ): Promise<RerankResult[]> {
    if (documents.length === 0) return [];

    const url = `${baseURL.replace(/\/+$/, "")}/rerank`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          query,
          documents,
          top_n: topK ?? documents.length,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Rerank API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as {
        results: Array<{
          index: number;
          relevance_score: number;
        }>;
      };

      return data.results.map((r) => ({
        index: r.index,
        score: r.relevance_score,
      }));
    } finally {
      clearTimeout(timer);
    }
  }

  return { rerank };
}

# 文本 / 嵌入 / 重排序

全部为同步接口（除非显式 `stream`）。鉴权 `Authorization: Bearer <API_KEY>`。精确字段回查 swagger 对应 path。

## OpenAI 兼容

| 端点 | 说明 | 关键字段 |
|------|------|----------|
| `POST /v1/chat/completions` | 对话补全（也被复用为「文生音乐 Chat 格式」如 `model: suno-v3`） | `model`*、`messages`*、`stream`、`temperature`、`top_p`、`max_tokens`、`tools`、`tool_choice`、`response_format` |
| `POST /v1/responses` | Responses API / 函数调用 | 见 swagger |
| `POST /v1/responses/compact` | 上下文压缩 | 见 swagger |
| `POST /v1/completions` | 传统文本补全 | `model`、`prompt` |
| `POST /v1/messages` | 文本合成（Anthropic messages 风格） | 见 swagger |
| `GET /v1/models` | 当前 key 支持的模型列表 | 无 body |

`messages` 为 `[{role, content}]`。`stream: true` 走 SSE，以 `data: [DONE]` 结束。

### chat/completions 示例
```json
{
  "model": "gpt-4o-mini",
  "messages": [{"role": "user", "content": "写一首情歌"}],
  "stream": false
}
```
响应取 `choices[0].message.content`，用量在 `usage`。

## Gemini 原生（`/v1beta/models/*`）

按模型名拼 path，动作后缀决定行为：

| 端点 | 用途 |
|------|------|
| `POST /v1beta/models/gemini-3-pro-preview:generateContent` | 文本生成 |
| `POST /v1beta/models/gemini-3-pro-preview:streamGenerateContent` | 流式文本生成 |
| `POST /v1beta/models/gemini-2.5-pro:streamGenerateContent` | 文本+思考（流） |
| `POST /v1beta/models/gemini-2.5-flash:generateContent` | google search 联网 |
| `POST /v1beta/models/gemini-2.5-pro:generateContent` | 视频理解(URL，开发中) |

请求体为 Gemini 原生格式（`contents: [{parts: [{text}]}]`），回查 swagger 对应 path 的 example。

## 嵌入 / 重排序

| 端点 | 说明 |
|------|------|
| `POST /v1/embeddings` | 文本嵌入（chat 兼容格式） |
| `POST /v1beta/models/gemini-embedding-001:embedContent` | Gemini 原生嵌入 |
| `POST /v1/rerank` | 重排序，输入 query + documents，返回相关度排序 |

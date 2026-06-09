# 语音 / 音乐 / 音频

含同步与异步。鉴权 `Authorization: Bearer <API_KEY>`。

## MiniMax（`/minimax/v1/*`）
| 端点 | 说明 |
|------|------|
| `POST /minimax/v1/t2a_v2` | 同步语音合成 V2 |
| `POST /minimax/v1/t2a_async_v2` | 异步语音合成 V2 |
| `GET /minimax/v1/query/t2a_async_query_v2` | 查询异步合成任务 |
| `POST /minimax/v1/files/retrieve` | 检索/下载（异步音频、视频结果） |
| `POST /minimax/v1/files` | 上传示例音频 |
| `POST /minimax/v1/voice_clone` | 音色快速复刻 |
| `POST /minimax/v1/voice_design` | 音色设计 |

`t2a_v2` 关键字段：`model`(如 speech-02-hd / speech-2.8-hd / speech-2.8-turbo)、`text`*、`stream`、`voice_setting{voice_id,speed,vol,pitch,emotion}`、`audio_setting{sample_rate,bitrate,format,channel}`、`pronunciation_dict`、`subtitle_enable`。文本可插语气词标签如 `(laughs)`、`(breath)`。

### t2a_v2 示例
```json
{
  "model": "speech-02-hd",
  "text": "你好，欢迎使用语音合成服务！",
  "voice_setting": {"voice_id": "male-qn-qingse", "speed": 1, "emotion": "happy"},
  "audio_setting": {"format": "mp3", "sample_rate": 32000}
}
```

## Suno 音乐（`/suno/*`，异步）
| 端点 | 说明 |
|------|------|
| `POST /suno/submit/music` | 生成歌曲（集成） |
| `POST /suno/submit/concat` | 拼接歌曲 |
| `POST /suno/submit/persona` | 创建歌手风格 Persona |
| `POST /suno/submit/lyrics` | 生成歌词 |
| `POST /suno/submit/upsample-tags` | 提升音乐风格 |
| `POST /suno/uploads/audio` | 上传参考音频 |
| `GET /suno/fetch/{task_id}` | 查询单个任务（主用） |

提交返回 task_id，轮询 `GET /suno/fetch/{task_id}` 取音频链接。
也可用 `POST /v1/chat/completions`（`model: suno-v3`）以 Chat 格式生成音乐。

## OpenAI 兼容音频（`/v1/audio/*`）
| 端点 | 说明 |
|------|------|
| `POST /v1/audio/speech` | 文本转语音（gpt-4o-mini-tts） |
| `POST /v1/audio/transcriptions` | 音频转文字（gpt-4o-transcribe） |
| `POST /v1/audio/translations` | 翻译（不支持） |

## Kling 音频（`/kling/v1/audio/*`）
`POST /kling/v1/audio/{text-to-audio,video-to-audio,tts}` 文生音效/视频生音效/语音合成，各配 `GET .../{id}` 查询；音色管理 `/kling/v1/general/{custom-voices,presets-voices,delete-voices}`。

# OpenAI 兼容 · 音频 · 参数字段

> 由 `scripts/gen_params.py` 从 swagger 自动生成。鉴权 `Authorization: Bearer <API_KEY>`。
> 字段名含 `.` 表示嵌套对象，`[]` 表示数组元素。说明过长已截断，完整内容见 swagger。

## POST `/v1/audio/speech`
_创建语音 gpt-4o-mini-tts_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 可用的 TTS 模型之一:tts-1 或 tts-1-hd |
| `input` | string | 是 | 要生成音频的文本。最大长度为4096个字符。 |
| `voice` | string | 是 | 生成音频时使用的语音。支持的语音有:alloy、echo、fable、onyx、nova 和 shimmer。 |
| `response_format` | string | 否 | 默认为 mp3 音频的格式。支持的格式有:mp3、opus、aac 和 flac。 |
| `speed` | number | 否 | 默认为 1 生成的音频速度。选择0.25到4.0之间的值。1.0是默认值。 |

示例：
```json
{
  "model": "gpt-4o-mini-tts",
  "input": "The quick brown fox jumped over the lazy dog.",
  "voice": "alloy"
}
```

## POST `/v1/audio/transcriptions`
_音频转文字 gpt-4o-transcribe_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file` | string | 是 | 要转录的音频文件对象(不是文件名),格式为:flac、mp3、mp4、mpeg、mpga、m4a、ogg、wav 或 webm。 |
| `model` | string | 是 | 要使用的模型 ID。目前只有 whisper-1,gpt-4o-mini-transcribe 是可用的。 |
| `language` | string | 否 | 输入音频的语言。以 ISO-639-1 格式提供输入语言可以提高准确性和延迟。 |
| `prompt` | string | 否 | 一个可选的文本来指导模型的风格或继续之前的音频段落。提示应该与音频语言匹配。 |
| `response_format` | string | 否 | 默认为 json 转录输出的格式,可选择:json、text |
| `temperature` | number | 否 | 默认为 0，采样温度,between 0 和 1。更高的值像 0.8 会使输出更随机,而更低的值像 0.2 会使其更集中和确定性。如果设置为 0,模型将使用对数概率自动增加温度直到达到特定阈值。 |

## POST `/v1/audio/translations`
_创建翻译 (不支持)_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file` | string | 是 | 要翻译的音频文件对象(不是文件名),格式为:flac、mp3、mp4、mpeg、mpga、m4a、ogg、wav 或 webm。 |
| `model` | string | 是 | 要使用的模型 ID。目前只有 whisper-1 是可用的。 |
| `prompt` | string | 否 | 一个可选的文本,用于指导模型的风格或继续之前的音频段落。提示文本应该是英文。 |
| `response_format` | string | 否 | 翻译结果的格式,可选择:json、text、srt、verbose_json 或 vtt。 |
| `temperature` | number | 否 | 默认为 0 采样温度,介于 0 和 1 之间。更高的值如 0.8 会使输出更随机,而较低的值如 0.2 会使其更聚焦和确定性。如果设置为 0,模型将使用对数概率自动提高温度直到达到特定阈值。 |

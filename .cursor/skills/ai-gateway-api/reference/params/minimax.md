# MiniMax (/minimax) · 参数字段

> 由 `scripts/gen_params.py` 从 swagger 自动生成。鉴权 `Authorization: Bearer <API_KEY>`。
> 字段名含 `.` 表示嵌套对象，`[]` 表示数组元素。说明过长已截断，完整内容见 swagger。

## POST `/minimax/v1/files`
_上传示例音频_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `purpose` | string | 是 | prompt_audio |
| `file` | string | 是 | 选择音频文件（mp3/m4a/wav） |

## GET `/minimax/v1/files/retrieve`
_检索(用于视频下载,异步音频下载)_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| file_id | query | 否 | string | 文件的唯一标识符。通过查询视频生成任务状态接口成功后返回的 file_id 获得 |

## GET `/minimax/v1/query/t2a_async_query_v2`
_查询语音生成任务状态_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| task_id | query | 否 | string |  |

## GET `/minimax/v1/query/video_generation`
_查询视频生成任务状态_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| task_id | query | 否 | string |  |

## POST `/minimax/v1/t2a_async_v2`
_创建异步语音合成任务 V2_

_请求体无显式字段定义，见 swagger 示例。_

示例：
```json
{
  "model": "speech-02-hd",
  "text": "真正的危险不是计算机开始像人一样思考，而是人开始像计算机一样思考。",
  "voice_setting": {
    "voice_id": "moss_audio_ce44fc67-7ce3-11f0-8de5-96e35d26fb85",
    "speed": 1,
    "vol": 1,
    "pitch": 0
  }
}
```

## POST `/minimax/v1/t2a_v2`
_同步语音合成 V2_

_请求体无显式字段定义，见 swagger 示例。_

示例：
```json
{
  "model": "speech-02-hd",
  "text": "你好，欢迎使用语音合成服务！",
  "voice_setting": {
    "voice_id": "moss_audio_ce44fc67-7ce3-11f0-8de5-96e35d26fb85"
  }
}
```

## POST `/minimax/v1/video_generation`
_首尾帧生成视频_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 模型名称。仅支持 MiniMax-Hailuo-02（注意：首尾帧生成功能不支持 512P 分辨率） |
| `last_frame_image` | string | 是 | 视频的结束帧图片。支持公网 URL 或 Base64 编码的 Data URL（data:image/jpeg;base64,...）。格式：JPG/JPEG/PNG/WebP，体积 < 20MB，短边 > 300px，长宽比 2:5 至 5:2 之间 |
| `first_frame_image` | string | 是 | 视频的起始帧图片。支持公网 URL 或 Base64 编码的 Data URL。格式要求同 last_frame_image。⚠️ 生成视频尺寸遵循首帧图片，首尾帧尺寸不一致时会按首帧裁剪尾帧 |
| `prompt` | string | 是 | 视频的文本描述，最大 2000 字符。 |
| `duration` | integer | 是 | 视频时长（秒）。可用值：6 或 10（10秒仅支持 768P） |
| `resolution` | string | 是 | 视频分辨率。可选值：768P（默认，支持 6s/10s）, 1080P（仅支持 6s |
| `prompt_optimizer` | boolean | 是 | 是否自动优化 prompt。设为 false 可进行更精确的控制 |
| `callback_url` | string | 是 | 接收任务状态更新通知的回调 URL。配置后会收到任务状态变更的异步通知 |
| `aigc_watermark` | boolean | 是 | 是否在生成的视频中添加 AIGC 水印 |

示例：
```json
{
  "model": "MiniMax-Hailuo-02",
  "last_frame_image": "https://filecdn.minimax.chat/public/97b7cd08-764e-4b8b-a7bf-87a0bd898575.jpeg",
  "first_frame_image": "https://filecdn.minimax.chat/public/fe9d04da-f60e-444d-a2e0-18ae743add33.jpeg",
  "prompt": "A little girl grow up [推进].",
  "duration": 6,
  "resolution": "1080P",
  "prompt_optimizer": true,
  "callback_url": "https://your-domain.com/api/video/callback",
  "aigc_watermark": false
}
```

## POST `/minimax/v1/voice_clone`
_音色快速复刻_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file_id` | integer | 是 | 待复刻音频的 file_id，通过文件上传接口获得。音频要求：mp3/m4a/wav 格式，10秒-5分钟，<20MB |
| `voice_id` | string | 是 | 自定义音色 ID（长度 8-256，首字符必须为字母，允许数字/字母/-/，末位不可为 -/ ） |
| `clone_prompt` | object | 否 | 示例音频对象，增强相似度和稳定性 |
| `clone_prompt.prompt_audio` | integer | 是 |  |
| `clone_prompt.prompt_text` | string | 是 |  |
| `text` | string | 否 | 复刻试听文本（限制 1000 字符，支持语气词标签） |
| `model` | string | 否 | 试听音频使用的语音模型 speech-2.6-hd, speech-2.6-turbo, speech-02-hd, speech-02-turbo |
| `language_boost` | string | 否 | 增强对指定语言/方言的识别能力。可设置为 auto 自动判断，或指定具体语言 |
| `need_noise_reduction` | boolean | 否 | 是否开启降噪 |
| `need_volume_normalization` | boolean | 否 | 是否开启音量归一化 |
| `aigc_watermark` | boolean | 否 | 是否在试听音频末尾添加音频节奏标识 |

示例：
```json
{
  "file_id": 365182159339614,
  "voice_id": "MyCustomVoice003",
  "clone_prompt": {
    "prompt_audio": 987654321,
    "prompt_text": "This voice sounds natural and pleasant."
  },
  "text": "A gentle breeze sweeps across the soft grass(breath), carrying the fresh scent along with the songs of birds.",
  "model": "speech-2.8-hd",
  "language_boost": "English",
  "need_noise_reduction": true,
  "need_volume_normalization": true,
  "aigc_watermark": false
}
```

## POST `/minimax/v1/voice_design`
_音色设计_

_请求体无显式字段定义，见 swagger 示例。_

示例：
```json
{
  "prompt": "讲述悬疑故事的播音员，声音低沉富有磁性。",
  "preview_text": "夜深了，古屋里只有他一人。窗外传来若有若无的脚步声，他屏住呼吸，慢慢地，慢慢地，走向那扇吱呀作响的门……",
  "voice_id": "yssj00043333",
  "aigc_watermark": false
}
```

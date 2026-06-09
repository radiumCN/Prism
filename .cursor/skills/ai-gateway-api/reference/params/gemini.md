# Gemini 原生 (/v1beta) · 参数字段

> 由 `scripts/gen_params.py` 从 swagger 自动生成。鉴权 `Authorization: Bearer <API_KEY>`。
> 字段名含 `.` 表示嵌套对象，`[]` 表示数组元素。说明过长已截断，完整内容见 swagger。

## POST `/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent`
_图片编辑_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| key | query | 是 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `contents` | array | 是 |  |
| `contents[].parts` | array | 否 |  |
| `contents[].parts[].text` | string | 否 |  |
| `contents[].parts[].inline_data` | object | 否 |  |
| `contents[].parts[].inline_data.mime_type` | string | 是 |  |
| `contents[].parts[].inline_data.data` | string | 是 |  |
| `generationConfig` | object | 是 |  |
| `generationConfig.responseModalities` | array | 是 |  |

示例：
```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "'Hi, This is a picture of me. Can you add a llama next to me"
        },
        {
          "inline_data": {
            "mime_type": "image/jpeg",
            "data": "iVBORw0KGgoAAAANSUhEUgAABAAAAAKoCAIAAABm4BptAAAAiXpUWHRSYXcgcHJvZmlsZSB0eXBlIGlwdGMAAAiZTYwxDgIxDAT7vOKekDjrtV1T0VHwgbtcIiEhgfh/QaDgmGlWW0w6X66n5fl6jNu9p+ULkapDENgzpj+Kl5aFfa6KnYWgSjZjGOiSYRxTY/v8KIijI/rXyc236kHdAK22RvHVummEN+91ML0BQ+siou79WmMAAAKHaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA1LjUuMCI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOklwdGM0eG1wRXh0PSJodHRwOi8vaXB0Yy5vcmcvc3RkL0lwdGM0eG1wRXh0LzIwMDgtMDItMjkvIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIElwdGM0eG1wRXh0OkRpZ2l0YWxTb3VyY2VGaWxlVHlwZT0iaHR0cDovL2N2LmlwdGMub3JnL25ld3Njb2Rlcy9kaWdpdGFsc291cmNldHlwZS90cmFpbmVkQWxnb3JpdGhtaWNNZWRpYSIgSXB0YzR4bXBFeHQ6RGlnaXRhbFNvdXJjZVR5cGU9Imh0dHA6Ly9jdi5pcHRjLm9yZy9uZXdzY2
...(截断)
```

## POST `/v1beta/models/gemini-2.5-flash-image:generateContent`
_图片生成 gemini-2.5-flash-image 控制宽高比_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| key | query | 是 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `contents` | array | 是 |  |
| `contents[].parts` | array | 否 |  |
| `contents[].parts[].text` | string | 否 |  |
| `contents[].parts[].inline_data` | object | 否 |  |
| `contents[].parts[].inline_data.mime_type` | string | 是 |  |
| `contents[].parts[].inline_data.data` | string | 是 |  |
| `generationConfig` | object | 是 |  |
| `generationConfig.responseModalities` | array | 是 |  |
| `generationConfig.imageConfig` | object | 是 |  |
| `generationConfig.imageConfig.aspectRatio` | string | 是 |  |

示例：
```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "'Hi, This is a picture of me. Can you add a llama next to me"
        },
        {
          "inline_data": {
            "mime_type": "image/jpeg",
            "data": "iVBORw0KGgoAAAANSUhEUgAABAAAAAKoCAIAAABm4BptAAAAiXpUWHRSYXcgcHJvZmlsZSB0eXBlIGlwdGMAAAiZTYwxDgIxDAT7vOKekDjrtV1T0VHwgbtcIiEhgfh/QaDgmGlWW0w6X66n5fl6jNu9p+ULkapDENgzpj+Kl5aFfa6KnYWgSjZjGOiSYRxTY/v8KIijI/rXyc236kHdAK22RvHVummEN+91ML0BQ+siou79WmMAAAKHaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA1LjUuMCI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOklwdGM0eG1wRXh0PSJodHRwOi8vaXB0Yy5vcmcvc3RkL0lwdGM0eG1wRXh0LzIwMDgtMDItMjkvIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIElwdGM0eG1wRXh0OkRpZ2l0YWxTb3VyY2VGaWxlVHlwZT0iaHR0cDovL2N2LmlwdGMub3JnL25ld3Njb2Rlcy9kaWdpdGFsc291cmNldHlwZS90cmFpbmVkQWxnb3JpdGhtaWNNZWRpYSIgSXB0YzR4bXBFeHQ6RGlnaXRhbFNvdXJjZVR5cGU9Imh0dHA6Ly9jdi5pcHRjLm9yZy9uZXdzY2
...(截断)
```

## POST `/v1beta/models/gemini-2.5-flash-preview-tts:generateContent`
_TTS 文本转语音_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| key | query | 是 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `contents` | array | 是 |  |
| `contents[].parts` | array | 否 |  |
| `contents[].parts[].text` | string | 否 |  |
| `contents[].parts[].inline_data` | object | 否 |  |
| `contents[].parts[].inline_data.mime_type` | string | 是 |  |
| `contents[].parts[].inline_data.data` | string | 是 |  |
| `generationConfig` | object | 是 |  |
| `generationConfig.responseModalities` | array | 是 |  |
| `generationConfig.imageConfig` | object | 是 |  |
| `generationConfig.imageConfig.aspectRatio` | string | 是 |  |

示例：
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "说出,我是谁,谁是我"
        }
      ]
    }
  ],
  "generationConfig": {
    "responseModalities": [
      "AUDIO"
    ],
    "speechConfig": {
      "voiceConfig": {
        "prebuiltVoiceConfig": {
          "voiceName": "Kore"
        }
      }
    }
  },
  "model": "gemini-2.5-flash-preview-tts"
}
```

## POST `/v1beta/models/gemini-2.5-flash:generateContent`
_google search_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| key | query | 是 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `contents` | array | 是 |  |
| `contents[].parts` | array | 否 |  |
| `contents[].parts[].inline_data` | object | 否 |  |
| `contents[].parts[].inline_data.mime_type` | string | 是 |  |
| `contents[].parts[].inline_data.data` | string | 是 |  |
| `contents[].parts[].text` | string | 否 |  |

示例：
```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "今天重庆天气如何?"
        }
      ]
    }
  ],
  "tools": [
    {
      "googleSearch": {}
    }
  ]
}
```

## POST `/v1beta/models/gemini-2.5-pro-preview-tts:generateContent`
_gemini-tts文本转语音_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| key | query | 是 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `contents` | array | 是 |  |
| `contents[].parts` | array | 否 |  |
| `contents[].parts[].text` | string | 否 |  |
| `generationConfig` | object | 是 |  |
| `generationConfig.responseModalities` | array | 是 |  |
| `generationConfig.speechConfig` | object | 是 |  |
| `generationConfig.speechConfig.voiceConfig` | object | 是 | 指定的声音角色的名字 |
| `generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig` | object | 是 |  |
| `generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName` | string | 是 |  |

示例：
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Say cheerfully: Have a wonderful day!"
        }
      ]
    }
  ],
  "generationConfig": {
    "responseModalities": [
      "AUDIO"
    ],
    "speechConfig": {
      "voiceConfig": {
        "prebuiltVoiceConfig": {
          "voiceName": "Kore"
        }
      }
    }
  }
}
```

## POST `/v1beta/models/gemini-2.5-pro:generateContent`
_视频理解-url [原生格式] 开发中_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| key | query | 是 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `contents` | array | 是 |  |
| `contents[].parts` | array | 否 |  |
| `contents[].parts[].inline_data` | object | 否 |  |
| `contents[].parts[].inline_data.mime_type` | string | 是 |  |
| `contents[].parts[].inline_data.data` | string | 是 |  |
| `contents[].parts[].text` | string | 否 |  |

示例：
```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "file_data": {
            "mime_type": "video/mp4",
            "file_uri": "https://generativelanguage.googleapis.com/v1beta/files/rsmb0ggleyv0"
          }
        },
        {
          "text": "Please summarize the video in 3 sentences."
        }
      ]
    }
  ]
}
```

## POST `/v1beta/models/gemini-2.5-pro:streamGenerateContent`
_文本生成+思考-流_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| key | query | 是 | string |  |
| alt | query | 否 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `contents` | array | 是 |  |
| `contents[].parts` | array | 否 |  |
| `contents[].parts[].text` | string | 否 |  |

示例：
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "1+2+3+4+5+....+999?"
        }
      ],
      "role": "user"
    }
  ],
  "systemInstruction": {
    "parts": [
      {
        "text": "hi"
      }
    ],
    "role": "user"
  },
  "safetySettings": [
    {
      "category": "HARM_CATEGORY_HATE_SPEECH",
      "threshold": "OFF"
    },
    {
      "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      "threshold": "OFF"
    },
    {
      "category": "HARM_CATEGORY_HARASSMENT",
      "threshold": "OFF"
    },
    {
      "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
      "threshold": "OFF"
    },
    {
      "category": "HARM_CATEGORY_CIVIC_INTEGRITY",
      "threshold": "BLOCK_NONE"
    }
  ],
  "tools": [],
  "generationConfig": {
    "temperature": 1,
    "topP": 1,
    "thinkingConfig": {
      "includeThoughts": true,
      "thinkingBudget": 26240
    }
  }
}
```

## POST `/v1beta/models/gemini-3-pro-image-preview:generateContent`
_图片生成 gemini-3-pro-image-preview 控制宽高比 +清晰度_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| key | query | 是 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `contents` | array | 是 |  |
| `contents[].parts` | array | 否 |  |
| `contents[].parts[].text` | string | 否 |  |
| `contents[].parts[].inline_data` | object | 否 |  |
| `contents[].parts[].inline_data.mime_type` | string | 是 |  |
| `contents[].parts[].inline_data.data` | string | 是 |  |
| `generationConfig` | object | 是 |  |
| `generationConfig.responseModalities` | array | 是 |  |
| `generationConfig.imageConfig` | object | 是 |  |
| `generationConfig.imageConfig.aspectRatio` | string | 是 |  |

示例：
```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "'Hi, This is a picture of me. Can you add a llama next to me"
        },
        {
          "inline_data": {
            "mime_type": "image/jpeg",
            "data": "iVBORw0KGgoAAAANSUhEUgAABAAAAAKoCAIAAABm4BptAAAAiXpUWHRSYXcgcHJvZmlsZSB0eXBlIGlwdGMAAAiZTYwxDgIxDAT7vOKekDjrtV1T0VHwgbtcIiEhgfh/QaDgmGlWW0w6X66n5fl6jNu9p+ULkapDENgzpj+Kl5aFfa6KnYWgSjZjGOiSYRxTY/v8KIijI/rXyc236kHdAK22RvHVummEN+91ML0BQ+siou79WmMAAAKHaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA1LjUuMCI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOklwdGM0eG1wRXh0PSJodHRwOi8vaXB0Yy5vcmcvc3RkL0lwdGM0eG1wRXh0LzIwMDgtMDItMjkvIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIElwdGM0eG1wRXh0OkRpZ2l0YWxTb3VyY2VGaWxlVHlwZT0iaHR0cDovL2N2LmlwdGMub3JnL25ld3Njb2Rlcy9kaWdpdGFsc291cmNldHlwZS90cmFpbmVkQWxnb3JpdGhtaWNNZWRpYSIgSXB0YzR4bXBFeHQ6RGlnaXRhbFNvdXJjZVR5cGU9Imh0dHA6Ly9jdi5pcHRjLm9yZy9uZXdzY2
...(截断)
```

## POST `/v1beta/models/gemini-3-pro-preview:generateContent`
_文本生成 gemini-3-pro-preview:generateContent_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| key | query | 是 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `contents` | array | 是 |  |
| `contents[].parts` | array | 否 |  |
| `contents[].parts[].text` | string | 否 |  |

示例：
```json
{
  "systemInstruction": {
    "parts": [
      {
        "text": "你是一直小猪.你会在回复开始的时候 加一个'哼哼'"
      }
    ]
  },
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "你是谁?"
        }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 1,
    "topP": 1,
    "thinkingConfig": {
      "includeThoughts": true,
      "thinkingBudget": 26240
    }
  }
}
```

## POST `/v1beta/models/gemini-3-pro-preview:streamGenerateContent`
_文本生成-流_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| key | query | 是 | string |  |
| alt | query | 否 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `contents` | array | 是 |  |
| `contents[].parts` | array | 否 |  |
| `contents[].parts[].text` | string | 否 |  |

示例：
```json
{
  "systemInstruction": {
    "parts": [
      {
        "text": "You are a cat. Your name is Neko."
      }
    ]
  },
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "Hello there"
        }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 1,
    "topP": 1,
    "thinkingConfig": {
      "includeThoughts": true,
      "thinkingBudget": 26240
    }
  }
}
```

## POST `/v1beta/models/gemini-embedding-001:embedContent`
_文本嵌入_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `content` | object | 是 | 要嵌入的内容。 |
| `content.parts` | array | 否 |  |
| `content.parts[].text` | string | 否 |  |
| `output_dimensionality` | integer | 否 | 输出嵌入的可选降维。 |
| `taskType` | string | 否 | 嵌入将用于的可选任务类型。 |

示例：
```json
{
  "content": {
    "parts": [
      {
        "text": "What is the meaning of life?"
      }
    ]
  },
  "output_dimensionality": 768,
  "taskType": "SEMANTIC_SIMILARITY"
}
```

## POST `/v1beta/models/imagen-4.0-generate-001:predict`
_Imagen 4 开发中_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| key | query | 是 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `instances` | array | 是 |  |
| `instances[].prompt` | string | 否 |  |
| `parameters` | object | 是 |  |
| `parameters.sampleCount` | integer | 是 |  |

示例：
```json
{
  "instances": [
    {
      "prompt": "小女孩"
    }
  ],
  "parameters": {
    "sampleCount": 4
  }
}
```

## POST `/v1beta/models/imagen-4.0-ultra-generate-001:predict`
_Imagen 生成图片_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| key | query | 是 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `contents` | array | 是 |  |
| `contents[].parts` | array | 否 |  |
| `contents[].parts[].inline_data` | object | 否 |  |
| `contents[].parts[].inline_data.mime_type` | string | 是 |  |
| `contents[].parts[].inline_data.data` | string | 是 |  |
| `contents[].parts[].text` | string | 否 |  |

示例：
```json
{
  "instances": [
    {
      "prompt": "Robot holding a red skateboard"
    }
  ],
  "parameters": {
    "sampleCount": 4
  }
}
```

## POST `/v1beta/models/veo-3.1-fast-generate-preview:predictLongRunning`
_视频生成 veo-3.1-fast-generate-preview_

## POST `/v1beta/models/{modeName}:generateContent`
_图片生成_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| modeName | path | 是 | string | 模型名称： gemini-2.5-flash-image gemini-2.5-flash-image-preview gemini-3-pro-image-preview gemini-3.1-flash-image-preview |
| key | query | 是 | string |  |

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `contents` | array | 是 |  |
| `contents[].parts` | array | 是 |  |
| `contents[].parts[].text` | string | 是 | 提示词 |
| `contents[].parts[].inline_data` | object | 否 | 图片内嵌数据 |
| `contents[].parts[].inline_data.mime_type` | string | 是 | 图片MIME类型 |
| `contents[].parts[].inline_data.data` | string | 是 | 图片 base64 追多支持传入 14 张图片 |
| `generationConfig` | object | 否 | 生成配置 |
| `generationConfig.responseModalities` | array | 否 | 响应模式： Text、Image 默认：["Text", "Image"] |
| `generationConfig.imageConfig` | object | 否 | 图片配置 |
| `generationConfig.imageConfig.aspectRatio` | string | 否 | 宽高比： 1:1、2:3、3:2、3:4、4:3、4:5、5:4、9:16、16:9、21:9 支持所有模型 1:4、1:8、4:1、8:1 这几个仅支持Gemini 3.1模型 |
| `generationConfig.imageConfig.imageSize` | string | 否 | 分辨率： 0.5K、1K、2K、4K 默认值：1K 注意：Gemini 2.5只支持1K，0.5K仅支持Gemini 3.1模型，值须填“512” |

示例：
```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "Hi, can you create a 3d rendered image of a pig with wings and a top hat flying over a happy futuristic scifi city with lots of greenery?"
        }
      ]
    }
  ],
  "generationConfig": {
    "responseModalities": [
      "IMAGE"
    ]
  }
}
```

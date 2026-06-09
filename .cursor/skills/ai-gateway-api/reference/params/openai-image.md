# OpenAI 兼容 · 图片 · 参数字段

> 由 `scripts/gen_params.py` 从 swagger 自动生成。鉴权 `Authorization: Bearer <API_KEY>`。
> 字段名含 `.` 表示嵌套对象，`[]` 表示数组元素。说明过长已截断，完整内容见 swagger。

## POST `/v1/images/edits`
_Flux编辑（OpenAI dall-e-3格式）_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `image` | string | 是 | 要编辑的图片。必须是受支持的图片文件或图片数组。对于 gpt-image-1，每张图片应为小于 25MB 的 png、webp 或 jpg 文件。对于 dall-e-2，您只能提供一张图片，并且该图片应为小于 4MB 的方形 png 文件。 |
| `prompt` | string | 是 | 所需图像的文本描述。dall-e-2 的最大长度为 1000 个字符，gpt-image-1 的最大长度为 32000 个字符。 |
| `mask` | string | 否 | 一张附加图片，其完全透明区域（例如，alpha 值为零）指示应编辑 image 位置。如果提供了多张图片，则遮罩将应用于第一张图片。必须是有效的 PNG 文件，小于 4MB，且尺寸与 image 相同。 |
| `model` | string | 否 | 用于生成图像的模型。仅 gpt-image-1, gpt-image-1-all , flux-kontext-pro , flux-kontext-max。 |
| `n` | string | 否 | 要生成的图像数量。必须介于 1 到 10 之间。 |
| `quality` | string | 否 | 生成图像的质量。只有 gpt-image-1 支持 high、medium 和 low 质量。dall-e-2 仅支持 standard 质量。默认为 auto。 |
| `response_format` | string | 否 | 返回生成图像的格式。必须是 url 或 b64_json 之一。URL 在图像生成后 60 分钟内有效。此参数仅适用于 dall-e-2，因为 gpt-image-1 始终返回 base64 编码的图像，请不要使用这个参数。 |
| `aspect_ratio` | string | 否 | 生成图像的尺寸。枚举值Possible enum values: 21:9, 16:9, 4:3, 3:2, 1:1, 2:3, 3:4, 9:16, 9:21 |
| `background` | string | 否 | 允许为生成的图像的背景设置透明度。此参数仅在 gpt-image-1 中受支持。其值必须为 “透明（transparent）”、“不透明（opaque）” 或 “自动（auto）”（默认值）之一。当使用 “自动（auto）” 时，模型将自动为图像确定最佳背景。 |
| `moderation` | string | 否 | 控制由 gpt-image-1 生成的图像的内容审核级别。可以设置为 “low” 以进行限制较少的过滤，也可以设置为 “auto”（默认值）。 |

示例：
```json
{
  "size": "1024x1024",
  "prompt": "一直可爱的小猪",
  "model": "gpt-image-1",
  "n": 1
}
```

## POST `/v1/images/generations`
_wan2.7-image-pro_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 |  |
| `prompt` | string | 是 | 提示词 |
| `size` | string | 是 |  |
| `n` | integer | 是 |  |
| `watermark` | boolean | 是 | 是否加水印 |
| `prompt_extend` | boolean | 是 | 是否优化提示词 |

示例：
```json
{
  "model": "wan2.7-image-pro",
  "prompt": "一只可爱的橘猫坐在窗台上，阳光洒在它身上，背景是城市风景",
  "n": 1,
  "size": "2K",
  "watermark": false
}
```

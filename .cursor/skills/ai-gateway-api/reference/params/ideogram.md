# Ideogram (/ideogram) · 参数字段

> 由 `scripts/gen_params.py` 从 swagger 自动生成。鉴权 `Authorization: Bearer <API_KEY>`。
> 字段名含 `.` 表示嵌套对象，`[]` 表示数组元素。说明过长已截断，完整内容见 swagger。

## POST `/ideogram/describe`
_Describe（描述）_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `image_file` | string | 否 | (必填) 源图片文件 |

示例：
```json
""
```

## POST `/ideogram/generate`
_ideogram（文生图）_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `image_request` | object | 是 | 图像请求对象 (必填) |
| `image_request.prompt` | string | 是 | 用于生成图像的提示词 (必填) |
| `image_request.aspect_ratio` | string | 是 | 图像宽高比 (可选) 可选值:ASPECT_10_16/ASPECT_16_10/ASPECT_9_16/ASPECT_16_9/ASPECT_3_2/ASPECT_2_3/ASPECT_4_3/ASPECT_3_4/ASPECT_1_1/ASPECT_1_3/ASPECT_3_1 |
| `image_request.model` | string | 是 | 使用的模型 (可选) 默认V_2,可选值:V_1/V_1_TURBO/V_2/V_2_TURBO |
| `image_request.magic_prompt_option` | string | 是 | 是否使用MagicPrompt (可选) 可选值:AUTO/ON/OFF |
| `image_request.seed` | integer | 是 | 随机种子 (可选) 范围:0-2147483647 |
| `image_request.style_type` | string | 是 | 风格类型 (可选) 可选值:AUTO/GENERAL/REALISTIC/DESIGN/RENDER_3D/ANIME |
| `image_request.negative_prompt` | string | 是 | 反向提示词 (可选) 描述不想在图像中出现的内容 |
| `image_request.num_images` | integer | 是 | 生成图片数量 (可选) 范围:1-8,默认1 |
| `image_request.resolution` | string | 是 | 分辨率 (可选) 可选值包含从512x1536到1536x640等多种分辨率组合 |
| `image_request.color_palette` | object | 是 | 颜色调色板 (可选) |
| `image_request.color_palette.name` | string | 是 | 预设调色板名称 (与members二选一) 可选值:EMBER/FRESH/JUNGLE/MAGIC/MELON/MOSAIC/PASTEL/ULTRAMARINE |

示例：
```json
{
  "image_request": {
    "aspect_ratio": "ASPECT_10_16",
    "magic_prompt_option": "AUTO",
    "model": "V_1",
    "prompt": "A serene tropical beach scene. Dominating the foreground are tall palm trees with lush green leaves, standing tall against a backdrop of a sandy beach. The beach leads to the azure waters of the sea, which gently kisses the shoreline. In the distance, there is an island or landmass with a silhouette of what appears to be a lighthouse or tower. The sky above is painted with fluffy white clouds, some of which are tinged with hues of pink and orange, suggesting either a sunrise or sunset."
  }
}
```

## POST `/ideogram/remix`
_Remix（混合图）_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `image_request` | string | 否 | "prompt": "a beautiful sunset over mountains", // 用于生成图像的提示词 (必填) "aspect_ratio": "ASPECT_16_9", // 图像宽高比 (可选) 可选值:ASPECT_10_16/ASPECT_16_10/ASPECT_9_16/ASPECT_… |
| `image_file` | string | 否 | 图片文件 (必填) 用于生成新图像的源图片文件 |

示例：
```json
""
```

## POST `/ideogram/upscale`
_Upscale（放大高清）_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `image_request` | string | 否 | "prompt": "a beautiful sunset over mountains", // 提示词用于指导放大 (可选) "resemblance": 50, // 相似度 (可选) 范围:1-100,默认50 "detail": 50, // 细节程度 (可选) 范围:1-100,默认50 "magic_pr… |
| `image_file` | string | 否 | 图片文件 (必填) 需要放大的源图片文件 |

示例：
```json
""
```

## POST `/ideogram/v1/ideogram-v3/edit`
_Generate 3.0（图片编辑）Edit_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `image` | string | 是 | 图像正在重新处理（最大大小为 10 兆字节）；目前仅支持 JPEG、WebP 和 PNG 格式。 |
| `mask` | string | 否 |  |
| `seed` | integer | 否 | 随机种子，范围0-2147483647，设置此值可获得可重复的结果 |
| `prompt` | string | 否 |  |

示例：
```json
""
```

## POST `/ideogram/v1/ideogram-v3/generate`
_Generate 3.0（文生图）Generate_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | 是 | 生成图像所需的提示文本 |
| `seed` | integer | 否 | 随机种子。设置此值可获得可重复的生成结果 |
| `resolution` | string | 否 | 支持的分辨率选项 枚举: 512x1536, 576x1408, 576x1472, 576x1536, 640x1344, 640x1408, 640x1472, 640x1536, 704x1152, 704x1216, 704x1280, 704x1344, 704x1408, 704x1472, 736x131… |
| `aspect_ratio` | string | 否 | 用于图像生成的纵横比，决定图像的分辨率。不能与resolution参数同时使用。默认为1x1 枚举: 1x3, 3x1, 1x2, 2x1, 9x16, 16x9, 10x16, 16x10, 2x3, 3x2, 3x4, 4x3, 4x5, 5x4, 1x1 |
| `rendering_speed` | string | 否 | 渲染速度选项 枚举: TURBO, DEFAULT, QUALITY |
| `magic_prompt` | string | 否 | 决定是否在生成请求时使用Magic Prompt 枚举: AUTO, ON, OFF |
| `negative_prompt` | string | 否 | 描述要在图像中排除的内容。提示中的描述优先于负面提示中的描述 |
| `num_images` | integer | 否 | 要生成的图像数量 |
| `color_palette` | object | 否 | 生成的颜色调色板，必须通过预设之一（name）或通过带有可选权重的颜色的十六进制表示（members）明确指定 |
| `style_codes` | array | 否 | 表示图像风格的8字符十六进制代码列表。不能与style_reference_images或style_type一起使用 |
| `style_type` | string | 否 | 要生成的风格类型 枚举: AUTO, GENERAL, REALISTIC, DESIGN |

示例：
```json
{
  "prompt": "voluptate reprehenderit",
  "seed": 511526458,
  "rendering_speed": "DEFAULT"
}
```

## POST `/ideogram/v1/ideogram-v3/reframe`
_Generate 3.0（图片重构）Reframe_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `image` | string | 是 | 图像正在重新处理（最大大小为 10 兆字节）；目前仅支持 JPEG、WebP 和 PNG 格式。 |
| `resolution` | string | 否 |  |

示例：
```json
""
```

## POST `/ideogram/v1/ideogram-v3/remix`
_Generate 3.0（图片重制）Remix_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `image` | string | 是 | 图像正在重新处理（最大大小为 10 兆字节）；目前仅支持 JPEG、WebP 和 PNG 格式。 |
| `prompt` | string | 否 |  |
| `num_images` | string | 否 |  |
| `rendering_speed` | string | 否 |  |

示例：
```json
""
```

## POST `/ideogram/v1/ideogram-v3/replace-background`
_Generate 3.0（替换背景） Replace Background_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `image` | string | 是 | 图像正在重新处理（最大大小为 10 兆字节）；目前仅支持 JPEG、WebP 和 PNG 格式。 |
| `prompt` | string | 否 |  |

示例：
```json
""
```

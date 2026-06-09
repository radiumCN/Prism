# Replicate (/replicate) · 参数字段

> 由 `scripts/gen_params.py` 从 swagger 自动生成。鉴权 `Authorization: Bearer <API_KEY>`。
> 字段名含 `.` 表示嵌套对象，`[]` 表示数组元素。说明过长已截断，完整内容见 swagger。

## POST `/replicate/v1/models/black-forest-labs/flux-1.1-pro-ultra/predictions`
_创建任务 black-forest-labs/flux-1.1-pro-ultra_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `input` | object | 否 |  |
| `input.raw` | boolean | 否 | 生成处理程度更低、更自然的图像。默认值：false。 |
| `input.prompt` | string | 是 | 图像生成的文字提示。 |
| `input.aspect_ratio` | string | 否 | 生成图像的长宽比，默认值：“1:1”。 |
| `input.output_format` | string | 否 | 输出图像的格式。默认值：“jpg”。 |
| `input.safety_tolerance` | integer | 否 | 安全容差。1 表示最严格，6 表示最宽松。默认值：2。 |
| `input.image_prompt_strength` | number | 否 | 提示与图像提示之间的混合。最小值：0，最大值：1。 |

示例：
```json
{
  "input": {
    "raw": false,
    "prompt": "a majestic snow-capped mountain peak bathed in a warm glow of the setting sun",
    "aspect_ratio": "3:2",
    "output_format": "jpg",
    "safety_tolerance": 2,
    "image_prompt_strength": 0.1
  }
}
```

## POST `/replicate/v1/models/black-forest-labs/flux-fill-dev/predictions`
_创建任务 black-forest-labs/flux-fill-dev_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `input` | object | 否 |  |
| `input.mask` | string | 否 | 一张黑白图像，用于描述需要修复的图像部分。黑色区域将被保留，白色区域将被修复。 |
| `input.image` | string | 是 | 待修复的图像。可包含 Alpha 蒙版。如果图像宽度或高度不是 32 的倍数，则会缩放至最接近的 32 倍数。如果图像尺寸超出 1440x1440 的范围，则会缩小以适应 1440x1440 的尺寸 |
| `input.prompt` | string | 是 | 提示生成图像。 |
| `input.guidance` | integer | 否 | 图像生成的引导信息。默认值：30。最小值：0，最大值：100。 |
| `input.lora_scale` | integer | 否 | 确定主 LoRA 的适用强度。对于基础推理，合理的结果介于 0 到 1 之间。对于 go_fast，我们对此值应用 1.5 倍乘数；通常情况下，将基础值按此倍数缩放时，性能会很好。您可能仍需要进行实验，以找到适合您特定 LoRA 的最佳值。默认值：1。最小值：-1，最大值：3。 |
| `input.megapixels` | string | 否 | 生成图像的近似像素数。使用 match_input 匹配输入的大小（上限为 1440x1440 像素），默认值：“1”。 |
| `input.num_outputs` | integer | 否 | 要生成的输出数量。默认值：1。最小值：1，最大值：4。 |
| `input.output_format` | string | 否 | 输出图像的格式。默认值：“webp”。 |
| `input.output_quality` | integer | 否 | 保存输出图像时的质量，范围为 0 至 100。100 为最佳质量，0 为最低质量。与 .png 输出无关。默认值：80 |
| `input.num_inference_steps` | integer | 否 | 去噪步数。建议范围为 28-50，步数越少，输出质量越低，但速度越快。默认值：28。最小值：1，最大值：50。 |

示例：
```json
{
  "input": {
    "mask": "https://replicate.delivery/pbxt/M0hxLu8a1YBcybWuumSsfoEec8ooer6JZ2fR28vuM1U0CN9m/74b40bb1-364a-461a-bec5-200a38c7bc87.png",
    "image": "https://replicate.delivery/pbxt/M0hxMJeO7wFCMr7QYNZsjRxzHhz6ntlLllMteRQNsRD7f3Nf/flux-fill-dev.webp",
    "prompt": "a spaceship",
    "guidance": 30,
    "lora_scale": 1,
    "megapixels": "1",
    "num_outputs": 2,
    "output_format": "webp",
    "output_quality": 80,
    "num_inference_steps": 28
  }
}
```

## POST `/replicate/v1/models/black-forest-labs/flux-fill-pro/predictions`
_创建任务 black-forest-labs/flux-fill-pro_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `input` | object | 否 |  |
| `input.mask` | string | 否 | 一张黑白图片，用于描述图片中需要修复的部分。黑色区域将被保留，白色区域将被修复。必须与图片大小相同。如果您在原始图片中提供了 Alpha 蒙版，则此参数可选。必须为 jpeg、png、gif 或 webp 格式。 |
| `input.image` | string | 是 | 待修复的图片。可以包含 Alpha 蒙版。必须为 jpeg、png、gif 或 webp 格式。 |
| `input.steps` | integer | 否 | 扩散步骤数。值越高，细节越精细，但处理时间也越长。默认值：50。最小值：15，最大值：50。 |
| `input.prompt` | string | 是 | 图像生成的文字提示。 |
| `input.guidance` | integer | 否 | 控制文本提示的遵循度与图像质量/多样性之间的平衡。值越高，输出结果越接近提示，但可能会降低整体图像质量。值越低，输出结果的创作自由度就越大，但可能与提示的相关性较低。默认值：60。最小值：1.5，最大值：100。 |
| `input.outpaint` | string | 否 | 用于对输入图像进行快速修复的选项。蒙版将被忽略。默认值："None" |
| `input.output_format` | string | 否 | 输出图像的格式。默认值：“jpg”。 |
| `input.safety_tolerance` | integer | 否 | 安全容差，1 表示最严格，6 表示最宽松。默认值：2。 |
| `input.prompt_upsampling` | boolean | 否 | 自动修改提示，生成更多创意。默认值：false |

示例：
```json
{
  "input": {
    "mask": "https://replicate.delivery/pbxt/M0gpLCYdCLbnhcz95Poy66q30XW9VSCN65DoDQ8IzdzlQonw/kill-bill-mask.png",
    "image": "https://replicate.delivery/pbxt/M0gpKVE9wmEtOQFNDOpwz1uGs0u6nK2NcE85IihwlN0ZEnMF/kill-bill-poster.jpg",
    "steps": 50,
    "prompt": "movie poster says \"FLUX FILL\"",
    "guidance": 60,
    "outpaint": "None",
    "output_format": "jpg",
    "safety_tolerance": 2,
    "prompt_upsampling": false
  }
}
```

## POST `/replicate/v1/models/black-forest-labs/flux-kontext-dev/predictions`
_创建任务 black-forest-labs/flux-kontext-dev_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `input` | object | 否 |  |
| `input.prompt` | string | 是 | 您想要生成的内容的文本描述，或有关如何编辑给定图像的说明。 |
| `input.go_fast` | boolean | 否 | 使模型运行速度更快，对于更困难的提示，输出质量可能会略有下降。默认值：true。 |
| `input.guidance` | number | 否 | 提示词引导强度。默认值: 2.5。最小值：0，最大值：10 |
| `input.input_image` | string | 是 | 用作参考的图片。必须是 jpeg、png、gif 或 webp 格式。 |
| `input.aspect_ratio` | string | 否 | 生成图像的长宽比。使用“match_input_image”来匹配输入图像的长宽比。默认值：“match_input_image”。 |
| `input.output_format` | string | 否 | 输出图像格式。默认值：“webp”。 |
| `input.output_quality` | integer | 否 | 保存输出图像时的质量，范围为 0 至 100。100 为最佳质量，0 为最低质量。与 .png 输出无关。默认值：80。最小值：0，最大值：100。 |
| `input.num_inference_steps` | integer | 否 | 推理步骤数，默认值：28。最小值：4，最大值：50。 |

示例：
```json
{
  "input": {
    "prompt": "Change the car color to red, turn the headlights on",
    "go_fast": true,
    "guidance": 2.5,
    "input_image": "https://replicate.delivery/pbxt/N5YURZv4ifaW2bMwU7hmrwzgtxf99DTQXpBeobLt1O7dEc3h/pexels-jmark-253096.jpg",
    "aspect_ratio": "match_input_image",
    "output_format": "jpg",
    "output_quality": 80,
    "num_inference_steps": 30
  }
}
```

## POST `/replicate/v1/models/black-forest-labs/flux-kontext-max/predictions`
_创建任务 black-forest-labs/flux-kontext-max_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `input` | object | 否 |  |
| `input.prompt` | string | 是 | 您想要生成的内容的文本描述，或有关如何编辑给定图像的说明。 |
| `input.input_image` | string | 否 | 用作参考的图片。必须是 jpeg、png、gif 或 webp 格式。 |
| `input.aspect_ratio` | string | 否 | 生成图像的长宽比。使用“match_input_image”来匹配输入图像的长宽比。默认值：“match_input_image”。 |
| `input.output_format` | string | 否 | 生成图像的输出格式。默认值：“png”。 |
| `input.safety_tolerance` | integer | 否 | 安全容差，0 最严格，6 最宽松。2 是目前使用输入图像时允许的最大值。默认值：2。最小值：0，最大值：6。 |
| `input.prompt_upsampling` | boolean | 否 | 自动提示改进。默认值：false。 |

示例：
```json
{
  "input": {
    "prompt": "Make the letters 3D, floating in space on a city street",
    "input_image": "https://replicate.delivery/xezq/XfwWjHJ7HfrmXE6ukuLVEpXWfeQ3PQeRI5mApuLXRxST7XMmC/tmpc91tlq20.png",
    "aspect_ratio": "match_input_image",
    "output_format": "jpg",
    "safety_tolerance": 2,
    "prompt_upsampling": false
  }
}
```

## POST `/replicate/v1/models/black-forest-labs/flux-kontext-pro/predictions`
_创建任务 black-forest-labs/flux-kontext-pro_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `input` | object | 否 |  |
| `input.prompt` | string | 是 | 您想要生成的内容的文本描述，或有关如何编辑给定图像的说明。 |
| `input.input_image` | string | 否 | 用作参考的图片。必须是 jpeg、png、gif 或 webp 格式。 |
| `input.aspect_ratio` | string | 否 | 生成图像的长宽比。使用“match_input_image”来匹配输入图像的长宽比。默认值：“match_input_image”，支持1:1，16:9，9:16，4:3，3:4，3:2，2:3，4:5，5:4，21:9，9:21，2:1，1:2。 |
| `input.output_format` | string | 否 | 生成图像的输出格式。默认值：“png”。 |
| `input.safety_tolerance` | integer | 否 | 安全容差，0 最严格，6 最宽松。2 是目前使用输入图像时允许的最大值。默认值：2 |
| `input.prompt_upsampling` | boolean | 否 | 自动提示改进。默认值：false。 |

示例：
```json
{
  "input": {
    "prompt": "Make this a 90s cartoon",
    "input_image": "https://replicate.delivery/pbxt/N55l5TWGh8mSlNzW8usReoaNhGbFwvLeZR3TX1NL4pd2Wtfv/replicate-prediction-f2d25rg6gnrma0cq257vdw2n4c.png",
    "aspect_ratio": "match_input_image",
    "output_format": "jpg",
    "safety_tolerance": 2,
    "prompt_upsampling": false
  }
}
```

## POST `/replicate/v1/models/bytedance/seedream-4/predictions`
_创建任务 bytedance/seedream-4_

_请求体无显式字段定义，见 swagger 示例。_

示例：
```json
{
  "input": {
    "size": "2K",
    "width": 2048,
    "height": 2048,
    "prompt": "a photo of a store front called i\"sedream 4\", it sells books, a poster in the window says i\"sedream 4 now on Replicate!\"",
    "max_images": 2,
    "image_input": [],
    "aspect_ratio": "4:3",
    "sequential_image_generation": "auto"
  }
}
```

## POST `/replicate/v1/models/flux-kontext-apps/multi-image-kontext-max/predictions`
_创建任务 flux-kontext-apps/multi-image-kontext-max_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `input` | object | 否 |  |
| `input.prompt` | string | 是 | 关于如何组合或转换两个输入图像的文本描述。 |
| `input.aspect_ratio` | string | 否 | 生成图像的长宽比。使用“match_input_image”来匹配输入图像的长宽比。默认值：“match_input_image” |
| `input.input_image_1` | string | 是 | 第一个输入图像。必须是 jpeg、png、gif 或 webp 格式。 |
| `input.input_image_2` | string | 是 | 第二个输入图像。必须是 jpeg、png、gif 或 webp 格式。 |
| `input.output_format` | string | 否 | 生成图像的输出格式。默认值：“png”。 |
| `input.safety_tolerance` | integer | 否 | 安全容差，0 表示最严格，2 表示最宽松。2 是目前允许的最大值。默认值：2 |

示例：
```json
{
  "input": {
    "prompt": "Put the woman into a white t-shirt with the text on it",
    "aspect_ratio": "1:1",
    "input_image_1": "https://replicate.delivery/pbxt/N5rSeJrCafWpmJuLb62moY8pSMEpSBBwSf7N6hxyIn4fNYMa/w8msa88d01rm80cq3hzsqrdehg.png",
    "input_image_2": "https://replicate.delivery/pbxt/N5rSdTCgBqIRvbkedcfLfS5xTSEEOqMtX9FsR1hLK9JYryml/0_1.webp",
    "output_format": "png",
    "safety_tolerance": 2
  }
}
```

## POST `/replicate/v1/models/flux-kontext-apps/multi-image-kontext-pro/predictions`
_创建任务 flux-kontext-apps/multi-image-kontext-pro_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `input` | object | 否 |  |
| `input.prompt` | string | 是 | 关于如何组合或转换两个输入图像的文本描述。 |
| `input.aspect_ratio` | string | 否 | 生成图像的长宽比。使用“match_input_image”来匹配输入图像的长宽比。默认值：“match_input_image” |
| `input.input_image_1` | string | 是 | 第一个输入图像。必须是 jpeg、png、gif 或 webp 格式。 |
| `input.input_image_2` | string | 是 | 第二个输入图像。必须是 jpeg、png、gif 或 webp 格式。 |
| `input.output_format` | string | 否 | 生成图像的输出格式。默认值：“png”。 |
| `input.safety_tolerance` | integer | 否 | 安全容差，0 表示最严格，2 表示最宽松。2 是目前允许的最大值。默认值：2。 |

示例：
```json
{
  "input": {
    "prompt": "Put the woman next to the house",
    "aspect_ratio": "match_input_image",
    "input_image_1": "https://replicate.delivery/pbxt/N7gRAUNcVF6HarL0hdAQA2JYNMlJD52LP1wyaIWRUXWeHzqT/0_1-1.webp",
    "input_image_2": "https://replicate.delivery/pbxt/N7gRAK5kbPwdsbOpqgyAIOFQX45U6suTlbL6ws2N74SnGFpo/test.jpg",
    "output_format": "png",
    "safety_tolerance": 2
  }
}
```

## POST `/replicate/v1/models/google/imagen-4-fast/predictions`
_创建任务 google/imagen-4-fast_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `input` | object | 否 |  |
| `input.prompt` | string | 是 | 图像生成的文字提示。 |
| `input.aspect_ratio` | string | 否 | 生成图像的长宽比。默认值：“1:1”。 |
| `input.output_format` | string | 否 | 输出图像的格式。默认值：“jpg”。 |
| `input.safety_filter_level` | string | 否 | block_low_and_above 是最严格的，block_medium_and_above 会阻止一些提示，block_only_high 是最宽松的，但一些提示仍然会被阻止。默认值：“block_only_high” |

示例：
```json
{
  "input": {
    "prompt": "The photo: Create a cinematic, photorealistic medium shot capturing the dynamic energy of a high-octane action film. The focus is a young woman with wind-swept dark hair streaked with pink highlights and determined features, looking directly and intently into the camera lens, she is slightly off-center. She wears a fitted pink and gold racing jacket over a black tank top with \"Imagen 4 Fast\" in motion-stylized lettering and on the next line \"on Replicate\" emblazoned across the chest and aviator sunglasses pushed up on her head. The lighting is dramatic with motion blur streaks and neon reflections from passing city lights, creating dynamic lens flares and light trails (they do not cover her face). The background shows a blurred urban nightscape with streaking car headlights and illuminated skyscrapers rushing past, rendered with heavy motion blur and shallow depth of field. High contrast lighting, vibrant neon color palette with deep blues and electric yellows, and razor-sharp focus on her intense eyes enhance the fast-paced, electrifying atmosphere. She is illuminated while the background is darker.",
    "aspect_ratio": "4:3",
    "output_format"
...(截断)
```

## POST `/replicate/v1/models/google/imagen-4-ultra/predictions`
_创建任务 google/imagen-4-ultra_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `input` | object | 否 |  |
| `input.prompt` | string | 是 | 图像生成的文字提示。 |
| `input.aspect_ratio` | string | 否 | 生成图像的长宽比。默认值：“1:1”。 |
| `input.output_format` | string | 否 | 输出图像的格式。默认值：“jpg” |
| `input.safety_filter_level` | string | 否 | block_low_and_above 是最严格的，block_medium_and_above 会阻止一些提示，block_only_high 是最宽松的，但一些提示仍然会被阻止。默认值：“block_only_high” |

示例：
```json
{
  "input": {
    "prompt": "The photo: Create a cinematic, photorealistic medium shot capturing the nostalgic warmth of a mid-2000s indie film. The focus is a young woman with a sleek, straight bob haircut in cool platinum white with freckled skin, looking directly and intently into the camera lens with a knowing smirk, her head is looking up slightly. She wears an oversized band t-shirt that says \"Imagen 4 Ultra on Replicate\" in huge stylized text over a long-sleeved striped top and simple silver stud earrings. The lighting is soft, golden hour sunlight creating lens flare and illuminating dust motes in the air. The background shows a blurred outdoor urban setting with graffiti-covered walls (the graffiti says \"ultra\" in stylized graffiti lettering), rendered with a shallow depth of field. Natural film grain, a warm, slightly muted color palette, and sharp focus on her expressive eyes enhance the intimate, authentic feel",
    "aspect_ratio": "16:9",
    "output_format": "jpg",
    "safety_filter_level": "block_only_high"
  }
}
```

## POST `/replicate/v1/models/google/imagen-4/predictions`
_创建任务 google/imagen-4_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `input` | object | 否 |  |
| `input.prompt` | string | 是 | 图像生成的文字提示。 |
| `input.aspect_ratio` | string | 否 | 生成图像的长宽比。默认值：“1:1”。支持：1:1，9:16，16:9，3:4，4:3 |
| `input.output_format` | string | 否 | 输出图像的格式。默认值：“jpg”。 |
| `input.safety_filter_level` | string | 否 | block_low_and_above 是最严格的，block_medium_and_above 会阻止一些提示，block_only_high 是最宽松的，但一些提示仍然会被阻止。默认值：“block_only_high” |

示例：
```json
{
  "input": {
    "prompt": "The photo: Create a cinematic, photorealistic medium shot capturing the nostalgic warmth of a late 90s indie film. The focus is a young woman with brightly dyed pink-gold hair and freckled skin, looking directly and intently into the camera lens with a hopeful yet slightly uncertain smile, she is slightly off-center. She wears an oversized, vintage band t-shirt that says \"Replicate\" (slightly worn) over a long-sleeved striped top and simple silver stud earrings. The lighting is soft, golden hour sunlight streaming through a slightly dusty window, creating lens flare and illuminating dust motes in the air. The background shows a blurred, cluttered bedroom with posters on the wall and fairy lights, rendered with a shallow depth of field. Natural film grain, a warm, slightly muted color palette, and sharp focus on her expressive eyes enhance the intimate, authentic feel",
    "aspect_ratio": "16:9",
    "output_format": "jpg",
    "safety_filter_level": "block_medium_and_above"
  }
}
```

## POST `/replicate/v1/models/ideogram-ai/ideogram-v2-turbo/predictions`
_创建任务 ideogram-ai/ideogram-v2-turbo_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `input` | object | 否 |  |
| `input.prompt` | string | 是 | 图像生成的文字提示。 |
| `input.resolution` | string | 否 | 分辨率。覆盖宽高比。如果指定了修复图像，则忽略该参数。默认值：“None”。 |
| `input.style_type` | string | 否 | 样式有助于定义您想要生成的图像的特定美感。默认值：“None”。 |
| `input.aspect_ratio` | string | 否 | 长宽比。如果指定了分辨率或修复图像，则忽略。默认值：“1:1”。 |
| `input.magic_prompt_option` | string | 否 | Magic Prompt 会解释您的提示并进行优化，以最大限度地提高生成的图像的多样性和质量。您还可以使用它用不同的语言编写提示。默认值：“Auto”。 |

示例：
```json
{
  "input": {
    "prompt": "An illustration of a gold running shoe with the text \"Run AI with an API\" written on the shoe. The shoe is placed on a pink background. The text is white and bold. The overall image has a modern and techy vibe, with elements of speed.",
    "resolution": "None",
    "style_type": "None",
    "aspect_ratio": "1:1",
    "magic_prompt_option": "Auto"
  }
}
```

## POST `/replicate/v1/models/minimax/video-01-live/predictions`
_创建任务 minimax/video-01-live_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `input` | object | 否 |  |
| `input.prompt` | string | 是 | 生成文本提示。 |
| `input.prompt_optimizer` | boolean | 否 | 使用提示优化器。默认值：true |
| `input.first_frame_image` | string | 是 | 用于生成视频的第一帧图像。输出视频将具有与该图像相同的宽高比。 |

示例：
```json
{
  "input": {
    "prompt": "a man is talking angrily",
    "prompt_optimizer": true,
    "first_frame_image": "https://replicate.delivery/pbxt/M9jlcXgeaypBr2yQYGf9JXgxUCJWRt8ODUDvt90UWPUsQBXC/back-to-the-future.png"
  }
}
```

## POST `/replicate/v1/models/minimax/video-01/predictions`
_创建任务 minimax/video-01_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `input` | object | 否 |  |
| `input.prompt` | string | 是 | 生成文本提示。 |
| `input.prompt_optimizer` | boolean | 否 | 使用提示优化器。默认值：true |

示例：
```json
{
  "input": {
    "prompt": "a woman is walking through a busy Tokyo street at night, she is wearing dark sunglasses",
    "prompt_optimizer": true
  }
}
```

## POST `/replicate/v1/models/prunaai/vace-14b/predictions`
_创建任务 prunaai/vace-14b_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `version` | string | 否 |  |
| `input` | object | 否 |  |
| `input.seed` | integer | 否 | 随机种子（-1 表示随机） |
| `input.size` | string | 否 | 输出分辨率。默认值：“832*480” |
| `input.prompt` | string | 是 | 文字描述。 |
| `input.src_mask` | string | 否 | 输入要编辑的蒙版视频或图像。 |
| `input.frame_num` | integer | 否 | 要生成的帧数。默认值：81。 |
| `input.src_video` | string | 否 | 输入要编辑的视频。 |
| `input.speed_mode` | string | 否 | 速度优化级别。默认值："Lightly Juiced 🍊 (more consistent)" |
| `input.sample_shift` | integer | 否 | 样本偏移。默认值：16 |
| `input.sample_steps` | integer | 否 | 示例步骤。默认值：50 |
| `input.sample_solver` | string | 否 | 样例求解器。默认值：“unipc” |
| `input.src_ref_images` | array | 否 | 输入参考图像进行编辑。 |
| `input.sample_guide_scale` | integer | 否 | 样本指引尺度。默认值：5 |

示例：
```json
{
  "version": "51299232dc3d0946d5f5ed74935d85243e172698f747d291460db1e6ef3669fb",
  "input": {
    "seed": -1,
    "size": "1280*720",
    "prompt": "The video shows a man riding a horse on a vast grassland. He has long lavender hair and wears a traditional dress of a white top and black pants. The animation style makes him look like he is doing some kind of outdoor activity or performing. The background is a spectacular mountain range and cloud sky, giving a sense of tranquility and vastness. The entire video is shot from a fixed angle, focusing on the rider and his horse.",
    "src_mask": "https://replicate.delivery/pbxt/N323tegI7AuoZmg0U5CuTKa7VBFC4gymhe0kT8Jk3o2sjUUj/src_mask.mp4",
    "frame_num": 81,
    "src_video": "https://replicate.delivery/pbxt/N323u1ljtNYyyaLrgw0ZLmXgepvWlBvxbJWi3sAa2VDPuNus/src_video.mp4",
    "speed_mode": "Extra Juiced 🚀 (even more speed)",
    "sample_shift": 16,
    "sample_steps": 50,
    "sample_solver": "unipc",
    "src_ref_images": [
      "https://replicate.delivery/pbxt/N323t5X69JB1MPD4w4cDIxK4rm0BG0W2JOWBrDrR4O9HTcyp/src_ref_image_1.png"
    ],
    "sample_guide_scale": 5
  }
}
```

## POST `/replicate/v1/models/recraft-ai/recraft-v3-svg/predictions`
_创建任务 recraft-ai/recraft-v3-svg_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `input` | object | 否 |  |
| `input.size` | string | 否 | 生成图像的宽度和高度。如果设置了宽高比，则忽略尺寸。默认值：“1024x1024” |
| `input.style` | string | 否 | 生成的图像的风格。默认值："any" |
| `input.prompt` | string | 是 | 图像生成的文字提示。 |
| `input.aspect_ratio` | string | 否 | 生成图像的长宽比。默认值："Not set" |

示例：
```json
{
  "input": {
    "size": "1024x1024",
    "style": "any",
    "prompt": "a portrait of a cute red panda using a laptop, the poster has the title \"Red panda is Recraft v3\", against a red background",
    "aspect_ratio": "Not set"
  }
}
```

## POST `/replicate/v1/models/recraft-ai/recraft-v3/predictions`
_创建任务 recraft-ai/recraft-v3_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `input` | object | 否 |  |
| `input.size` | string | 否 | 生成图像的宽度和高度。如果设置了宽高比，则忽略尺寸。默认值：“1024x1024” |
| `input.style` | string | 否 | 生成的图像的风格。默认值："any" |
| `input.prompt` | string | 是 | 图像生成的文字提示。 |
| `input.aspect_ratio` | string | 否 | 生成图像的长宽比。默认值："Not set" |

示例：
```json
{
  "input": {
    "size": "1365x1024",
    "style": "any",
    "prompt": "a wildlife photography photo of a red panda using a laptop in a snowy forest",
    "aspect_ratio": "Not set"
  }
}
```

## POST `/replicate/v1/models/riffusion/riffusion/predictions`
_创建任务 riffusion/riffusion_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `version` | string | 否 |  |
| `input` | object | 否 |  |
| `input.alpha` | number | 否 | 如果使用两个提示，则插值 alpha。值为 0 表示完全使用 prompt_a，值为 1 表示完全使用 prompt_b。默认值：0.5。最小值：0，最大值：1。 |
| `input.prompt_a` | string | 否 | 音频提示。 |
| `input.prompt_b` | string | 否 | 第二个提示与第一个提示进行插值，如果不进行插值则留空。 |
| `input.denoising` | number | 否 | 对输入频谱图进行多少转换。默认值：0.75。最小值：0，最大值：1。 |
| `input.seed_image_id` | string | 否 |  |
| `input.num_inference_steps` | integer | 否 | 运行扩散模型的步数。默认值：50。最低：1。 |

示例：
```json
{
  "version": "8cf61ea6c56afd61d8f5b9ffd14d7c216c0a93844ce2d82ac1c9ecc9c7f24e05",
  "input": {
    "alpha": 0.5,
    "prompt_a": "funky synth solo",
    "prompt_b": "90's rap",
    "denoising": 0.75,
    "seed_image_id": "vibes",
    "num_inference_steps": 50
  }
}
```

## POST `/replicate/v1/predictions`
_创建任务 lucataco/remove-bg_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `version` | string | 否 |  |
| `input` | object | 否 |  |
| `input.image` | string | 是 | 从此图像中删除背景。 |

示例：
```json
{
  "version": "95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1",
  "input": {
    "image": "https://replicate.delivery/pbxt/JWsRA6DxCK24PlMYK5ENFYAFxJGUQTLr0JmLwsLb8uhv1JTU/shoe.jpg"
  }
}
```

## GET `/replicate/v1/predictions/{任务id}`
_查询任务_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| 任务id | path | 是 | string |  |

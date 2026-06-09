# fal-ai (/fal-ai) · 参数字段

> 由 `scripts/gen_params.py` 从 swagger 自动生成。鉴权 `Authorization: Bearer <API_KEY>`。
> 字段名含 `.` 表示嵌套对象，`[]` 表示数组元素。说明过长已截断，完整内容见 swagger。

## POST `/fal-ai/bytedance/seedream/v4/edit`
_/fal-ai/bytedance/seedream/v4/edit_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | 是 | 提示词 |
| `image_size` | object | 否 | 图片尺寸，宽高取值范围必须在：1024-4096. |
| `image_size.height` | integer | 是 |  |
| `image_size.width` | integer | 是 |  |
| `num_images` | integer | 否 | 生成图片数量：1-6 |
| `enable_safety_checker` | boolean | 否 | 启用安全检查，默认值：true |
| `image_urls` | array | 是 | 图片url |

示例：
```json
{
  "prompt": "Dress the model in the clothes and shoes.",
  "image_size": {
    "height": 1280,
    "width": 1280
  },
  "num_images": 1,
  "enable_safety_checker": true,
  "image_urls": [
    "https://storage.googleapis.com/falserverless/example_inputs/seedream4_edit_input_1.png",
    "https://storage.googleapis.com/falserverless/example_inputs/seedream4_edit_input_2.png",
    "https://storage.googleapis.com/falserverless/example_inputs/seedream4_edit_input_3.png",
    "https://storage.googleapis.com/falserverless/example_inputs/seedream4_edit_input_4.png"
  ]
}
```

## POST `/fal-ai/bytedance/seedream/v4/text-to-image`
_/fal-ai/bytedance/seedream/v4/text-to-image_

_请求体无显式字段定义，见 swagger 示例。_

示例：
```json
{
  "prompt": "Draw a chart showing the typical vegetation distribution in four different climate zones: tropical rainforest, temperate forest, desert, and tundra.",
  "image_size": {
    "height": 1280,
    "width": 1280
  },
  "num_images": 1,
  "enable_safety_checker": true
}
```

## POST `/fal-ai/flux-1/dev`
_/fal-ai/flux-1/dev_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | 是 |  |
| `image_size` | string | 否 | 生成图像的大小。默认值：landscape_4_3 范围（3：4、4：3、16：9、9：16） |
| `num_inference_steps` | integer | 否 | 要执行的推理步骤数。默认值：28 .范围值：0-50 |
| `guidance_scale` | number | 否 | CFG（无分类器引导）量表衡量了您希望模型在寻找相关图像时与提示的贴近程度。默认值：3.5 .范围值：1-20 |
| `num_images` | integer | 否 | 生成的图像数量。默认值：1 范围值：1-4 |
| `enable_safety_checker` | boolean | 否 | 如果设置为 true，则启用安全检查器。默认值：true |
| `output_format` | string | 否 | 生成图片的格式。默认值："jpeg" .支持的格式default、JPEG、png |
| `acceleration` | string | 否 | 生成速度。速度越高，生成速度越快。默认值："regular" 。支持：default、none、regular、high |

示例：
```json
{
  "prompt": "Extreme close-up of a single tiger eye, direct frontal view. Detailed iris and pupil. Sharp focus on eye texture and color. Natural lighting to capture authentic eye shine and depth. The word \"FLUX\" is painted over it in big, white brush strokes with visible texture.",
  "image_size": "landscape_4_3",
  "num_inference_steps": 28,
  "guidance_scale": 3.5,
  "num_images": 1,
  "enable_safety_checker": true,
  "output_format": "jpeg",
  "acceleration": "regular"
}
```

## POST `/fal-ai/flux-1/dev/image-to-image`
_/fal-ai/flux-1/dev/image-to-image_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `image_url` | string | 是 | 在此处拖放文件，或提供 base64 编码的数据 URL接受的文件类型：jpg、jpeg、png、webp、gif、avif |
| `strength` | number | 否 | 初始图像的强度。强度值越高，该模型的效果越好。默认值：0.95 范围值0.01-1 |
| `num_inference_steps` | integer | 否 | 要执行的推理步骤数。默认值：40 范围值10-50 |
| `prompt` | string | 是 | 生成图像的提示 |
| `guidance_scale` | number | 否 | CFG（无分类器引导）量表用于衡量您希望模型在寻找相关图像时与提示的贴近程度。默认值：3.5 范围值1-20 |
| `num_images` | integer | 否 | 生成的图像数量。默认值：1 范围值1-4 |
| `enable_safety_checker` | boolean | 否 |  |
| `output_format` | string | 否 | 生成图片的格式。默认值："jpeg" 支持default、png、jpeg |
| `acceleration` | string | 否 | 生成速度。速度越高，生成速度越快。默认值："regular" 支持default、none、regular、high |

示例：
```json
{
  "image_url": "https://fal.media/files/koala/Chls9L2ZnvuipUTEwlnJC.png",
  "strength": 0.95,
  "num_inference_steps": 40,
  "prompt": "A cat dressed as a wizard with a background of a mystic forest.",
  "guidance_scale": 3.5,
  "num_images": 1,
  "enable_safety_checker": true,
  "output_format": "jpeg",
  "acceleration": "regular"
}
```

## POST `/fal-ai/flux-1/dev/redux`
_/fal-ai/flux-1/dev/redux_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `image_url` | string | 是 | 在此处拖放文件，或提供 base64 编码的数据 URL接受的文件类型：jpg、jpeg、png、webp、gif、avif |
| `image_size` | string | 否 | 生成图像的大小。默认值：landscape_4_3 范围（3：4、4：3、16：9、9：16） |
| `num_inference_steps` | integer | 否 | 要执行的推理步骤数。默认值：28 范围值：1-50 |
| `guidance_scale` | number | 否 | CFG（无分类器引导）量表衡量了您希望模型在寻找相关图像时与提示的贴近程度。默认值：3.5 范围值1-20 |
| `num_images` | integer | 否 | 生成的图像数量。默认值：1 范围值1-4 |
| `enable_safety_checker` | boolean | 否 | 如果设置为 true，则启用安全检查器。默认值：true |
| `output_format` | string | 否 | 生成图片的格式。默认值："jpeg" 支持default、png、jpeg |
| `acceleration` | string | 否 | 生成速度。速度越高，生成速度越快。默认值："regular" 支持default、none、regular、high |

示例：
```json
{
  "image_url": "https://fal.media/files/kangaroo/acQvq-Kmo2lajkgvcEHdv.png",
  "image_size": "landscape_4_3",
  "num_inference_steps": 28,
  "guidance_scale": 3.5,
  "num_images": 1,
  "enable_safety_checker": true,
  "output_format": "jpeg",
  "acceleration": "regular"
}
```

## POST `/fal-ai/flux-1/schnell/redux`
_/fal-ai/flux-1/schnell/redux_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `image_url` | string | 是 | 在此处拖放文件，或提供 base64 编码的数据 URL接受的文件类型：jpg、jpeg、png、webp、gif、avif |
| `num_inference_steps` | integer | 否 | 要执行的推理步骤数。默认值：4 范围值：1-12 |
| `image_size` | string | 否 | 生成图像的大小。默认值：landscape_4_3 范围（3：4、4：3、16：9、9：16） |
| `num_images` | integer | 否 | 生成的图像数量。默认值：1 范围值1-4 |
| `enable_safety_checker` | boolean | 否 | 如果设置为 true，则启用安全检查器。默认值：true |
| `output_format` | string | 否 | 生成图片的格式。默认值："jpeg" 支持default、png、jpeg |
| `acceleration` | string | 否 | 生成速度。速度越高，生成速度越快。默认值："regular" 支持default、none、regular、high |

示例：
```json
{
  "image_url": "https://fal.media/files/kangaroo/acQvq-Kmo2lajkgvcEHdv.png",
  "num_inference_steps": 4,
  "image_size": "landscape_4_3",
  "num_images": 1,
  "enable_safety_checker": true,
  "output_format": "jpeg",
  "acceleration": "regular"
}
```

## POST `/fal-ai/flux-lora`
_/fal-ai/flux-lora_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | 是 | 提示词 |
| `image_size` | string | 否 | 图片尺寸，枚举值：square、square pro、landscape_4_3、landscape_16_9、portrait_3_4 |
| `num_inference_steps` | integer | 否 | 范围值：1-50 |
| `guidance_scale` | number | 否 | 范围值：0-35 |
| `num_images` | integer | 否 | 图片数量，范围值：1-4 |
| `enable_safety_checker` | boolean | 否 | 启用安全检查，默认值：true |
| `output_format` | string | 否 | 输出图片格式，支持：jpeg、png |

示例：
```json
{
  "prompt": "Extreme close-up of a single tiger eye, direct frontal view. Detailed iris and pupil. Sharp focus on eye texture and color. Natural lighting to capture authentic eye shine and depth. The word \"FLUX\" is painted over it in big, white brush strokes with visible texture.",
  "image_size": "landscape_4_3",
  "num_inference_steps": 28,
  "guidance_scale": 3.5,
  "num_images": 1,
  "enable_safety_checker": true,
  "output_format": "jpeg"
}
```

## POST `/fal-ai/flux-lora/image-to-image`
_/fal-ai/flux-lora/image-to-image_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | 是 | 提示词 |
| `num_inference_steps` | integer | 否 | 范围值：1-50 |
| `guidance_scale` | number | 否 | 范围值：0-35 |
| `num_images` | integer | 否 | 图片数量，范围值：1-4 |
| `enable_safety_checker` | boolean | 否 | 启用安全检查，默认值：true |
| `output_format` | string | 否 | 输出图片格式，支持：jpeg、png |
| `image_url` | string | 是 | 图片url，接受的文件类型：jpg、jpeg、png、webp、gif、avif |
| `strength` | number | 否 | 强度，范围值：0.01-1 |

示例：
```json
{
  "prompt": "A photo of a lion sitting on a stone bench",
  "num_inference_steps": 28,
  "guidance_scale": 3.5,
  "num_images": 1,
  "enable_safety_checker": true,
  "output_format": "jpeg",
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/dog.png",
  "strength": 0.85
}
```

## POST `/fal-ai/flux-lora/inpainting`
_/fal-ai/flux-lora/inpainting_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | 是 | 提示词 |
| `num_inference_steps` | integer | 否 | 范围值：1-50 |
| `guidance_scale` | number | 否 | 范围值：0-35 |
| `num_images` | integer | 否 | 图片数量，范围值：1-4 |
| `enable_safety_checker` | boolean | 否 | 启用安全检查，默认值：true |
| `output_format` | string | 否 | 输出图片格式，支持：jpeg、png |
| `image_url` | string | 是 | 图片url，接受的文件类型：jpg、jpeg、png、webp、gif、avif |
| `strength` | number | 否 | 强度，范围值：0.01-1 |
| `mask_url` | string | 是 | 蒙版url，接受的文件类型：jpg、jpeg、png、webp、gif、avif |

示例：
```json
{
  "prompt": "A photo of a lion sitting on a stone bench",
  "num_inference_steps": 28,
  "guidance_scale": 3.5,
  "num_images": 1,
  "enable_safety_checker": true,
  "output_format": "jpeg",
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/dog.png",
  "strength": 0.85,
  "mask_url": "https://storage.googleapis.com/falserverless/example_inputs/dog_mask.png"
}
```

## POST `/fal-ai/flux-pro/kontext`
_/fal-ai/flux-pro/kontext_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | 是 | 生成图像的提示 |
| `guidance_scale` | number | 否 | CFG（无分类器引导）量表用于衡量您希望模型在寻找相关图像时与提示的贴近程度。默认值：3.5 范围值1-20 |
| `num_images` | integer | 否 | 生成的图像数量。默认值：1 范围值1-4 |
| `output_format` | string | 否 | 生成图片的格式。默认值："jpeg" 支持default、png、jpeg |
| `safety_tolerance` | string | 否 | 生成图像的安全容差等级。1 表示最严格，5 表示最宽松。默认值："2" |
| `image_url` | string | 是 | 在此处拖放文件，或提供 base64 编码的数据 URL接受的文件类型：jpg、jpeg、png、webp、gif、avif |

示例：
```json
{
  "prompt": "Put a donut next to the flour.",
  "guidance_scale": 3.5,
  "num_images": 1,
  "output_format": "jpeg",
  "safety_tolerance": "2",
  "image_url": "https://v3.fal.media/files/rabbit/rmgBxhwGYb2d3pl3x9sKf_output.png"
}
```

## POST `/fal-ai/flux-pro/kontext/max`
_/fal-ai/flux-pro/kontext/max_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | 是 | 提示词 |
| `seed` | integer | 否 |  |
| `guidance_scale` | number | 否 | 范围值：1-20 |
| `sync_mode` | boolean | 否 | 同步模式 |
| `num_images` | integer | 否 | 输出图片数量，范围值：1-4 |
| `safety_tolerance` | string | 否 | 安全容差 |
| `output_format` | string | 是 | 图片输出格式："jpeg"，"png" |
| `aspect_ratio` | string | 否 | 图片尺寸，枚举值：21:9、16:9、4:3、3:2、1:1、2:3、3:4、9:16、9:21 |
| `image_url` | string | 是 | 图片URL |

示例：
```json
{
  "prompt": "Put a donut next to the flour.",
  "seed": 0,
  "guidance_scale": 3.5,
  "sync_mode": false,
  "num_images": 1,
  "safety_tolerance": "2",
  "output_format": "jpeg",
  "aspect_ratio": "string",
  "image_url": "https://v3.fal.media/files/rabbit/rmgBxhwGYb2d3pl3x9sKf_output.png"
}
```

## POST `/fal-ai/flux-pro/kontext/max/multi`
_/fal-ai/flux-pro/kontext/max/multi_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | 是 | 提示词 |
| `guidance_scale` | number | 否 | 范围值：1-20 |
| `num_images` | integer | 否 | 生成图片数量，范围值：1-4 |
| `output_format` | string | 否 | 图片输出格式："jpeg"，"png" |
| `safety_tolerance` | string | 否 | 安全容差 |
| `image_urls` | array | 是 | 图片URL |

示例：
```json
{
  "prompt": "Put the little duckling on top of the woman's t-shirt.",
  "guidance_scale": 3.5,
  "num_images": 1,
  "output_format": "jpeg",
  "safety_tolerance": "2",
  "image_urls": [
    "https://v3.fal.media/files/penguin/XoW0qavfF-ahg-jX4BMyL_image.webp",
    "https://v3.fal.media/files/tiger/bml6YA7DWJXOigadvxk75_image.webp"
  ]
}
```

## POST `/fal-ai/flux-pro/kontext/text-to-image`
_/fal-ai/flux-pro/kontext/text-to-image_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | 是 | 生成图像的提示。 |
| `guidance_scale` | number | 否 | CFG（无分类器引导）量表用于衡量您希望模型在寻找相关图像时与提示的贴近程度。默认值：3.5 范围值1-20 |
| `num_images` | integer | 否 | 生成的图像数量。默认值：1 范围值1-4 |
| `output_format` | string | 否 | 生成图片的格式。默认值："jpeg" 支持default、png、jpeg |
| `safety_tolerance` | string | 否 | 生成图像的安全容差等级。1 表示最严格，5 表示最宽松。默认值："2" |
| `aspect_ratio` | string | 否 | 生成图像的宽高比。默认值："1:1" 支持：21：9、16：9、4：3、3：2、1：1、2：3、3：4、9：16、9：21 |

示例：
```json
{
  "prompt": "Extreme close-up of a single tiger eye, direct frontal view. Detailed iris and pupil. Sharp focus on eye texture and color. Natural lighting to capture authentic eye shine and depth. The word \"FLUX\" is painted over it in big, white brush strokes with visible texture.",
  "guidance_scale": 3.5,
  "num_images": 1,
  "output_format": "jpeg",
  "safety_tolerance": "2",
  "aspect_ratio": "1:1"
}
```

## POST `/fal-ai/imagen4/preview`
_/fal-ai/imagen4/preview_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | 是 | 提示词 |
| `aspect_ratio` | string | 否 | 图片比例，枚举值：1：1、16：9、9：16、3：4、4：3 |
| `num_images` | integer | 否 | 生成图片数量，范围值：1-4 |
| `resolution` | string | 否 | 分辨率：枚举值："1K"、"2K" |

示例：
```json
{
  "prompt": "Capture an intimate close-up bathed in warm, soft, late-afternoon sunlight filtering into a quintessential 1960s kitchen. The focal point is a charmingly designed vintage package of all-purpose flour, resting invitingly on a speckled Formica countertop. The packaging itself evokes pure nostalgia: perhaps thick, slightly textured paper in a warm cream tone, adorned with simple, bold typography (a friendly serif or script) in classic red and blue “ALL-PURPOSE FLOUR”, featuring a delightful illustration like a stylized sheaf of wheat or a cheerful baker character. In smaller bold print at the bottom of the package: “NET WT 5 LBS (80 OZ) 2.27kg”. Focus sharply on the package details – the slightly soft edges of the paper bag, the texture of the vintage printing, the inviting \"All-Purpose Flour\" text. Subtle hints of the 1960s kitchen frame the shot – the chrome edge of the counter gleaming softly, a blurred glimpse of a pastel yellow ceramic tile backsplash, or the corner of a vintage metal canister set just out of focus. The shallow depth of field keeps attention locked on the beautifully designed package, creating an aesthetic rich in warmth, authenticity, and nostal
...(截断)
```

## POST `/fal-ai/kling-video/v2.5-turbo/pro/image-to-video`
_/fal-ai/kling-video/v2.5-turbo/pro/image-to-video_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | 是 | 提示词 |
| `image_url` | string | 是 | 图片url，接受的文件类型：jpg、jpeg、png、webp、gif、avif |
| `duration` | string | 否 | 生成视频时长，枚举值：5、10 |
| `negative_prompt` | string | 否 |  |
| `cfg_scale` | number | 否 | 范围值：0-1 |

示例：
```json
{
  "prompt": "A stark starting line divides two powerful cars, engines revving for the challenge ahead. They surge forward in the heat of competition, a blur of speed and chrome. The finish line looms as they vie for victory.",
  "image_url": "https://v3.fal.media/files/panda/HnY2yf-BbzlrVQxR-qP6m_9912d0932988453aadf3912fc1901f52.jpg",
  "duration": "5",
  "negative_prompt": "blur, distort, and low quality",
  "cfg_scale": 0.5
}
```

## POST `/fal-ai/kling-video/v2.5-turbo/pro/text-to-video`
_/fal-ai/kling-video/v2.5-turbo/pro/text-to-video_

_请求体无显式字段定义，见 swagger 示例。_

示例：
```json
{
  "prompt": "A noble lord walks among his people, his presence a comforting reassurance. He greets them with a gentle smile, embodying their hopes and earning their respect through simple interactions. The atmosphere is intimate and sincere, highlighting the bond between the leader and community.",
  "duration": "5",
  "aspect_ratio": "16:9",
  "negative_prompt": "blur, distort, and low quality",
  "cfg_scale": 0.5
}
```

## POST `/fal-ai/nano-banana`
_/fal-ai/nano-banana 文生图_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | 是 | 生成图片的提示词。 |
| `num_images` | integer | 否 | 生成图片数量。范围值1-4。默认值：1 |

示例：
```json
{
  "prompt": "An action shot of a black lab swimming in an inground suburban swimming pool. The camera is placed meticulously on the water line, dividing the image in half, revealing both the dogs head above water holding a tennis ball in it's mouth, and it's paws paddling underwater.",
  "num_images": 1
}
```

## POST `/fal-ai/nano-banana/edit`
_/fal-ai/nano-banana/edit 图片编辑_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | 是 | 图像编辑的提示词。 |
| `image_urls` | array | 是 | 需要编辑的图片url。 |
| `num_images` | integer | 否 | 生成图片数量。范围值1-4。默认值：1 |

示例：
```json
{
  "prompt": "make a photo of the man driving the car down the california coastline",
  "image_urls": [
    "https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input.png",
    "https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input-2.png"
  ],
  "num_images": 1
}
```

## POST `/fal-ai/qwen-image-edit-lora`
_/fal-ai/qwen-image-edit-lora_

_请求体无显式字段定义，见 swagger 示例。_

示例：
```json
{
  "prompt": "Change bag to apple macbook",
  "num_inference_steps": 30,
  "guidance_scale": 4,
  "num_images": 1,
  "enable_safety_checker": true,
  "output_format": "png",
  "image_url": "http://e.hiphotos.baidu.com/image/pic/item/a1ec08fa513d2697e542494057fbb2fb4316d81e.jpg",
  "negative_prompt": "blurry, ugly",
  "acceleration": "regular"
}
```

## POST `/fal-ai/qwen-image-edit-plus`
_/fal-ai/qwen-image-edit-plus_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | 是 | 提示词。 |
| `image_size` | string | 否 | 图片尺寸，枚举值：square、square_hd、landscape_4_3、landscape_16_9、portrait_3_4、portrait_9_16 |
| `num_inference_steps` | integer | 否 | 范围值：2-100 |
| `guidance_scale` | integer | 否 | 范围值：0-20 |
| `num_images` | integer | 否 | 生成图片数量，范围值：1-4 |
| `enable_safety_checker` | boolean | 否 | 启用安全检查，默认值：true |
| `output_format` | string | 否 | 输出图片格式，支持：jpeg、png |
| `image_urls` | array | 是 | 图片url |
| `negative_prompt` | string | 否 |  |

示例：
```json
{
  "prompt": "Close shot portrait of a woman in front of this car on this highway",
  "image_size": "square_hd",
  "num_inference_steps": 50,
  "guidance_scale": 4,
  "num_images": 1,
  "enable_safety_checker": true,
  "output_format": "png",
  "image_urls": [
    "https://v3.fal.media/files/monkey/i3saq4bAPXSIl08nZtq9P_ec535747aefc4e31943136a6d8587075.png",
    "https://v3.fal.media/files/penguin/BCOZp6teRhSQFuOXpbBOa_da8ef9b4982347a2a62a516b737d4f21.png",
    "https://v3.fal.media/files/tiger/sCoZhBksx9DvwSR4_U3_C_3d1f581441874005908addeae9c10d0f.png"
  ],
  "negative_prompt": "blurry, ugly"
}
```

## POST `/fal-ai/veo3`
_/fal-ai/veo3_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | 是 |  |
| `aspect_ratio` | string | 否 | 生成视频的宽高比。如果设置为 1：1，视频将被外绘。默认值："16:9"，范围[16:9,9:16,1:1] |
| `duration` | string | 否 | 生成视频的时长（以秒为单位）默认值："8s" |
| `enhance_prompt` | boolean | 否 | 是否增强视频生成默认值：true |
| `auto_fix` | boolean | 否 | 是否通过重写来自动尝试修复未通过内容策略或其他验证检查的提示默认值：true |
| `resolution` | string | 否 | 生成视频的分辨率默认值："720p" 范围值[720p，1080p] |
| `generate_audio` | boolean | 否 | 是否为视频生成音频。如果为 false，则将减少 %33 的积分。默认值：true |

示例：
```json
{
  "prompt": "A casual street interview on a busy New York City sidewalk in the afternoon. The interviewer holds a plain, unbranded microphone and asks: Have you seen Google's new Veo3 model It is a super good model. Person replies: Yeah I saw it, it's already available on fal. It's crazy good.",
  "aspect_ratio": "16:9",
  "duration": "8s",
  "enhance_prompt": true,
  "auto_fix": true,
  "resolution": "720p",
  "generate_audio": true
}
```

## POST `/fal-ai/veo3/fast`
_/fal-ai/veo3/fast_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | 是 | 描述要生成的视频的文本提示 |
| `aspect_ratio` | string | 否 | 生成视频的宽高比。如果设置为 1：1，视频将被外绘。默认值："16:9"，范围[16:9,9:16,1:1] |
| `duration` | string | 否 | 生成视频的时长（以秒为单位）默认值："8s" |
| `enhance_prompt` | boolean | 否 | 是否增强视频生成默认值：true |
| `auto_fix` | boolean | 否 | 是否通过重写来自动尝试修复未通过内容策略或其他验证检查的提示默认值：true |
| `resolution` | string | 否 | 生成视频的分辨率默认值："720p" 范围值[720p，1080p] |
| `generate_audio` | boolean | 否 | 是否为视频生成音频。如果为 false，则将减少 %33 的积分。默认值：true |

示例：
```json
{
  "prompt": "A casual street interview on a busy New York City sidewalk in the afternoon. The interviewer holds a plain, unbranded microphone and asks: Have you seen Google's new Veo3 model It is a super good model. Person replies: Yeah I saw it, it's already available on fal. It's crazy good.",
  "aspect_ratio": "16:9",
  "duration": "4s",
  "enhance_prompt": true,
  "auto_fix": true,
  "resolution": "720p",
  "generate_audio": false
}
```

## POST `/fal-ai/veo3/fast/image-to-video`
_/fal-ai/veo3/fast/image-to-video_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | 是 | 描述图像应如何制作动画的文本提示 |
| `image_url` | string | 是 | 要制作动画的输入图像的 URL。宽高比应为 720p 或更高分辨率，宽高比为 16：9。如果图像的纵横比不是 16：9，则会裁剪以适合。 |
| `aspect_ratio` | string | 否 | 生成视频的宽高比默认值："auto" |
| `duration` | string | 否 | 生成视频的时长（以秒为单位）默认值："8s" |
| `generate_audio` | boolean | 否 | 是否为视频生成音频。如果为 false，则将减少 %33 的积分。默认值：true |
| `resolution` | string | 否 | 生成视频的分辨率默认值："720p" 范围值[720p，1080p] |

示例：
```json
{
  "prompt": "A woman looks into the camera, breathes in, then exclaims energetically, \"have you guys checked out Veo3 Image-to-Video on Fal? It's incredible!\"",
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/veo3-i2v-input.png",
  "aspect_ratio": "16:9",
  "duration": "8s",
  "generate_audio": true,
  "resolution": "720p"
}
```

## POST `/fal-ai/veo3/image-to-video`
_/fal-ai/veo3/image-to-video_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | 是 | 提示词 |
| `image_url` | string | 是 | 参考图片URL |
| `aspect_ratio` | string | 否 | 尺寸，枚举值：16：9、9：16、auto，默认值： "auto" |
| `duration` | string | 否 | 视频时长，默认值："8s" |
| `generate_audio` | boolean | 否 | 生成音频，默认值：true |
| `resolution` | string | 否 | 分辨率，枚举值："720p"、"1080p" |

示例：
```json
{
  "prompt": "A woman looks into the camera, breathes in, then exclaims energetically, \"have you guys checked out Veo3 Image-to-Video on Fal? It's incredible!\"",
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/veo3-i2v-input.png",
  "aspect_ratio": "auto",
  "duration": "8s",
  "generate_audio": true,
  "resolution": "720p"
}
```

## GET `/fal-ai/veo3/requests/{request_id}`
_/fal-ai/veo3/requests/{request_id}_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| request_id | path | 是 | string |  |

## POST `/fal-ai/vidu/reference-to-image`
_/fal-ai/vidu/reference-to-image_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | 是 | 提示词 |
| `reference_image_urls` | array | 是 | 参考图片url |
| `aspect_ratio` | string | 否 | 图片比例，枚举值：1：1、16：9、9：16 |

示例：
```json
{
  "prompt": "The little devil is looking at the apple on the beach and walking around it.",
  "reference_image_urls": [
    "https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/reference1.png",
    "https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/reference2.png",
    "https://storage.googleapis.com/falserverless/web-examples/vidu/new-examples/reference3.png"
  ],
  "aspect_ratio": "16:9"
}
```

## POST `/fal-ai/wan/v2.2-a14b/image-to-image`
_/fal-ai/wan/v2.2-a14b/image-to-image_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `image_url` | string | 是 | 图片URL |
| `prompt` | string | 是 | 提示词 |
| `strength` | number | 否 | 强度，范围值：0-1 |
| `aspect_ratio` | string | 否 | 图片尺寸 |
| `num_inference_steps` | integer | 否 | 范围值：2-40 |
| `enable_safety_checker` | boolean | 否 | 启用安全检查，默认值：true |
| `enable_prompt_expansion` | boolean | 否 | 启用提示扩展 |
| `acceleration` | string | 否 | 图片生成速度，枚举值："regular"，"none" |
| `guidance_scale` | number | 否 | 范围值：1-10 |
| `guidance_scale_2` | integer | 否 | 范围值：1-10 |
| `shift` | integer | 否 | 范围值：1-10 |
| `image_format` | string | 否 | 图片输出格式："jpeg"，"png" |

示例：
```json
{
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/wan-image-to-image-input.png",
  "prompt": "A cinematic shot of an ancient city at sunset, intricate stone buildings, warm golden light",
  "strength": 0.5,
  "aspect_ratio": "auto",
  "num_inference_steps": 27,
  "enable_safety_checker": true,
  "enable_prompt_expansion": false,
  "acceleration": "regular",
  "guidance_scale": 3.5,
  "guidance_scale_2": 4,
  "shift": 2,
  "image_format": "jpeg"
}
```

## GET `/fal-ai/{model_name}/requests/{request_id}`
_获取请求结果_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| model_name | path | 是 | string | 模型名称,auto 我们系统会自动判断model_name |
| request_id | path | 是 | string | 任务id |

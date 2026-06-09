# Kling (/kling) · 参数字段

> 由 `scripts/gen_params.py` 从 swagger 自动生成。鉴权 `Authorization: Bearer <API_KEY>`。
> 字段名含 `.` 表示嵌套对象，`[]` 表示数组元素。说明过长已截断，完整内容见 swagger。

## POST `/kling/v1/audio/text-to-audio`
_文生音效_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | 是 | 文本提示词 |
| `duration` | string | 是 | 生成音频的时长取值范围： ​​3.0秒至10.0秒​​，支持小数点后一位精度 |
| `external_task_id` | string | 否 |  |
| `callback_url` | string | 否 |  |

示例：
```json
{
  "prompt": "描述风景的音频",
  "duration": 5,
  "external_task_id": "",
  "callback_url": ""
}
```

## GET `/kling/v1/audio/text-to-audio/{id}`
_查询任务（单个）_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string |  |

## POST `/kling/v1/audio/tts`
_语音合成_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `text` | string | 是 | 合成音频的文案;文本内容最大长度1000，内容过长会返回错误码等信息;系统会校验文本内容，如有问题会返回错误码等信息 |
| `voice_id` | string | 是 | 音色ID 系统提供多种音色可供选择，具体音色效果、音色ID、音色语种对应关系；音色试听不支持自定义文案 音色试听文件命名规范：音色名称#音色ID#音色语种 语音合成目前仅支持官方音色哈，不支持自定义音色 |
| `voice_language` | string | 是 | 合成音频的文案;文本内容最大长度1000，内容过长会返回错误码等信息;系统会校验文本内容，如有问题会返回错误码等信息 |
| `voice_speed` | integer | 否 | 语速有效范围：0.8~2.0，精确至小数点后1位，超出部分将自动四舍五入 |

示例：
```json
{
  "text": "描述看到的画面",
  "voice_id": "genshin_vindi2",
  "voice_language": "zh",
  "voice_speed": "1.0"
}
```

## POST `/kling/v1/audio/video-to-audio`
_视频生音效_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `video_id` | string | 否 | 通过可灵AI生成的视频的ID 仅支持30天内生成并且长度在3.0秒-20.0秒的视频 |
| `video_url` | string | 否 | 所上传视频的获取链接 与video_id参数二选一填写，不能同时为空，也不能同时有值 视频格式仅支持MP4/MOV，文件大小≤100M, 视频长度在3.0秒-20.0秒 |
| `sound_effect_prompt` | string | 否 | 音效生成提示词 |
| `bgm_prompt` | string | 否 | 配乐生成提示词 |
| `asmr_mode` | boolean | 否 | 是否开启ASMR模式；该模式会增强细节音效, 适合高沉浸内容场景 true表示开启，false表示关闭（默认值） |
| `external_task_id` | string | 否 |  |
| `callback_url` | string | 否 |  |

示例：
```json
{
  "video_id": "825406034503692376",
  "video_url": "",
  "sound_effect_prompt": "符合视频的人的声音",
  "bgm_prompt": "",
  "asmr_mode": false,
  "external_task_id": "",
  "callback_url": ""
}
```

## GET `/kling/v1/audio/video-to-audio/{id}`
_查询任务（单个）_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string |  |

## POST `/kling/v1/general/advanced-custom-elements`
_主体（新版本）_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `element_name` | string | 是 | 不能超过20个字符 |
| `element_description` | string | 是 | 不能超过100个字符 |
| `reference_type` | string | 是 | 枚举值：video_refer、 image_refer video_refer: 视频角色主体，此时将参考element_video_list定义主体外表 image_refer: 多图主体，此时将参考element_image_list定义主体外表 通过视频定制的主体和通过图片定制的主体的可用范围不同，详见能力地图… |
| `element_image_list` | object | 否 | 可通过多张图片设定主体及其细节 包括正面参考图和其他角度或特写参考图，其中：至少包括1张正面参考图，由frontal_image参数定义；需包括1～3张其他参考图，需与正面参考图有差异，由image_url参数定义 用key:value承载，如下： "element_image_list": { "frontal_im… |
| `element_image_list.frontal_image` | string | 否 |  |
| `element_image_list.refer_images` | array | 否 |  |
| `element_image_list.refer_images[].image_url` | string | 是 |  |
| `element_video_list` | object | 否 | 可通过视频设定主体及其细节 可上传有声视频，有声视频包含人声则触发音色定制（定制+入音色库+与主体绑定） 暂时仅支持通过视频定制写实风格的人形形象 参考视频时当前参数必填，参考图片时当前参数无效 用key:value承载。视频格式仅支持MP4/MOV。仅支持时长介于3s～8s之间、宽高比例需为16:9或9:16的108… |
| `element_video_list.refer_videos` | array | 否 |  |
| `element_video_list.refer_videos[].video_url` | string | 否 |  |
| `element_voice_id` | string | 否 | 可绑定音色库中已有音色 当前参数为空时，当前主体不绑定音色 可通过音色相关API获取ID，点此查看 仅视频定制的主体支持绑定音色 |
| `tag_list` | array | 否 | 一个主体可以配置多个标签 用key:value承载。tag的ID与名称：o_101 热梗, o_102 人物, o_103 动物, o_104 道具, o_105 服饰, o_106 场景, o_107 特效, o_108 其他 |
| `tag_list[].tag_id` | string | 否 |  |
| `callback_url` | string | 否 | 本次任务结果回调通知地址，如果配置，服务端会在任务状态发生变更时主动通知 |
| `external_task_id` | string | 否 | 自定义任务ID。用户自定义任务ID，传入不会覆盖系统生成的任务ID，但支持通过该ID进行任务查询。请注意，单用户下需要保证唯一性 |

示例：
```json
"{\r\n    \"element_name\": \"主体ysh11112311213\",\r\n    \"element_description\": \"测试\",\r\n    \"reference_type\": \"image_refer\",\r\n    \"element_image_list\": {\r\n        \"frontal_image\": \"https://imageproxy.zhongzhuan.chat/api/proxy/image/bb9bd34363da4fa486c9e645a6b1349e.png\",\r\n        \"refer_images\": [\r\n            {\r\n                \"image_url\": \"https://imageproxy.zhongzhuan.chat/api/proxy/image/bb9bd34363da4fa486c9e645a6b1349e.png\"\r\n            }\r\n        ]\r\n    },\r\n    // \"element_video_list\": {\r\n    //     \"refer_videos\": [\r\n    //         {\r\n    //             \"video_url\": \"xxx\"\r\n    //         }\r\n    //     ]\r\n    // },\r\n    // \"element_voice_id\": string,\r\n    // \"tag_list\": [\r\n    //     {\r\n    //         \"tag_id\": \"xxx\"\r\n    //     }\r\n    // ],\r\n    // \"callback_url\": \"xxx\",\r\n    // \"external_task_id\": \"\"\r\n}"
```

## GET `/kling/v1/general/advanced-custom-elements/{task_id}`
_查询自定义主体（单个新版本）_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| task_id | path | 是 | string |  |

## GET `/kling/v1/general/advanced-presets-elements`
_查询官方主体（列表新版本）_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| pageNum | query | 否 | string |  |
| pageSize | query | 否 | string |  |

## POST `/kling/v1/general/custom-elements`
_主体(旧)_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `element_name` | string | 是 | 主体名称 不能超过20个字符 |
| `element_description` | string | 是 | 主体描述 不能超过100个字符 |
| `element_frontal_image` | string | 是 | 主体正面参考图 支持传入图片Base64编码或图片URL（确保可访问） 图片格式支持.jpg / .jpeg / .png 图片文件大小不能超过10MB，图片宽高尺寸不小于300px，图片宽高比要在1:2.5 ~ 2.5:1之间 |
| `element_refer_list` | array | 是 | 主体其他参考列表 可通过上传多张、不同角度的主体参考图来定义主体外观 至少上传1张参考图，至多上传3张参考图 用key:value承载，其中具体如下： 1 2 3 4 5 "element_refer_list":[ {"image_url":"image_url_1"}, {"image_url":"image_ur… |
| `element_refer_list[].image_url` | string | 是 |  |

示例：
```json
{
  "element_name": "",
  "element_description": "",
  "element_frontal_image": "",
  "element_refer_list": ""
}
```

## POST `/kling/v1/general/custom-voices`
_自定义音色_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `voice_name` | string | 是 | 音色名称 |
| `voice_url` | string | 否 | 音色数据文件获取链接 支持.mp3/.wav/.mp4/.mov格式的音视频文件 音频中人生需干净无杂音，有且只能有一种人声，时长不短于5秒且不长于30秒 |
| `video_id` | string | 否 | 历史作品ID，可通过引用历史作品提供音频素材 仅满足以下条件的视频可以用于定制音色： 使用V2.6版本模型生成且开启sound参数值为on的视频 通过数字人API生成的视频 通过对口型API生成的视频 音频中人生需干净无杂音，有且只能有一种人声，时长不短于5秒且不长于30秒 |
| `callback_url` | string | 否 |  |
| `external_task_id` | string | 否 |  |

## GET `/kling/v1/general/custom-voices/{id}`
_查询自定义音色（单个）_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string |  |

## POST `/kling/v1/general/delete-elements`
_删除自定义主体（新版本）_

_请求体无显式字段定义，见 swagger 示例。_

示例：
```json
{
  "element_id": "elem_805498da-90b2-40c1-a866-cd26eec99263"
}
```

## POST `/kling/v1/general/delete-voices`
_删除自定义音色_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `voice_id` | string | 是 |  |

## GET `/kling/v1/general/presets-voices`
_查询官方音色_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| pageNum | query | 否 | integer |  |
| pageSize | query | 否 | integer |  |

_请求体无显式字段定义，见 swagger 示例。_

## POST `/kling/v1/images/editing/expand`
_扩图_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `image` | string | 是 | 参考图片 支持传入图片Base64编码或图片URL（确保可访问） |
| `up_expansion_ratio` | number | 是 | 向上扩充范围；基于原图高度的倍数而计算 取值范围：[0,2]，新图片整体面积不得超过原图片3倍 如原图高20，当前参数值为0.1，则： 原图顶边距离新图顶边为20 x 0.1 = 2，区域内均为扩图范围 |
| `down_expansion_ratio` | number | 是 | 向下扩充范围；基于原图高度的倍数而计算 取值范围：[0,2]，新图片整体面积不得超过原图片3倍 如原图高20，当前参数值为0.2，则： 原图底边距离新图底边为20 x 0.2 = 4，区域内均为扩图范围 |
| `left_expansion_ratio` | number | 是 | 向左扩充范围；基于原图宽度的倍数而计算 取值范围：[0,2]，新图片整体面积不得超过原图片3倍 如原图宽30，当前参数值为0.3，则： 原图左边距离新图左边为30 x 0.3 = 9，区域内均为扩图范围 |
| `right_expansion_ratio` | number | 是 | 向右扩充范围；基于原图宽度的倍数而计算 取值范围：[0,2]，新图片整体面积不得超过原图片3倍 如原图宽30，当前参数值为0.4，则： 原图右边距离新图右边为30 x 0.4 = 12，区域内均为扩图范围 |
| `prompt` | string | 否 | 正向文本提示词 不能超过2500个字符 |
| `n` | integer | 是 | 生成图片数量 取值范围：[1,9] |
| `callback_url` | string | 否 |  |
| `external_task_id` | string | 否 |  |

示例：
```json
{
  "image": "https://h2.inkwai.com/bs2/upload-ylab-stunt/se/ai_portal_queue_mmu_image_upscale_aiweb/3214b798-e1b4-4b00-b7af-72b5b0417420_raw_image_0.jpg",
  "up_expansion_ratio": 0.1,
  "down_expansion_ratio": 0.1,
  "left_expansion_ratio": 0.1,
  "right_expansion_ratio": 0.1,
  "prompt": "聚焦中心",
  "n": 1,
  "callback_url": "",
  "external_task_id": ""
}
```

## GET `/kling/v1/images/editing/expand/{id}`
_查询任务（单个）_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string |  |

## POST `/kling/v1/images/generations`
_图像生成_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model_name` | string | 是 | 模型名称 枚举值：kling-v1, kling-v1-5, kling-v2, kling-v2-new, kling-v2-1,kling-v3 |
| `prompt` | string | 是 | 正向文本提示词 不能超过2500个字符 |
| `negative_prompt` | string | 否 | 负向文本提示词 不能超过2500个字符 |
| `image` | string | 否 | 参考图像支持传入图片Base64编码或图片URL（确保可访问） |
| `image_reference` | string | 否 | 图片参考类型 枚举值：subject（角色特征参考）, face（人物长相参考） 使用face（人物长相参考）时，上传图片需仅含1张人脸。 使用 kling-v1-5 且 image 参数不为空时，当前参数必填 |
| `image_fidelity` | number | 否 | 生成过程中对用户上传图片的参考强度 取值范围：[0,1]，数值越大参考强度越大 |
| `human_fidelity` | number | 否 | 面部参考强度，即参考图中人物五官相似度 仅 image_reference 参数为 subject 时生效 取值范围：[0,1]，数值越大参考强度越大 |
| `resolution` | string | 否 | 生成图片的清晰度 枚举值：1k, 2k 1k：1K标清 2k：2K高清 |
| `n` | integer | 是 | 生成图片数量 取值范围：[1,9] |
| `aspect_ratio` | string | 否 | 生成图片的画面纵横比（宽:高） 枚举值：16:9, 9:16, 1:1, 4:3, 3:4, 3:2, 2:3, 21:9 |
| `callback_url` | string | 否 |  |

示例：
```json
{
  "model_name": "kling-v1",
  "prompt": "生成一张海边的图",
  "negative_prompt": "",
  "image": "",
  "image_reference": "",
  "human_fidelity": 0.45,
  "resolution": "1k",
  "n": 2,
  "aspect_ratio": "16:9",
  "callback_url": ""
}
```

## GET `/kling/v1/images/generations/{id}`
_查询任务（单个）_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string |  |

## POST `/kling/v1/images/kolors-virtual-try-on`
_虚拟试穿_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model_name` | string | 是 |  |
| `human_image` | string | 是 | 支持传入图片Base64编码或图片URL（确保可访问） 图片格式支持.jpg / .jpeg / .png 图片文件大小不能超过10MB，图片宽高尺寸不小于300px |
| `cloth_image` | string | 是 | 支持上传服饰商品图或服饰白底图，支持上装upper、下装lower、与连体装dress 支持传入图片Base64编码或图片URL（确保可访问） 图片格式支持.jpg / .jpeg / .png 图片文件大小不能超过10MB，图片宽高尺寸不小于300px |

示例：
```json
{
  "model_name": "kolors-virtual-try-on-v1",
  "human_image": "https://p7.itc.cn/images01/20231015/b2d93ec7ae7146bebcadf3c07bfbee96.jpeg",
  "cloth_image": "https://p1-kling.klingai.com/kcdn/cdn-kcdn112452/kling-api-document/try-on.jpeg"
}
```

## POST `/kling/v1/images/multi-image2image`
_多图参考生图_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model_name` | string | 是 | 模型名称 枚举值：kling-v2, kling-v2-1 |
| `prompt` | string | 否 | 正向文本提示词 不能超过2500个字符 |
| `subject_image_list` | array | 是 | 最多支持4张图片，最少支持1张图片 |
| `subject_image_list[].subject_image` | string | 是 |  |
| `scene_image` | string | 否 | 场景参考图 支持传入图片Base64编码或图片URL（确保可访问） |
| `style_image` | string | 否 | 风格参考图 支持传入图片Base64编码或图片URL（确保可访问） |
| `n` | integer | 是 | 生成图片数量 取值范围：[1,9] |
| `aspect_ratio` | string | 否 | 生成图片的画面纵横比（宽:高） 枚举值：16:9, 9:16, 1:1, 4:3, 3:4, 3:2, 2:3, 21:9 |
| `callback_url` | string | 否 |  |
| `external_task_id` | string | 否 |  |

示例：
```json
{
  "model_name": "kling-v2",
  "prompt": "根据两张图的特点融合",
  "subject_image_list": [
    {
      "subject_image": "https://p2-fdl.klingai.com/ksc2/z3PF_5x5kcBzfxZU-uZ66pg5k_lhpifyoCyTFjn_jsKOiBYQGMoR7_kLKO34JyIdJbCSKR3vRneCwiyPHHjTPk01J7Dr65Ovoa7vYQuEh9c4j1_0G03JjIyKUMI58c29jou3zMmAyhzg7p8CrG7esV5agnr2P9XuO5VdTKdr0sUjEDycWEFe07ajsaYFg-wCu7vTJGLD0cr3nvYKnUl-CA.png?cacheKey=ChtzZWN1cml0eS5rbGluZy5tZXRhX2VuY3J5cHQSsAEeMBuZg7aCbU7N7Rcp5oJ-kfGAN3V073p1GMw7U9oTuISV4gRwnqW7X62AbPhPQVRmzngQDHsFrcGU8kCtzGOJEUWdikBNDmI_JPyD4jpae40CyqnscoIaQhbakFkkDSf515oxxHoFKX2uekXxhaC-Ux41JUupV2RFEPtWRqJtZy4w5ozqI6jbHeVXI7LP_zHpYOGuULmTPK93QFpw13NYPzMPddw3UIRVMrgRQxivnBoS0TR4h_eyjkvDOmDeFijUb3cSIiCmxVk1M5S1rqBZGCnxiZ3evpByg-3YWaVjVOSCzNW4rCgFMAE&x-kcdn-pid=112757&pkey=AAXAHqkraVdXL-kd_qQmLBUx0arOSG4SaHfdeXdQqN5MCBxYZ4QHE_nMRaT_7H8WHOAkbT65kOvXwPx8qkIAOsrbUM980pOy5e_FSqUqJgc_1oYe5msfxxfxRU6wi85LgDw"
    },
    {
      "subject_image": "https://p2-fdl.klingai.com/ksc2/r4gHNdLJu7R_NKFagBrRhUo3pHsXVPKzNvpK03wlneD_9vJUZW305KBZOtLLDMPi3x_S2OA3_kElUJ9OTGiTMJEgl_JquTY_F18h_3T_bUuMAJMwv-Ab4Q0lxaqv5hkTkPf3RiMM-e8L6YDoiu_hqlEWNRoMfcF600L9QjzdeCNWHxt6l1yQHNN-2F1dlnIEEFRCUNtIYl4ld4CTrXU0zQ.png?cacheKey=ChtzZWN1cml0eS5rbGl
...(截断)
```

## GET `/kling/v1/images/multi-image2image/{id}`
_查询任务（单个）_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string |  |

## POST `/kling/v1/images/omni-image`
_Omni-Image_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model_name` | string | 是 | 模型名称 枚举值：kling-image-o1,kling-v3-omni |
| `prompt` | string | 是 | 文本提示词，可包含正向描述和负向描述 可将提示词模板化来满足不同的图像生成需求 不能超过2500个字符 |
| `image_list` | array | 否 | 参考图列表 |
| `image_list[].image` | string | 否 |  |
| `resolution` | string | 否 | 生成图片的清晰度 枚举值：1k, 2k 1k：1K标清 2k：2K高清 |
| `n` | integer | 否 | 生成图片数量 取值范围：[1,9] |
| `result_type` | string | 否 | 生成结果单图/组图切换开关 枚举值：single，series |
| `series_amount` | integer | 否 | 生成组图的图片数量 ● 取值范围：[2, 9] 当result_type值为single时，当前参数无效 |
| `aspect_ratio` | string | 否 | 生成图片的画面纵横比（宽:高） 枚举值：16:9, 9:16, 1:1, 4:3, 3:4, 3:2, 2:3, 21:9, auto 其中：auto为根据传入内容智能生成视频 参考原图横纵比生成新图时，当前参数无效 |
| `watermark_info` | object | 否 | 是否同时生成含水印的结果 ● 通过enabled参数定义，用key:value承载，如下：： "watermark_info": { "enabled": boolean // true 为生成，false 为不生成 } ● 暂不支持自定义水印 |
| `watermark_info.enabled` | boolean | 是 |  |
| `callback_url` | string | 否 |  |
| `external_task_id` | string | 否 |  |

示例：
```json
{
  "model_name": "kling-image-o1",
  "prompt": "生成一张海边跳舞的图片",
  "element_list": [
    {
      "element_id": "835266081714884677"
    }
  ],
  "resolution": "",
  "n": 1,
  "aspect_ratio": "",
  "callback_url": "",
  "external_task_id": ""
}
```

## GET `/kling/v1/images/omni-image/{id}`
_查询任务（单个）_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string |  |

## POST `/kling/v1/videos/advanced-lip-sync`
_对口型_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `session_id` | string | 是 | 会话ID，会基于对口型人脸识别接口生成 |
| `face_choose` | array | 是 | 指定人脸对口型;包括人脸ID、口型参考等内容等;暂时仅支持指定单人对口型 |
| `face_choose[].face_id` | string | 是 | 人脸ID由人脸识别接口返回 |
| `face_choose[].audio_id` | string | 否 | 通过试听接口生成的音频的ID仅支持使用30天内生成的、时长不短于2秒且不超过60秒的音频/audio_id、sound_file参数二选一，不能同时为空，也不能同时有值 |
| `face_choose[].sound_file` | string | 否 | 音频文件 支持传入音频Base64编码或图音频URL（确保可访问） 音频文件支持.mp3/.wav/.m4a，文件大小不超过5MB，格式不匹配或文件过大会返回错误码等信息 仅支持使用时长不短于2秒且不长于60秒的音频 audio_id、sound_file参数二选一，不能同时为空，也不能同时有值 系统会校验音频内容，如… |
| `face_choose[].sound_start_time` | integer | 是 | 音频裁剪起点时间;以原始音频开始时间为准，开始时间为0分0秒，单位ms;起点之前的音频会被裁剪，裁剪后音频不得短于2秒 |
| `face_choose[].sound_end_time` | integer | 是 | 音频裁剪终点时间 终点时间不得晚于原始音频总时长 |
| `face_choose[].sound_insert_time` | integer | 是 | 裁剪后音频插入时间 插入音频的时间范围与该人脸可对口型时间区间至少重合2秒时长 插入音频的开始时间不得早于视频开始时间，插入音频的结束时间不得晚于视频结束时间 |
| `face_choose[].sound_volume` | integer | 是 | 音频音量大小；值越大，音量越大 取值范围：[0, 2] |
| `face_choose[].original_audio_volume` | integer | 是 | 原始视频音量大小；值越大，音量越大取值范围：[0, 2];原视频无声时，当前参数无效果 |
| `external_task_id` | string | 否 |  |
| `callback_url` | string | 否 |  |

示例：
```json
{
  "session_id": "825465778199224380",
  "face_choose": [
    {
      "face_id": "-1",
      "audio_id": "825451760499568680",
      "sound_file": "",
      "sound_start_time": 0,
      "sound_end_time": 5000,
      "sound_insert_time": 1000,
      "sound_volume": 1,
      "original_audio_volume": 1
    }
  ],
  "external_task_id": "",
  "callback_url": ""
}
```

## GET `/kling/v1/videos/advanced-lip-sync/{id}`
_查询任务（单个）_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string |  |

## POST `/kling/v1/videos/avatar/image2video`
_数字人_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `image` | string | 是 | 数字人参考图支持传入图片Base64编码或图片URL（确保可访问）图片格式支持.jpg / .jpeg / .png图片文件大小不能超过10MB，图片宽高尺寸不小于300px，图片宽高比介于1:2.5 ~ 2.5:1之间 |
| `audio_id` | string | 是 | 通过试听接口生成的音频的ID仅支持使用30天内生成的、时长不短于2秒切不超过300秒的音频audio_id、sound_file参数二选一，不能同时为空，也不能同时有值 |
| `sound_file` | string | 是 | 音频文件;支持传入音频Base64编码或图音频URL（确保可访问）;音频文件支持.mp3/.wav/.m4a/.aac，文件大小不超过5MB，格式不匹配或文件过大会返回错误码等信息;仅支持使用时长不短于2秒且不长于300秒的音频;audio_id、sound_file参数二选一，不能同时为空，也不能同时有;系统会校验音… |
| `prompt` | string | 是 | 正向文本提示词 |
| `mode` | string | 是 | 生成视频的模式 |
| `callback_url` | string | 是 |  |
| `external_task_id` | string | 是 |  |

示例：
```json
{
  "image": "https://h2.inkwai.com/bs2/upload-ylab-stunt/se/ai_portal_queue_mmu_image_upscale_aiweb/3214b798-e1b4-4b00-b7af-72b5b0417420_raw_image_0.jpg",
  "audio_id": "825455158141661278",
  "sound_file": "",
  "prompt": "",
  "mode": "std",
  "callback_url": "",
  "external_task_id": ""
}
```

## GET `/kling/v1/videos/avatar/image2video/{id}`
_查询任务（单个）_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string |  |

## POST `/kling/v1/videos/effects`
_视频特效_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `effect_scene` | string | 是 | 场景名称 |
| `input` | object | 否 | 参考图像 支持传入图片Base64编码或图片URL（确保可访问）支持不同任务输入的结构体 根据scene不同，结构体里传的字段不同，具体如「场景请求体」所示 |
| `input.images` | array | 否 | 双人 |
| `input.image` | string | 否 | 单人 |
| `callback_url` | string | 否 |  |
| `external_task_id` | string | 否 |  |

示例：
```json
{
  "effect_scene": "pet_lion",
  "input": {
    "image": "https://p4-kling.klingai.com/bs2/upload-ylab-stunt/c54e463c95816d959602f1f2541c62b2.png?x-kcdn-pid=112452"
  }
}
```

## GET `/kling/v1/videos/effects/{id}`
_查询任务（单个）_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string |  |

## POST `/kling/v1/videos/identify-face`
_人脸识别_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `video_id` | string | 否 | 通过可灵AI生成的视频的ID;用于指定视频、判断视频是否可用于对口型服务;与video_url参数二选一填写，不能同时为空，也不能同时有值;仅支持使用30天内生成的时长不超过60秒的视频 |
| `video_url` | string | 否 | 所上传视频的获取URL;用于指定视频，并判断视频是否可用于对口型服务;与video_id参数二选一填写，不能同时为空，也不能同时有值;视频文件支持.mp4/.mov，文件大小不超过100MB，视频时长不超过60s且不短于2s，仅支持720p和1080p、长宽的边长均位于512px~2160px之间，上述校验不通过会返回… |

示例：
```json
{
  "video_id": "827297867148050499",
  "video_url": ""
}
```

## POST `/kling/v1/videos/image-recognize`
_图像识别_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `image` | string | 是 | 待识别的图片 支持传入图片Base64编码或图片URL（确保可访问）图片格式支持.jpg / .jpeg / .png 图片文件大小不能超过10MB，图片宽高尺寸不小于300px，图片宽高比介于1:2.5 ~ 2.5:1之间 |

示例：
```json
{
  "image": "https://h2.inkwai.com/bs2/upload-ylab-stunt/se/ai_portal_queue_mmu_image_upscale_aiweb/3214b798-e1b4-4b00-b7af-72b5b0417420_raw_image_0.jpg"
}
```

## POST `/kling/v1/videos/image2video`
_图生视频_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model_name` | string | 是 | 模型名称 枚举值：kling-v1, kling-v1-5, kling-v1-6, kling-v2-master, kling-v2-1, kling-v2-1-master, kling-v2-5-turbo,kling-v2-6,kling-v3 |
| `image` | string | 是 | 参考图像 支持传入图片Base64编码或图片URL（确保可访问） |
| `image_tail` | string | 否 | 参考图像 - 尾帧控制 支持传入图片Base64编码或图片URL（确保可访问） |
| `prompt` | string | 否 | 正向文本提示词不能超过2500个字符 用<<<voice_1>>>来指定音色，序号同voice_list参数所引用音色的排列顺序 一次视频生成任务至多引用2个音色；指定音色时，sound参数值必须为on语法结构越简单越好， 如：男人<<<vocie_1>>>说：“你好” 当voice_list参数不为空且prompt参… |
| `negative_prompt` | string | 否 | 负向文本提示词 |
| `voice_list` | array | 否 | 仅V2.6及后续版本模型支持当前参数生成视频时所引用的音色的列表 一次视频生成任务至多引用2个音色 当voice_list参数不为空且prompt参数中引用音色ID时，视频生成任务按“有指定音色”计量计费 |
| `voice_list[].voice_id` | string | 否 |  |
| `sound` | string | 否 | 仅V2.6及后续版本模型支持当前参数生成视频时是否同时生成声音 枚举值：on，off |
| `cfg_scale` | number | 否 | kling-v2.x模型不支持当前参数生成视频的自由度；值越大，模型自由度越小，与用户输入的提示词相关性越强 |
| `mode` | string | 是 | 生成视频的模式 枚举值：std，pro 其中std：标准模式（标准），基础模式，性价比高 其中pro：专家模式（高品质），高表现模式，生成视频质量更佳 |
| `static_mask` | string | 否 | 静态笔刷涂抹区域（用户通过运动笔刷涂抹的 mask 图片） |
| `multi_shot` | boolean | 否 | 是否生成多镜头视频 当前参数为true时，prompt参数无效 当前参数为false时，shot_type参数及multi_prompt参数无效 |
| `shot_type` | string | 否 | 分镜方式 枚举值：customize 当multi_shot参数为true时，当前参数必填 |
| `multi_prompt` | array | 否 | 各分镜信息，如提示词、时长等 ● 通过index、prompt、duration参数定义分镜序号及相应提示词和时长，其中： ○ 最多支持6个分镜，最小支持1个分镜 ○ 每个分镜相关内容的最大长度不超过512 ○ 每个分镜的时长不大于当前任务的总时长，不小于1 ○ 所有分镜的时长之和等于当前任务的总时长 |
| `multi_prompt[].index` | integer | 是 |  |
| `multi_prompt[].prompt` | string | 是 |  |
| `multi_prompt[].duration` | string | 是 |  |
| `dynamic_masks` | array | 否 | 动态笔刷配置列表 |
| `dynamic_masks[].mask` | string | 否 |  |
| `dynamic_masks[].trajectories` | array | 否 |  |
| `dynamic_masks[].trajectories[].x` | integer | 是 |  |
| `dynamic_masks[].trajectories[].y` | integer | 是 |  |
| `camera_control` | object | 否 | 控制摄像机运动的协议（如未指定，模型将根据输入的文本/图片进行智能匹配） |
| `camera_control.type` | string | 是 |  |
| `camera_control.config` | object | 是 |  |
| `camera_control.config.horizontal` | integer | 是 |  |
| `camera_control.config.vertical` | integer | 是 |  |
| `camera_control.config.pan` | integer | 是 |  |
| `camera_control.config.tilt` | integer | 是 |  |
| `camera_control.config.roll` | integer | 是 |  |
| `camera_control.config.zoom` | integer | 是 |  |
| `duration` | string | 是 | 生成视频时长，单位s 枚举值：5，10 |
| `watermark_info` | object | 否 | 是否同时生成含水印的结果 ● 通过enabled参数定义，用key:value承载，如下：： "watermark_info": { "enabled": boolean // true 为生成，false 为不生成 } |
| `watermark_info.enabled` | boolean | 是 |  |
| `callback_url` | string | 否 |  |
| `external_task_id` | string | 否 |  |

示例：
```json
"{\r\n    \"model_name\": \"kling-v1\",\r\n    \"image\": \"https://h2.inkwai.com/bs2/upload-ylab-stunt/se/ai_portal_queue_mmu_image_upscale_aiweb/3214b798-e1b4-4b00-b7af-72b5b0417420_raw_image_0.jpg\",\r\n    \"image_tail\": \"\",\r\n    \"prompt\": \"\",\r\n    \"negative_prompt\": \"\",\r\n    // \"voice_list\": [\r\n    //     {\r\n    //         \"voiceId\": \"\"\r\n    //     }\r\n    // ],\r\n    // \"sound\": \"\",\r\n    \"cfg_scale\": 0.5,\r\n    \"mode\": \"std\",\r\n    \"static_mask\": \"\",\r\n    \"dynamic_masks\": [\r\n        {\r\n            \"mask\": \"https://h2.inkwai.com/bs2/upload-ylab-stunt/se/ai_portal_queue_mmu_image_upscale_aiweb/3214b798-e1b4-4b00-b7af-72b5b0417420_raw_image_0.jpg\",\r\n            \"trajectories\": [\r\n                {\r\n                    \"x\": 0,\r\n                    \"y\": 0\r\n                },\r\n                {\r\n                    \"x\": 1,\r\n                    \"y\": 1\r\n                }\r\n            ],\r\n        }\r\n    ],\r\n    // \"camera_control\": {\r\n    //     \"type\": \"simple\",\r\n    //     \"config\": {\r\n    //         \"horizontal\": 1.0,\r\n    //         \"vertical\": 0,\r\n    //         
...(截断)
```

## GET `/kling/v1/videos/image2video/{id}`
_查询任务（单个）_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string |  |

## POST `/kling/v1/videos/lip-sync`
_对口型_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `input` | object | 是 |  |
| `input.video_id` | string | 是 | 通过可灵AI生成的视频的ID |
| `input.video_url` | string | 是 | 所上传视频的获取链接,与input·video_id参数二选一填写，不能同时为空，也不能同时有值 |
| `input.mode` | string | 是 | 生成视频的模式 枚举: std, pro |
| `input.text` | string | 是 | 合成音频的文案 |
| `input.voice_id` | string | 是 | 音色ID |
| `input.voice_language` | string | 是 | 音色语种，与音色ID对应 枚举: zh, en |

示例：
```json
{
  "input": {
    "video_id": "827964097668337738",
    "mode": "text2video",
    "text": "今天天气很好今天天气很好今天天气很好今天天气很好今天天气很好今天天气很好今天天气很好今天天气很好今天天气很好今天天气很好今天天气很好",
    "voice_id": "girlfriend_1_speech02",
    "voice_language": "zh"
  }
}
```

## POST `/kling/v1/videos/motion-control`
_动作控制_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model_name` | string | 否 | 默认 kling-v2-6 kling-v3 |
| `prompt` | string | 否 | 文本提示词，可包含正向描述和负向描述 可通过提示词为画面增加元素、实现运镜效果等，详见可灵「动作控制」使用指南 不能超过2500个字符 https://docs.qingque.cn/d/home/eZQAl5y8xNSkr0iYUS8-bpGvP?identityId=2Cn18n4EIHT#section=h.xt… |
| `image_url` | string | 是 | 参考图像，生成视频中的人物、背景等元素均已参考图为准 视频内容需满足以下要求： 人物可以是写实风格人物或与自然人身材比例相似的卡通风格人物，避免遮挡；写实风格人物效果更好 图像中人物面积需超过图像面积的5% 包含支持传入图片Base64编码或图片URL（确保可访问） 图片格式支持.jpg / .jpeg / .png… |
| `video_url` | string | 是 | 视频内容需满足以下要求： 有且只能有1个写实风格、全身或上半身、包含头部的人物，避免遮挡 人物肢体动作与表情动作清晰且不包括空翻、倒立等复杂动作 动作视频一镜到底，人物始终出现在画面某种，避免切镜、运镜等 视频文件支持.mp4/.mov，文件大小不超过100MB，仅支持长宽的边长均位于340px~3850px之间，上述… |
| `element_list` | array | 否 | 主体参考列表 |
| `element_list[].element_id` | string | 否 | 引用主体时，生成的视频暂时只能参考视频中的人物朝向 暂时仅支持引入1个主体 |
| `keep_original_sound` | string | 否 | 可选择是否保留视频原声 枚举值：yes，no 其中yes：保留视频原声 其中no：不保留视频原声 |
| `character_orientation` | string | 是 | 生成视频中人物的朝向，可选择与图片一致或与视频一致 枚举值：image，video，其中： 其中image：与图片中人物朝向一致；此时参考视频时长不得超过10秒； 其中video：与视频中人物朝向一致；此时参考视频时长不得超过30秒； |
| `mode` | string | 是 | 生成视频的模式 枚举值：std，pro 其中std：标准模式（标准），基础模式，性价比高 其中pro：专家模式（高品质），高表现模式，生成视频质量更佳 |
| `callback_url` | string | 否 |  |
| `external_task_id` | string | 否 |  |
| `watermark_info` | array | 否 | 是否同时生成含水印的结果 |
| `watermark_info[].watermark_info` | boolean | 否 | true 为生成，false 为不生成 暂不支持自定义水印 |

示例：
```json
"{\r\n    \"model_name\": \"kling-v3\",\r\n    // \"image_url\": \"https://p2-kling.klingai.com/kcdn/cdn-kcdn112452/kling-qa-test/multi-3.ng.png\",\r\n    \"prompt\": \"女孩穿着灰色宽松T恤和牛仔短裤\",\r\n    \"video_url\": \"https://p2-kling.klingai.com/kcdn/cdn-kcdn112452/kling-qa-test/dance.mp4\",\r\n    \"keep_original_sound\": \"yes\",\r\n    // \"character_orientation\": \"image\",\r\n    \"mode\": \"pro\",\r\n    // \"callback_url\": \"\",\r\n    // \"external_task_id\": \"xxx\"\r\n}"
```

## GET `/kling/v1/videos/motion-control/{id}`
_查询任务（单个）_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string |  |

## POST `/kling/v1/videos/multi-elements`
_多模态视频_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model_name` | string | 是 | 模型名称枚举值：kling-v1-6 |
| `session_id` | string | 是 | 会话ID，会基于视频初始化任务生成，不会随编辑选区行为而改变 |
| `edit_mode` | string | 是 | 操作类型枚举值：addition, swap, removal, 其中：addition：增加元素swap：替换元素removal：删除元素 |
| `image_list` | array | 否 | 裁剪后的参考图像 |
| `prompt` | string | 是 | 正向文本提示词 |
| `negative_prompt` | string | 否 | 负向文本提示词 |
| `mode` | string | 是 | 生成视频的模式 枚举值：std，pro 其中std：标准模式（标准），基础模式，性价比高 其中pro：专家模式（高品质），高表现模式，生成视频质量更佳 |
| `duration` | string | 是 | 生成视频时长，单位s 枚举值：5，10 |
| `callback_url` | string | 否 |  |
| `external_task_id` | string | 否 |  |

示例：
```json
{
  "model_name": "kling-v1-6",
  "session_id": "",
  "edit_mode": "",
  "image_list": [],
  "prompt": "",
  "negative_prompt": "",
  "mode": "std",
  "duration": "5",
  "callback_url": "",
  "external_task_id": ""
}
```

## POST `/kling/v1/videos/multi-elements/add-selection`
_增加视频选区_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `session_id` | string | 是 | 会话ID，会基于视频初始化任务生成，不会随编辑选区行为而改变 |
| `frame_index` | integer | 是 | 帧号 最多支持添加10个标记帧，即最多基于10帧标记视频选区 1次仅支持标记1帧 |
| `points` | array | 是 | 点选坐标，用x、y表示 取值范围：[0,1]，用百分比表示；[0,1]代表画面左上角 支持同时增加多个标记点，某一帧最多可标记10个点 |
| `points[].x` | integer | 否 |  |
| `points[].y` | integer | 否 |  |

示例：
```json
{
  "session_id": "828033558945619987",
  "frame_index": 1,
  "points": [
    {
      "x": 0,
      "y": 1
    }
  ]
}
```

## POST `/kling/v1/videos/multi-elements/delete-selection`
_删减视频选区_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `session_id` | string | 是 | 会话ID，会基于视频初始化任务生成，不会随编辑选区行为而改变 |
| `frame_index` | integer | 是 | 帧号 最多支持添加10个标记帧，即最多基于10帧标记视频选区 1次仅支持标记1帧 |
| `points` | array | 是 | 点选坐标，用x、y表示 取值范围：[0,1]，用百分比表示；[0,1]代表画面左上角 支持同时增加多个标记点，某一帧最多可标记10个点 |
| `points[].x` | integer | 否 |  |
| `points[].y` | integer | 否 |  |

示例：
```json
{
  "session_id": "828033558945619987",
  "frame_index": 1,
  "points": [
    {
      "x": 1,
      "y": 0
    }
  ]
}
```

## POST `/kling/v1/videos/multi-elements/init-selection`
_初始化待编辑视频_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `video_id` | string | 否 | 视频ID，从历史作品中选择待编辑的视频，仅支持仅30天时间生成的视频作品 仅支持时长≥2秒且≤5秒，或≥7秒且≤10秒的视频 与video_url参数相关，不能同时为空，也不能同时有值 |
| `video_url` | string | 否 | 获取视频的URL，上传时传视频下载链接，编辑选区时传接口返回的视频URL 仅支持MP4和MOV格式 仅支持时长≥2秒且≤5秒，或≥7秒且≤10秒的视频 |

示例：
```json
{
  "video_id": "828013548709777428",
  "video_url": ""
}
```

## POST `/kling/v1/videos/multi-elements/preview-selection`
_预览已选区视频_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `session_id` | string | 是 |  |

示例：
```json
{
  "session_id": "828033558945619987"
}
```

## GET `/kling/v1/videos/multi-elements/{id}`
_查询任务（单个）_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string |  |

## POST `/kling/v1/videos/multi-image2video`
_多图参考生视频_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model_name` | string | 是 | 模型名称 枚举值：kling-v1-6 |
| `image_list` | array | 是 | 最多支持4张图片 |
| `image_list[].image` | string | 是 |  |
| `prompt` | string | 是 | 正向文本提示词 不能超过2500个字符 |
| `negative_prompt` | string | 否 | 负向文本提示词 |
| `mode` | string | 是 | 生成视频的模式 枚举值：std，pro 其中std：标准模式（标准），基础模式，性价比高 其中pro：专家模式（高品质），高表现模式，生成视频质量更佳 |
| `duration` | string | 是 | 生成视频时长，单位s 枚举值：5，10 |
| `aspect_ratio` | string | 否 | 生成图片的画面纵横比（宽:高） |
| `callback_url` | string | 否 |  |
| `external_task_id` | string | 否 |  |

示例：
```json
{
  "model_name": "kling-v1-6",
  "image_list": [
    {
      "image": "https://h2.inkwai.com/bs2/upload-ylab-stunt/se/ai_portal_queue_mmu_image_upscale_aiweb/3214b798-e1b4-4b00-b7af-72b5b0417420_raw_image_0.jpg"
    },
    {
      "image": "https://p4-fdl.klingai.com/ksc2/VC9RYcz0EFN3IK7HvGJxvyYKZoI2RJoqDr3DIiw7piElFWcqhZkCo1AXSd1KKuRDOgyh-4S32fgf_Y_E2bI12JyhGq8cUh3JBi15-3LhOi6kHXyhsyklf8i7f_z-7H3UwMKOFf3sUyRwme99EGVIVIbfonztB9YHiRUelIN03Kmj4WOJ7alF7z-hAf2VIb0CcmQgkOCO0Xr4cb3aWMmbzQ.png?cacheKey=ChtzZWN1cml0eS5rbGluZy5tZXRhX2VuY3J5cHQSsAHN4HK7XWwUnbU-46Q6VYOkhHxmQ1SXM2l0e-BFYasrb-1uP_EnXqmdvS5QiMNNsNQVp3iPjf6ArMRBsh6ryOIAKZLAUJt8PGdhJR5vNyJ1VKwQnyZ-HY-1ah-nq3zld8Ku5CrjZbwy25qQ-49HwVGRVVW3UduaRfOYN5JlKTzarHKKd4MdlsaLuke_On28RC_ZH9DpqtgdPE2XClDiiob98C_GO_hJGNQxXFZXz6RLQRoSv3Uc89R3_xETrF65D8P8-8MOIiBvVz-WFbQmW09meHOCiSebrXRVetWFZd9xrpTvc8VZyCgFMAE&x-kcdn-pid=112757&pkey=AAWtwrHKmYCgcvnbtFoiaXw1li4FfT_ZtdY7vJ_P4LchpS9PAfe3IAX19TCZn6WNQirjrIFp2kT5OEl5_S_JJ8oyDLKVn6xLODNisUft5SfwEf3J4k95BSmohuROFGZ8amg"
    }
  ],
  "prompt": "两张图合并成一个视频",
  "negative_prompt": "",
  "mode": "std",
  "duration": "5",
  "aspect_ratio": "16:9",
  "callback_url": "",
  "external_task_id": ""
}
```

## GET `/kling/v1/videos/multi-image2video/{id}`
_查询任务（单个）_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string |  |

## POST `/kling/v1/videos/omni-video`
_Omni-Video_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model_name` | string | 是 | 模型名称 枚举值：kling-video-o1 kling-v3-omni |
| `multi_shot` | boolean | 是 | 是否生成多镜头视频 当前参数为true时，prompt参数无效 当前参数为false时，shot_type参数及multi_prompt参数无效 |
| `shot_type` | string | 否 | 分镜方式 枚举值：customize 当multi_shot参数为true时，当前参数必填 |
| `prompt` | string | 否 | 文本提示词，可包含正向描述和负向描述 可将提示词模板化来满足不同的视频生成需求 不能超过2500个字符 当multi_shot参数为false，当前参数不得为空 |
| `multi_prompt` | array | 否 | 各分镜信息，如提示词、时长等 ● 通过index、prompt、duration参数定义分镜序号及相应提示词和时长，其中： ○ 最多支持6个分镜，最小支持1个分镜 ○ 每个分镜相关内容的最大长度不超过512 ○ 每个分镜的时长不大于当前任务的总时长，不小于1 ○ 所有分镜的时长之和等于当前任务的总时长 |
| `multi_prompt[].index` | number | 否 | 镜序号 |
| `multi_prompt[].prompt` | string | 否 | 提示词 |
| `multi_prompt[].duration` | string | 否 | 时长 |
| `sound` | string | 否 | 生成视频时是否同时生成声音 枚举值：on，off |
| `image_list` | array | 否 | 参考图列表 包括主体、场景、风格等参考图片，也可作为首帧或尾帧生成视频；当作为首帧或尾帧生成视频时： 通过type参数来定义图片是否为首尾帧：first_frame为首帧，end_frame为尾帧 暂时不支持仅尾帧，即有尾帧图时必须有首帧图 首帧或首尾帧生视频时，不能使用视频编辑功能 |
| `image_list[].image_url` | string | 否 |  |
| `image_list[].type` | string | 否 |  |
| `video_list` | array | 否 | 参考视频，通过URL方式获取 可作为特征参考视频，也可作为待编辑视频，默认为待编辑视频；可选择性保留视频原声 通过refer_type参数区分参考视频类型：feature为特征参考视频，base为待编辑视频 参考视频为待编辑视频时，不能定义视频首尾帧 通过keep_original_sound参数选择是否保留视频原声，… |
| `video_list[].video_url` | string | 否 |  |
| `video_list[].refer_type` | string | 否 |  |
| `video_list[].keep_original_sound` | string | 否 |  |
| `element_list` | array | 否 | 主体 |
| `element_list[].element_id` | string | 否 | 主体id |
| `mode` | string | 是 | 生成视频的模式 枚举值：std，pro 其中std：标准模式（标准），基础模式，性价比高 其中pro：专家模式（高品质），高表现模式，生成视频质量更佳 |
| `aspect_ratio` | string | 否 | 生成视频的画面纵横比（宽:高） 枚举值：16:9, 9:16, 1:1 未使用首帧参考或视频编辑功能时，当前参数必填 |
| `duration` | string | 是 | 生成视频时长，单位s 枚举值：3，4，5，6，7，8，9，10，其中： 使用文生视频、首帧图生视频时，仅支持5和10s 使用视频编辑功能（“refer_type”:“base”）时，输出结果与传入视频时长相同，此时当前参数无效；此时，按输入视频时长四舍五入取整计量计费 kling-v3-omni 支持 ● 枚举值：3，… |
| `watermark_info` | object | 否 | 是否同时生成含水印的结果 ● 通过enabled参数定义，用key:value承载，如下：： "watermark_info": { "enabled": boolean // true 为生成，false 为不生成 } |
| `watermark_info.enabled` | boolean | 否 |  |
| `callback_url` | string | 否 |  |
| `external_task_id` | string | 否 |  |

示例：
```json
{
  "model_name": "kling-video-o1",
  "prompt": "生成一个海边有一个人跳舞的视频",
  "negative_prompt": "",
  "mode": "std",
  "sound": "off",
  "element_list": [
    {
      "element_id": "835266081714884677"
    }
  ],
  "aspect_ratio": "16:9",
  "duration": "5",
  "callback_url": "",
  "external_task_id": ""
}
```

## GET `/kling/v1/videos/omni-video/{id}`
_查询任务（单个）_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string |  |

## POST `/kling/v1/videos/text2video`
_文生视频_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model_name` | string | 是 | 模型名称 枚举值：kling-v1,kling-v1-6, kling-v2-master, kling-v2-1-master, kling-v2-5-turbo,kling-v3 |
| `prompt` | string | 否 | 正向文本提示词不能超过2500个字符 |
| `multi_shot` | boolean | 是 | 是否生成多镜头视频 当前参数为true时，prompt参数无效 当前参数为false时，shot_type参数及multi_prompt参数无效 |
| `shot_type` | string | 否 | 分镜方式 枚举值：customize 当multi_shot参数为true时，当前参数必填 |
| `multi_prompt` | array | 否 | 各分镜信息，如提示词、时长等 ● 通过index、prompt、duration参数定义分镜序号及相应提示词和时长，其中： ○ 最多支持6个分镜，最小支持1个分镜 ○ 每个分镜相关内容的最大长度不超过512 ○ 每个分镜的时长不大于当前任务的总时长，不小于1 ○ 所有分镜的时长之和等于当前任务的总时长 |
| `multi_prompt[].index` | integer | 是 |  |
| `multi_prompt[].prompt` | string | 是 |  |
| `multi_prompt[].duration` | string | 是 |  |
| `negative_prompt` | string | 否 | 负向文本提示词不能超过2500个字符 |
| `cfg_scale` | number | 否 | 生成视频的自由度；值越大，模型自由度越小，与用户输入的提示词相关性越强 |
| `mode` | string | 是 | 生成视频的模式 枚举值：std，pro 其中std：标准模式（标准），基础模式，性价比高 其中pro：专家模式（高品质），高表现模式，生成视频质量更佳 |
| `sound` | string | 否 | 生成视频时是否同时生成声音枚举值：on，off仅V2.6及后续版本模型支持当前参数 |
| `camera_control` | object | 否 | 控制摄像机运动的协议（如未指定，模型将根据输入的文本/图片进行智能匹配） |
| `camera_control.type` | string | 是 |  |
| `camera_control.config` | object | 是 |  |
| `camera_control.config.horizontal` | integer | 是 |  |
| `camera_control.config.vertical` | integer | 是 |  |
| `camera_control.config.pan` | integer | 是 |  |
| `camera_control.config.tilt` | integer | 是 |  |
| `camera_control.config.roll` | integer | 是 |  |
| `camera_control.config.zoom` | integer | 是 |  |
| `aspect_ratio` | string | 否 | 生成视频的画面纵横比（宽:高） |
| `duration` | string | 是 | 生成视频时长，单位s |
| `watermark_info` | object | 否 | 是否同时生成含水印的结果 ● 通过enabled参数定义，用key:value承载，如下：： "watermark_info": { "enabled": boolean // true 为生成，false 为不生成 } |
| `watermark_info.enabled` | boolean | 是 |  |
| `callback_url` | string | 否 |  |
| `external_task_id` | string | 否 |  |

示例：
```json
{
  "model_name": "kling-v1",
  "prompt": "生成一个海边有一个人跳舞的视频",
  "negative_prompt": "",
  "cfg_scale": 0.5,
  "mode": "std",
  "sound": "off",
  "camera_control": {
    "type": "simple",
    "config": {
      "horizontal": 1,
      "vertical": 0,
      "pan": 0,
      "tilt": 0,
      "roll": 0,
      "zoom": 0
    }
  },
  "aspect_ratio": "16:9",
  "duration": "5",
  "callback_url": "",
  "external_task_id": ""
}
```

## GET `/kling/v1/videos/text2video/{id}`
_查询任务（单个）_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string |  |

_请求体无显式字段定义，见 swagger 示例。_

示例：
```json
"// {\r\n//     \"task_id\": \"kling-v1825380683199176793\",      // 文生视频的任务ID 请求路径参数，直接将值填写在请求路径中，与external_task_id两种查询方式二选一\r\n//     \"external_task_id\": \"\",    // 文生视频的自定义任务ID 创建任务时填写的external_task_id，与task_id两种查询方式二选一\r\n// }"
```

## POST `/kling/v1/videos/video-extend`
_视频延长_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `video_id` | string | 是 | 视频id 支持通过文本、图片和视频延长生成的视频的ID（原视频不能超过3分钟） |
| `prompt` | string | 是 | 正向文本提示词 不能超过2500个字符词 |
| `negative_prompt` | string | 否 | 负向文本提示词 |
| `cfg_scale` | number | 否 | 提示词参考强度 取值范围：[0,1]，数值越大参考强度越大 |
| `callback_url` | string | 否 |  |

示例：
```json
{
  "video_id": "828006748715380777",
  "prompt": "延长动画效果",
  "negative_prompt": "",
  "cfg_scale": 0.5,
  "callback_url": ""
}
```

## GET `/kling/v1/videos/video-extend/{id}`
_查询任务（单个）_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string |  |

## GET `/kling/v1/{action}/{action2}/{task_id}`
_查询任务(免费)_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| action | path | 是 | string | images或videos |
| action2 | path | 是 | string | generations（images）、text2video（videos）、image2video（videos）、lip-sync（videos）、kolors-virtual-try-on（images） |
| task_id | path | 是 | string | 任务ID |

_请求体无显式字段定义，见 swagger 示例。_

示例：
```json
""
```

# 腾讯云 VOD (/tencent-vod) · 参数字段

> 由 `scripts/gen_params.py` 从 swagger 自动生成。鉴权 `Authorization: Bearer <API_KEY>`。
> 字段名含 `.` 表示嵌套对象，`[]` 表示数组元素。说明过长已截断，完整内容见 swagger。

## POST `/tencent-vod/v1/aigc-image`
_创建任务_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model_name` | string | 是 | 模型名称。取值： GEM：Gemini； Qwen：千问。 Hunyuan：混元。 示例值：GEM |
| `model_version` | string | 是 | 模型版本。取值： 当 ModelName 是 GEM，可选值为 2.5、3.0； 当 ModelName 是 Qwen，可选值为 0925； 当 ModelName 是 Hunyuan，可选值为 3.0； 示例值：2.5 |
| `prompt` | string | 是 | 提示词 |
| `file_infos` | array | 否 |  |
| `file_infos[].type` | string | 否 | 输入的视频文件类型。取值有： File：点播媒体文件； Url：可访问的 URL； 示例值：File |
| `file_infos[].file_id` | string | 否 | 图片文件的媒体文件 ID，即该文件在云点播上的全局唯一标识符，在上传成功后由云点播后台分配。可以在 视频上传完成事件通知 或 云点播控制台 获取该字段。当 Type 取值为 File 时，本参数有效。 说明： 1. 推荐使用小于7M的图片； 2. 图片格式的取值为：jpeg，jpg, png, webp。 示例值：37… |
| `file_infos[].url` | string | 否 | 可访问的文件 URL。当 Type 取值为 Url 时，本参数有效。 说明： 1. 推荐使用小于7M的图片； 2. 图片格式的取值为：jpeg，jpg, png, webp。 示例值：https://test.com/1.png |
| `file_infos[].text` | string | 否 | 输入图片的描述信息，用于帮助模型理解图片。仅GEM 2.5、GEM 3.0 有效。 示例值：任务背景：这是需要翻新的主建筑（图1），不得改变其几何结构。 |
| `negative_prompt` | string | 否 | 要阻止模型生成图片的提示词。 |
| `enhance_prompt` | string | 否 | 是否自动优化提示词。开启时将自动优化传入的 Prompt，以提升生成质量。取值有： Enabled：开启； Disabled：关闭； |
| `output_config` | object | 否 | 生图任务的输出媒体文件配置。 |
| `output_config.storage_mode` | string | 否 | 存储模式。取值有： Permanent：永久存储，生成的图片文件将存储到云点播，可在事件通知中获取到 FileId； Temporary：临时存储，生成的图片文件不会存储到云点播，可在事件通知中获取到临时访问的 URL； 默认值：Temporary |
| `output_config.resolution` | string | 否 | 生成图片的分辨率。可选值为 720P、1080P、2K、4K、1024x1024、2048x2048、2304x1728、2496x1664、2560x1440、3024x1296、4096x4096、4694x3520、4992x3328、5404x3040、6198x2656，其中使用模型 Jimeng 时，推荐通… |
| `output_config.aspect_ratio` | string | 否 | 指定所生成图片的宽高比。 当 ModelName 是 GEM，可选值是 1:1、3:2、2:3、3:4、4:3、4:5、5:4、9:16、16:9 和 21:9； 当 ModelName 是 Qwen、Jimeng，则暂不支持，其中 Jimeng 会结合 Prompt意图、参考图片尺寸，由模型智能判断输出图片的宽高比。… |
| `output_config.person_generation` | string | 否 | 是否允许人物或人脸生成。取值有： AllowAdult：允许生成成人； Disallowed：禁止在图片中包含人物或人脸； 示例值：AllowAdult |
| `output_config.input_compliance_check` | string | 否 | 是否开启输入内容的合规性检查。取值有： Enabled：开启； Disabled：关闭； 示例值：Enabled |
| `output_config.output_compliance_check` | string | 否 | 是否开启输出内容的合规性检查。取值有： Enabled：开启； Disabled：关闭； 示例值：Enabled |
| `session_id` | string | 否 | 用于去重的识别码，如果三天内曾有过相同的识别码的请求，则本次的请求会返回错误。最长 50 个字符，不带或者带空字符串表示不做去重。 示例值：mysession |
| `session_context` | string | 否 | 来源上下文，用于透传用户请求信息，音画质重生完成回调将返回该字段值，最长 1000 个字符。 示例值：mySessionContext |
| `tasks_priority` | string | 否 | 任务的优先级，数值越大优先级越高，取值范围是 -10 到 10，不填代表 0。 示例值：10 |
| `ext_info` | object | 否 | 保留字段，特殊用途时使用。 示例值：myextinfo |

示例：
```json
{
  "model_name": "GEM",
  "model_version": "3.0",
  "file_infos": [
    {
      "type": "file",
      "file_id": "387702299774574677",
      "url": "",
      "text": "原始图片的描述信息"
    }
  ],
  "prompt": "convert this image to anime style",
  "negative_prompt": "blur, distorted",
  "enhance_prompt": "Enabled",
  "output_config": {
    "storage_mode": "Temporary",
    "resolution": "1080P",
    "aspect_ratio": "1:1",
    "person_generation": "AllowAdult",
    "input_compliance_check": "Enabled",
    "output_compliance_check": "Enabled"
  },
  "session_id": "image-task-67890",
  "session_context": "{\"user_id\": \"123\", \"scene\": \"profile_picture\"}",
  "tasks_priority": 10,
  "ext_info": ""
}
```

## POST `/tencent-vod/v1/aigc-video`
_创建任务_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model_name` | string | 是 | 模型名称。取值： Hailuo：海螺； Kling：可灵； Vidu； 示例值：GV |
| `model_version` | string | 是 | 模型版本。取值： 当 ModelName 是 Hailuo，可选值为 02、2.3、2.3-fast； 当 ModelName 是 Kling，可选值为 1.6、2.0、2.1、2.5、O1、3.0、3.0-Omni； 当 ModelName 是 Vidu，可选值为 q2、q2-pro、q2-turbo 、q3-pro… |
| `prompt` | string | 是 | 提示词 |
| `negative_prompt` | string | 否 | 要阻止模型生成视频的提示词。 示例值：red |
| `enhance_prompt` | string | 否 | 是否自动优化提示词。开启时将自动优化传入的 Prompt，以提升生成质量。取值有： Enabled：开启； Disabled：关闭； 示例值：Enabled |
| `file_infos` | array | 否 | 最多包含三张素材资源图片的列表，用于描述模型在生成视频时要使用的资源图片。 支持多图输入的模型： 1. GV，使用多图输入时，不可使用LastFrameFileId和LastFrameUrl。 2. Vidu，支持多图参考生视频。q2模型1-7张图片，可通过FileInfos里面的ObjectId作为主体id来传入。… |
| `file_infos[].type` | string | 否 | 输入的视频文件类型。取值有： File：点播媒体文件； Url：可访问的 URL； 示例值：File |
| `file_infos[].category` | string | 否 | 文件分类。取值为： Image: 图片； Video: 视频。 示例值：Image |
| `file_infos[].file_id` | string | 否 | 图片文件的媒体文件 ID，即该文件在云点播上的全局唯一标识符，在上传成功后由云点播后台分配。可以在 视频上传完成事件通知 或 云点播控制台 获取该字段。当 Type 取值为 File 时，本参数有效。 说明： 1. 推荐使用小于7M的图片； 2. 图片格式的取值为：jpeg，jpg, png, webp。 示例值：37… |
| `file_infos[].url` | string | 否 | 可访问的文件 URL。当 Type 取值为 Url 时，本参数有效。 说明： 1. 推荐使用小于7M的图片； 2. 图片格式的取值为：jpeg，jpg, png, webp。 示例值：https://test.com/1.png |
| `file_infos[].text` | string | 否 | 输入图片的描述信息，用于帮助模型理解图片。仅GEM 2.5、GEM 3.0 有效。 示例值：任务背景：这是需要翻新的主建筑（图1），不得改变其几何结构。 |
| `last_frame_url` | string | 否 | 用于作为尾帧画面来生成视频的媒体文件 URL。说明： 1. 只支持模型 GV 、Kling、Vidu，其他模型暂不支持。当 ModelName 为 GV 时，如果指定该参数，则需同时指定 FileInfos 作为待生成视频的首帧。当 ModelName 为 Kling 、ModelVersion 为 2.1 并且指定输… |
| `output_config` | object | 否 | 生视频任务的输出媒体文件配置。 |
| `output_config.storage_mode` | string | 否 | 存储模式。取值有： Permanent：永久存储，生成的图片文件将存储到云点播，可在事件通知中获取到 FileId； Temporary：临时存储，生成的图片文件不会存储到云点播，可在事件通知中获取到临时访问的 URL； 默认值：Temporary |
| `output_config.resolution` | string | 否 | 生成视频的分辨率。 当 ModelName 是 Kling，可选值为 720P、1080P，默认为 720P； 当 ModelName 是 Hailuo，可选值为 768P、1080P，默认为 768P； 当 ModelName 是 Vidu，可选值为 720P、1080P，默认为 720P； 示例值：720P |
| `output_config.aspect_ratio` | string | 否 | 指定所生成视频的宽高比。 当 ModelName 是 Kling，当文生视频时，则可选值为 16:9、9:16、 1:1，默认为16:9； 当 ModelName 是 Vidu，当文生视频时和使用参考图片生成时，则可选值为 16:9、9:16、4:3、3:4、1:1，其中仅版本q2支持4:3、3:4 当 ModelNa… |
| `output_config.audio_generation` | string | 否 | 是否生成音频。支持的模型包括 GV、OS。取值有： Enabled：开启； Disabled：关闭； 默认值：Disabled 示例值：Enabled |
| `output_config.duration` | string | 否 | 生成视频的时长，单位：秒。 当 ModelName 是 Kling，可选值为 5、10，默认为 5； 当 ModelName 是 Kling 并且 ModelVersion为3.0或3.0-Omni，可选值为3-15，默认5 当 ModelName 是 Kling 并且 ModelVersion为3.0-Omni传入的… |
| `output_config.person_generation` | string | 否 | 是否允许人物或人脸生成。取值有： AllowAdult：允许生成成人； Disallowed：禁止在图片中包含人物或人脸； 示例值：AllowAdult |
| `output_config.input_compliance_check` | string | 否 | 是否开启输入内容的合规性检查。取值有： Enabled：开启； Disabled：关闭； 示例值：Enabled |
| `output_config.output_compliance_check` | string | 否 | 是否开启输出内容的合规性检查。取值有： Enabled：开启； Disabled：关闭； 示例值：Enabled |
| `scene_type` | string | 否 | 场景类型。取值如下： 当 ModelName 为 Kling 时： motion_control 表示动作控制； avatar_i2v 表示数字人； lip_sync 表示对口型； 其他 ModelName 暂不支持。 示例值：motion_control |
| `session_id` | string | 否 | 用于去重的识别码，如果三天内曾有过相同的识别码的请求，则本次的请求会返回错误。最长 50 个字符，不带或者带空字符串表示不做去重。 示例值：mysession |
| `session_context` | string | 否 | 来源上下文，用于透传用户请求信息，音画质重生完成回调将返回该字段值，最长 1000 个字符。 示例值：mySessionContext |
| `tasks_priority` | string | 否 | 任务的优先级，数值越大优先级越高，取值范围是 -10 到 10，不填代表 0。 示例值：10 |
| `ext_info` | object | 否 | 保留字段，特殊用途时使用。 示例值：myextinfo |
| `ext_info.AdditionalParameters` | object | 否 |  |
| `ext_info.AdditionalParameters.multi_shot` | boolean | 否 | 是否生成多镜头视频 ●当前参数为true时，prompt参数无效 ●当前参数为false时，shot_type参数及multi_prompt参数无效 可用模型： Kling的3.0和3.0-Omni 注意：Kling的3.0-Omni视频参考不支持多镜头模式 |
| `ext_info.AdditionalParameters.shot_type` | string | 否 | 分镜方式 ●枚举值：customize 当multi_shot参数为true时，当前参数必填 可用模型： Kling的3.0和3.0-Omni |
| `ext_info.AdditionalParameters.multi_prompt` | array | 否 | 各分镜信息，如提示词、时长等 ●通过index、prompt、duration参数定义分镜序号及相应提示词和时长，其中： ○最多支持6个分镜，最小支持1个分镜 ○每个分镜相关内容的最大长度不超过512 ○每个分镜的时长不大于当前任务的总时长，不小于1 ○所有分镜的时长之和等于当前任务的总时长 用key:value承载，… |
| `ext_info.AdditionalParameters.multi_prompt[].index` | integer | 否 | 分镜序号： ○最多支持6个分镜，最小支持1个分镜 ○每个分镜相关内容的最大长度不超过512 |
| `ext_info.AdditionalParameters.multi_prompt[].prompt` | string | 否 | 分镜提示词： 当使用这个时，外层的总提示词参数传入的内容无效 |
| `ext_info.AdditionalParameters.multi_prompt[].duration` | integer | 否 | 分镜时长： ○每个分镜的时长不大于当前任务的总时长，不小于1 ○所有分镜的时长之和等于当前任务的总时长 |

示例：
```json
{
  "model_name": "Kling",
  "model_version": "1.6",
  "prompt": "一辆汽车在公路上行驶，阳光明媚",
  "negative_prompt": "模糊、抖动",
  "enhance_prompt": "Enabled",
  "output_config": {
    "storage_mode": "Temporary",
    "media_name": "car-video",
    "duration": 8,
    "resolution": "1080P",
    "aspect_ratio": "16:9",
    "audio_generation": "Enabled",
    "person_generation": "AllowAdult",
    "input_compliance_check": "Enabled",
    "output_compliance_check": "Enabled",
    "enhance_switch": "Enabled"
  }
}
```

## GET `/tencent-vod/v1/query/{task_id}`
_获取请求结果_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| task_id | path | 是 | string |  |

## POST `/tencent-vod/v1/template-effect`
_特效模板创建任务_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `scene_type` | string | 是 | 取值 template_effect |
| `prompt` | string | 否 | 提示词 |
| `file_infos` | object | 否 | 最多包含三张素材资源图片的列表，用于描述模型在生成视频时要使用的资源图片。 注意： 1. 图片大小不超过10M。 2. 支持的图片格式：jpeg、png。 |
| `file_infos.type` | string | 否 | 输入的视频文件类型。取值有： File：点播媒体文件； Url：可访问的 URL； 示例值：File |
| `file_infos.category` | string | 否 | 文件分类。取值为： Image: 图片； Video: 视频。 示例值：Image |
| `file_infos.file_id` | string | 否 | 图片文件的媒体文件 ID，即该文件在云点播上的全局唯一标识符，在上传成功后由云点播后台分配。可以在 视频上传完成事件通知 或 云点播控制台 获取该字段。当 Type 取值为 File 时，本参数有效。 说明： 1. 推荐使用小于7M的图片； 2. 图片格式的取值为：jpeg，jpg, png, webp。 示例值：37… |
| `file_infos.url` | string | 否 | 可访问的文件 URL。当 Type 取值为 Url 时，本参数有效。 说明： 1. 推荐使用小于7M的图片； 2. 图片格式的取值为：jpeg，jpg, png, webp。 示例值：https://test.com/1.png |
| `ext_info` | object | 是 |  |
| `ext_info.AdditionalParameters` | object | 是 |  |
| `ext_info.AdditionalParameters.template` | string | 是 | 场景模版参数 不同的场景模板，对应的调用参数不同，我们提供两种查看方式： ●官方示例中心：https://platform.vidu.cn/docs/templates ●在线文档文档（支持按上线时间查询）：https://shengshu.feishu.cn/wiki/L2Dbwi7QeilCAgkdJKjcrj2L… |

示例：
```json
{
  "scene_type": "template_effect",
  "prompt": "视频内容\\n画面开始主体突然爆炸，细碎的颗粒爆炸开来\\n# 要求\\n1.根据用户上传图片确定主体数量,每个主体都要爆炸\\n2.Motion Level 设定为:Middle\\n3.以>我的视频内容为第一要素，背景的描述统一、合理，不要描述两次.",
  "file_infos": [
    {
      "type": "Url",
      "category": "Image",
      "url": "https://image01.vidu.zone/vidu/example/20241206-175531.jpeg"
    }
  ],
  "ext_info": {
    "AdditionalParameters": {
      "template": "morphlab"
    }
  }
}
```

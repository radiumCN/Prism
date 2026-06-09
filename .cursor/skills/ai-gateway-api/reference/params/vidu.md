# Vidu (/ent/v2, /vidu-native) · 参数字段

> 由 `scripts/gen_params.py` 从 swagger 自动生成。鉴权 `Authorization: Bearer <API_KEY>`。
> 字段名含 `.` 表示嵌套对象，`[]` 表示数组元素。说明过长已截断，完整内容见 swagger。

## POST `/ent/v2/audio-tts`
_语音合成_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `text` | string | 是 | 需要合成语音的文本 1. 长度限制小于 10000 字符 2. 段落切换用换行符标记 3. 停顿控制：支持自定义文本之间的语音时间间隔，以实现自定义文本语音停顿时间的效果。 - 使用方式：在文本中增加<#x#>标记，x 为停顿时长（单位：秒），范围 [0.01, 99.99]，最多保留两位小数。文本间隔时间需设置在两个… |
| `voice_setting_voice_id` | string | 是 | 合成音频的音色id 可查看音色列表查询全部可用音色：https://shengshu.feishu.cn/sheets/EgFvs6DShhiEBStmjzccr5gonOg |
| `voice_setting_speed` | string | 否 | 语速，默认为1.0 1.0为正常语速，范围 [0.5,2]，值为0.5时播报语速最慢，值为2时播报语速最快 |
| `voice_setting_volume` | string | 否 | 音量大小 范围 0 - 10，默认为0，代表正常音量，值越大音量越高 |
| `voice_setting_pitch` | string | 否 | 合成音频的语调 范围 [-12,12]，默认 0，其中 0 为原音色输出 |
| `voice_setting_emotion` | string | 否 | 控制合成语音的情绪 1. 参数范围 ["happy", "sad", "angry", "fearful", "disgusted", "surprised", "calm"]，分别对应 7 种情绪：高兴，悲伤，愤怒，害怕，厌恶，惊讶，中性 2. 模型会根据输入文本自动匹配合适的情绪，一般无需手动指定 |
| `pronunciation_dict_tone` | string | 否 | 定义多音字发音 - 定义需要特殊标注的文字或符号对应的注音或发音替换规则，针对多音字场景，在中文文本中，声调用数字表示：一声为 1；二声为 2；三声为 3；四声为 4；轻声为 5。 - 示例如下： ["燕少飞/(yan4)(shao3)(fei1)", "达菲/(da2)(fei1)", "omg/oh my god"… |
| `payload` | string | 否 | 透传参数 不做任何处理，仅数据传输 注：最多 1048576个字符 |

示例：
```json
{
  "text": "人工智能正在改变我们的生活方式，从智能家居到自动驾驶，技术的进步让世界变得更加便利。",
  "voice_setting_voice_id": "male-qn-daxuesheng"
}
```

## POST `/ent/v2/img2video`
_创建图生视频任务_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 模型名称 可选值：viduq2 、viduq1、viduq3-turbo、viduq3-pro - viduq3-turbo：对比viduq3-pro，生成速度更快 - viduq3-pro：高效生成优质音视频内容，让视频内容更生动、更形象、更立体，效果更好 - viduq2：最新模型 - viduq1：画面清晰，平滑… |
| `images` | array | 是 | 首帧图像 模型将以此参数中传入的图片为首帧画面来生成视频。 注1：支持传入图片 Base64 编码或图片URL（确保可访问）； 注2：只支持输入 1 张图； 注3：图片支持 png、jpeg、jpg、webp格式； 注4：图片比例需要小于 1:4 或者 4:1 ； 注5：图片大小不超过 50 MB； 注6：请注意，ht… |
| `prompt` | string | 是 | 文本提示词 生成视频的文本描述。 注：字符长度不能超过 2000 个字符 |
| `audio` | string | 否 | 是否使用音视频直出能力，默认为false，枚举值为： - false：不需要音视频直出，输出静音视频 - true：需要音视频直出，输出带台词以及背景音的视频 注1：该参数为true时，voice_id参数才生效 注2：当model 为q3-pro或q3-turbo 时，该参数默认值为true 注2：该参数为true时… |
| `voice_id` | string | 否 | 音色id 用来决定视频中的声音音色，为空时系统会自动推荐，可选枚举值参考列表：新音色列表：https://shengshu.feishu.cn/sheets/EgFvs6DShhiEBStmjzccr5gonOg |
| `is_rec` | string | 否 | 是否使用推荐提示词 - true：是，由系统自动推荐提示词，并使用提示词内容生成视频，推荐提示词数量=1 - false：否，根据输入的prompt生成视频 注意：启用推荐提示词后，每个任务多消耗10积分 |
| `duration` | number | 否 | 视频时长参数，默认值依据模型而定： viduq3-pro、viduq3-turbo 默认为 5，可选：1 - 16 - viduq2 : 默认5秒，可选：1-10 - viduq1 : 默认5秒，可选：5 |
| `seed` | string | 否 | 随机种子 当默认不传或者传0时，会使用随机数替代 手动设置则使用设置的种子 |
| `resolution` | string | 否 | 分辨率参数，默认值依据模型和视频时长而定： - viduq3-pro 、viduq3-turbo 1-16秒：默认 720p，可选：540p、720p、1080p - viduq2(1-10秒)：默认 720p，可选：540p、720p、1080p - viduq1(5秒)：默认 1080p，可选：1080p |
| `movement_amplitude` | string | 否 | 运动幅度 默认 auto，可选值：auto、small、medium、large 注：使用q2模型时该参数不生效 |
| `payload` | string | 否 | 透传参数 不做任何处理，仅数据传输 注：最多 1048576个字符 |
| `off_peak` | string | 否 | 错峰模式，默认为：false，可选值： - true：错峰生成视频； - false：即时生成视频； 注1：错峰模式消耗的积分更低，具体请查看产品定价 注2：错峰模式下提交的任务，会在48小时内生成，未能完成的任务会被自动取消，并返还该任务的积分； 注3：您也可以手动取消错峰任务 |
| `watermark` | string | 否 | 是否添加水印 - true：添加水印； - false：不添加水印； 注1：目前水印内容为固定，内容由AI生成，默认不加 注2：您可以通过watermarked_url参数查询获取带水印的视频内容，详情见查询任务接口 |
| `wm_position` | string | 否 | 水印位置，表示水印出现在图片的位置，可选项为： 1：左上角 2：右上角 3：右下角 4：左下角 默认为：3 |
| `wm_url` | string | 否 | 水印内容，此处为图片URL 不传时，使用默认水印：内容由AI生成 |
| `meta_data` | string | 否 | 元数据标识，json格式字符串，透传字段，您可以 自定义格式 或使用 示例格式 ，示例如下： { "Label": "your_label","ContentProducer": "yourcontentproducer","ContentPropagator": "your_content_propagator","… |
| `callback_url` | string | 否 | Callback 协议 需要您在创建任务时主动设置 callback_url，请求方法为 POST，当视频生成任务有状态变化时，Vidu 将向此地址发送包含任务最新状态的回调请求。回调请求内容结构与查询任务API的返回体一致 回调返回的"status"包括以下状态： - processing 任务处理中 - succe… |

示例：
```json
"{\r\n    \"model\": \"viduq2-pro\",\r\n    \"images\": [\r\n        \"https://imageproxy.zhongzhuan.chat/api/proxy/image/6fb238cc01649cb7580fbb2dd58f3d6d.png\"\r\n    ],\r\n    \"prompt\": \"镜头缓慢推进，展现画面中的细节，背景逐渐虚化\",\r\n    \"duration\": 2,\r\n    \"resolution\": \"1080p\",\r\n    \"aspect_ratio\": \"16:9\",\r\n    \"seed\": 12345,\r\n    \"movement_amplitude\": \"standard\",\r\n    \"bgm\": false,\r\n    \"audio\": false,\r\n    \"off_peak\": false,\r\n    \"watermark\": false,\r\n    // \"payload\": \"custom-tracking-id-123\",\r\n    // \"client_request_id\": \"unique-request-id-456\"\r\n}"
```

## POST `/ent/v2/reference2image`
_创建图片生成任务_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 模型名称 可选值：viduq2、viduq1 viduq2：支持文生图、图片编辑、参考生图 viduq1：支持参考生图 |
| `images` | array | 否 | 图像参考 viduq2：支持输入 0～7 张图片 viduq1：支持输入 1～7 张图片 模型将以此参数中传入的图片中的主题为参考，生成与图片中主体一致的视频。 注1：支持传入图片 Base64 编码或图片URL（确保可访问) 注2：图片支持 png、jpeg、jpg、webp格式 注3：图片像素不能小于 128*12… |
| `prompt` | string | 是 | 文本提示词 视频生成的文本描述，长度不能超过 2000 个字符 注1：viduq2模型支持文生图，在使用viduq2模型，且没有上传任何images时，模型会使用该参数的文本内容生成图片 |
| `seed` | string | 否 | 随机种子参数 当默认不传或者传0时，会使用随机数替代 手动设置则使用设置的种子 |
| `aspect_ratio` | string | 否 | 比例参数，不同模型支持不同的比例： viduq1：默认值16:9，可选值：16:9、9:16、1:1、3:4、4:3 viduq2：默认值16:9，可选值如下：16:9、9:16、1:1、3:4、4:3、21:9、2:3、3:2 - auto：表示与首张输入图保持相同比例 |
| `resolution` | string | 否 | 分辨率参数，不同模型支持的分辨率不同： viduq1：默认1080p，可选项：1080p viduq2：默认1080p，可选项：1080p、2K、4K |
| `payload` | string | 否 | 透传参数 不做任何处理，仅数据传输 注：最多 1048576个字符 |
| `callback_url` | string | 否 | Callback 协议 需要您在创建任务时主动设置 callback_url，请求方法为 POST，当视频生成任务有状态变化时，Vidu 将向此地址发送包含任务最新状态的回调请求。回调请求内容结构与查询任务API的返回体一致 回调返回的“status”包括以下状态： - processing 任务处理中 - succe… |

示例：
```json
{
  "model": "viduq1",
  "prompt": "一只可爱的小猫坐在窗台上，阳光洒在它的身上，温馨的画面"
}
```

## POST `/ent/v2/reference2video`
_创建参考生视频任务（非主体调用）_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 模型名称可选值：viduq3-mix、viduq3、viduq2-pro、viduq2、viduq1、vidu2.0 - viduq3-mix：画面质感强，支持智能切镜，支持音画同出，动态效果好，均衡性最强 - viduq3：支持智能切镜，支持音画同出，多机位的一致性更出色 - viduq2-pro：支持参考视频，支持… |
| `images` | array | 否 | 图像参考支持多张图片，模型将以此参数中传入的图片中的主题为参考生成具备主体一致的视频，各模型版本可参考图片数量不同，具体要求如下 注1：viduq3、viduq2、viduq1、vidu2.0系列模型支持上传1～7张图片 注2：使用viduq2-pro模型时，如果不上传视频，则支持上传1-7张图，如果上传视频则支持1-… |
| `videos` | array | 否 | 视频参考支持上传1～2个视频，模型将以此参数中传入的视频作为参考，生成具备主体一致的视频。 注1： 仅viduq2-pro模型支持该参数 注2：使用视频参考功能时，最多支持上传 1个8秒 视频 或 2个5秒 视频 注3：视频支持 mp4、avi、mov格式 注4：视频像素不能小于 128*128，且比例需要小于1:4或… |
| `sounds` | array | 否 | 音频参考支持上传1～7个音频，模型将以此参数中传入的音频作为参考，生成具备主体一致的视频。 注1：使用音频参考功能时，最多支持上传 7个音频，每个音频时长最多20s 注2：音频支持 mp3格式 注3：每个音频文件大小不超过50M。 注4：请注意，base64 decode之后的字节长度需要小于20M，且编码必须包含适当… |
| `prompt` | string | 是 | 文本提示词生成视频的文本描述。 注：字符长度不能超过 5000 个字符。 |
| `bgm` | string | 否 | 是否为生成的视频添加背景音乐。默认：false，可选值 true 、false - 传 true 时系统将从预设 BGM 库中自动挑选合适的音乐并添加；不传或为 false 则不添加 BGM。 - BGM不限制时长，系统根据视频时长自动适配 - 该参数在q2系列模型的duration为 9秒 或 10秒 时不生效 -… |
| `audio` | string | 否 | 是否使用音视频直出能力，默认为true，枚举值为： - false：不需要音视频直出，输出静音视频 - true：需要音画同步，输出声音的视频（包括台词和音效） 注：非主体调用时，仅q3模型支持该参数 |
| `duration` | number | 否 | 视频时长参数，默认值依据模型而定 viduq3-mix：默认5秒，可选1 - 16 viduq3：默认5秒，可选3 - 16 viduq2-pro、viduq2：默认5秒，可选：1 - 10 viduq1：默认5秒，可选：5 vidu2.0：默认4秒，可选：4 |
| `seed` | number | 否 | 随机种子 当默认不传或者传0时，会使用随机数替代 手动设置则使用设置的种子 |
| `aspect_ratio` | string | 否 | 比例参数，q2、q3模型支持任意比例或 auto 默认 16:9，可选值如下：1:1、9:16、16:9、3:4、4:3 auto：根据输入图或视频自动推荐 |
| `resolution` | string | 否 | 分辨率参数，默认值依据模型和视频时长而定： viduq3-mix（1-16秒）：默认 720p, 可选：720p、1080p viduq3（3-16秒）：默认 720p, 可选：540p、720p、1080p viduq2-pro、viduq2 （1-10秒）：默认 720p, 可选：540p、720p、1080p v… |
| `movement_amplitude` | string | 否 | 运动幅度 默认 auto，可选值：auto、small、medium、large 注：q2和q3系列模型不支持该参数 |
| `payload` | string | 否 | 透传参数 不做任何处理，仅数据传输 注：最多 1048576个字符 |
| `watermark` | string | 否 | 是否添加水印 - true：添加水印； - false：不添加水印； 注1：目前水印内容为固定，内容由AI生成，默认不加 注2：您可以通过watermarked_url参数查询获取带水印的视频内容，详情见查询任务接口 |
| `wm_position` | string | 否 | 水印位置，表示水印出现在图片的位置，可选项为： 1：左上角 2：右上角 3：右下角 4：左下角 默认为：3 |
| `wm_url` | string | 否 | 水印内容，此处为图片URL 不传时，使用默认水印：内容由AI生成 |
| `meta_data` | string | 否 | 元数据标识，json格式字符串，透传字段，您可以 自定义格式 或使用 示例格式 ，示例如下： { "Label": "your_label","ContentProducer": "yourcontentproducer","ContentPropagator": "your_content_propagator","… |
| `callback_url` | string | 否 | Callback 协议 需要您在创建任务时主动设置 callback_url，请求方法为 POST，当视频生成任务有状态变化时，Vidu 将向此地址发送包含任务最新状态的回调请求。回调请求内容结构与查询任务API的返回体一致 回调返回的"status"包括以下状态： - processing 任务处理中 - succe… |

示例：
```json
{
  "model": "viduq3-mix",
  "images": [
    "https://picx.zhimg.com/v2-4911df093b40ee5511938a1ac2a5cdc4_r.jpg"
  ],
  "prompt": "一只可爱的cat在草地上奔跑，阳光明媚，画面温馨"
}
```

## POST `/ent/v2/start-end2video`
_创建首尾帧生视频任务_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 模型名称 可选值：viduq2 、viduq1、viduq3-turbo、viduq3-pro - viduq3-turbo：对比viduq3-pro，生成速度更快 - viduq3-pro：高效生成优质音视频内容，让视频内容更生动、更形象、更立体，效果更好 - viduq2：最新模型 - viduq1：画面清晰，平滑… |
| `images` | array | 是 | 图像 支持输入两张图，上传的第一张图片视作首帧图，第二张图片视作尾帧图，模型将以此参数中传入的图片来生成视频 注1: 首尾帧两张输入图的分辨率需相近，首帧图的分辨率/尾帧图的分辨率要在0.8～1.25之间。且图片比例需要小于1:4或者4:1； 注2: 支持传入图片 Base64 编码或图片URL（确保可访问）； 注3:… |
| `prompt` | string | 是 | 文本提示词 生成视频的文本描述。 注：字符长度不能超过 2000 个字符 |
| `is_rec` | string | 否 | 是否使用推荐提示词 - true：是，由系统自动推荐提示词，并使用提示词内容生成视频，推荐提示词数量=1 - false：否，根据输入的prompt生成视频 注意：启用推荐提示词后，每个任务多消耗10积分 |
| `duration` | integer | 否 | 视频时长参数，默认值依据模型而定： - viduq3-pro 、viduq3-turbo默认为 5，可选：1 - 16 - viduq2 : 默认5秒，可选：1-10 - viduq1 : 默认5秒，可选：5 |
| `seed` | string | 否 | 随机种子 当默认不传或者传0时，会使用随机数替代 手动设置则使用设置的种子 |
| `resolution` | string | 否 | 分辨率参数，默认值依据模型和视频时长而定： - viduq3-pro 、viduq3-turbo1-16秒：默认 720p，可选：540p、720p、1080p - viduq2-pro-fast 1-8秒：默认 720p，可选：720p、1080p - viduq2-pro 1-8秒：默认 720p，可选：540p、… |
| `movement_amplitude` | string | 否 | 分辨率参数，默认值依据模型和视频时长而定： viduq2 （1-10秒）：默认 720p, 可选：540p、720p、1080p viduq1 （5秒）：默认 1080p, 可选：1080p vidu2.0 （4秒）：默认 360p, 可选：360p、720p |
| `bgm` | string | 否 | 是否为生成的视频添加背景音乐。 默认：false，可选值 true 、false - 传 true 时系统将从预设 BGM 库中自动挑选合适的音乐并添加；不传或为 false 则不添加 BGM。 - BGM不限制时长，系统根据视频时长自动适配 |
| `payload` | string | 否 | 透传参数 不做任何处理，仅数据传输 注：最多 1048576个字符 |
| `watermark` | string | 否 | 是否添加水印 - true：添加水印； - false：不添加水印； 注1：目前水印内容为固定，内容由AI生成，默认不加 注2：您可以通过watermarked_url参数查询获取带水印的视频内容，详情见查询任务接口 |
| `wm_position` | integer | 否 | 水印位置，表示水印出现在图片的位置，可选项为： 1：左上角 2：右上角 3：右下角 4：左下角 默认为：3 |
| `wm_url` | string | 否 | 水印内容，此处为图片URL 不传时，使用默认水印：内容由AI生成 |
| `meta_data` | string | 否 | 元数据标识，json格式字符串，透传字段，您可以 自定义格式 或使用 示例格式 ，示例如下： { "Label": "your_label","ContentProducer": "yourcontentproducer","ContentPropagator": "your_content_propagator","… |
| `callback_url` | string | 否 | Callback 协议 需要您在创建任务时主动设置 callback_url，请求方法为 POST，当视频生成任务有状态变化时，Vidu 将向此地址发送包含任务最新状态的回调请求。回调请求内容结构与查询任务API的返回体一致 回调返回的"status"包括以下状态： - processing 任务处理中 - succe… |

示例：
```json
{
  "task_id": "911088422699962368",
  "type": "headtailimg2video",
  "state": "created",
  "model": "viduq1",
  "style": "general",
  "prompt": "采蘑菇的小姑娘，上山采蘑菇，遇到了比自己还大的蘑菇",
  "images": [
    "https://storage.xuanxu.net/images/1997560136907759618/1768223244152.png",
    "https://storage.xuanxu.net/images/1997560136907759618/1768223372503.png"
  ],
  "duration": 5,
  "seed": 722073967,
  "aspect_ratio": "",
  "resolution": "1080p",
  "movement_amplitude": "auto",
  "created_at": "2026-01-20T06:52:02.323137590Z",
  "credits": 80,
  "payload": "",
  "cus_priority": 0,
  "off_peak": false,
  "watermark": false,
  "is_rec": false,
  "wm_position": 1,
  "wm_url": "",
  "meta_data": "",
  "client_request_id": ""
}
```

## GET `/ent/v2/tasks/{id}/creations`
_获取请求结果_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| id | path | 是 | string |  |

## POST `/ent/v2/text2audio`
_创建文生音频任务_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 模型名称可选值：audio1.0 |
| `prompt` | string | 是 | 文本提示词用于生成音频的描述。字符长度不能超过 1500 个字符 |
| `duration` | string | 否 | 音频时长默认 10，可选范围：2～10 秒内 |
| `seed` | string | 否 | 随机种子随机种子，若不传或传0则自动生成随机数，传固定值生成确定性结果 |
| `callback_url` | string | 否 | Callback 协议 需要您在创建任务时主动设置 callback_url，请求方法为 POST，当视频生成任务有状态变化时，Vidu 将向此地址发送包含任务最新状态的回调请求。回调请求内容结构与查询任务API的返回体一致 回调返回的“status”包括以下状态： - processing 任务处理中 - succe… |

示例：
```json
{
  "model": "audio1.0",
  "prompt": "雨滴落在窗户上的声音，伴随着轻柔的雷声",
  "duration": 5
}
```

## POST `/ent/v2/text2video`
_创建文生视频任务_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 模型名称 可选值：viduq3-turbo 、viduq3-pro 、viduq2 、viduq1 - viduq3-turbo：对比viduq3-pro，生成速度更快 - viduq3-pro：高效生成优质音视频内容，让视频内容更生动、更形象、更立体，效果更好 - viduq2：最新模型 - viduq1：画面清晰，… |
| `style` | string | 否 | 风格 默认 general，可选值：general、anime general：通用风格，可以通过提示词来控制风格 anime：动漫风格，仅在动漫风格表现突出，可以通过不同的动漫风格提示词来控制 注：使用q2模型时该参数不生效 |
| `prompt` | string | 是 | 文本提示词 生成视频的文本描述。 注：字符长度不能超过 2000 个字符 |
| `duration` | number | 否 | 视频时长参数，默认值依据模型而定： - viduq3-pro、viduq3-turbo: 默认5秒，可选：1-16 - viduq2 : 默认5秒，可选：1-10 - viduq1 : 默认5秒，可选：5 |
| `seed` | string | 否 | 随机种子 当默认不传或者传0时，会使用随机数替代 手动设置则使用设置的种子 |
| `aspect_ratio` | string | 否 | 比例 默认 16:9，可选值：16:9、9:16、3:4、4:3、1:1 注：3:4、4:3仅支持q2模型 |
| `resolution` | string | 否 | 分辨率参数，默认值依据模型和视频时长而定： - viduq3-pro、viduq3-turbo(1-16秒)：默认 720p，可选：540p、720p、1080p - viduq2(1-10秒)：默认 720p，可选：540p、720p、1080p - viduq1(5秒)：默认 1080p，可选：1080p |
| `movement_amplitude` | string | 否 | 运动幅度 默认 auto，可选值：auto、small、medium、large 注：使用q2模型时该参数不生效 |
| `bgm` | string | 否 | 是否为生成的视频添加背景音乐。 默认：false，可选值 true 、false 传 true 时系统将从预设 BGM 库中自动挑选合适的音乐并添加；不传或为 false 则不添加 BGM。 - BGM不限制时长，系统根据视频时长自动适配 |
| `payload` | string | 否 | 透传参数 不做任何处理，仅数据传输 注：最多 1048576个字符 |
| `watermark` | string | 否 | 是否添加水印 - true：添加水印； - false：不添加水印； 注1：目前水印内容为固定，内容由AI生成，默认不加 注2：您可以通过watermarked_url参数查询获取带水印的视频内容，详情见查询任务接口 |
| `wm_position` | string | 否 | 水印位置，表示水印出现在图片的位置，可选项为： 1：左上角 2：右上角 3：右下角 4：左下角 默认为：3 |
| `wm_url` | string | 否 | 水印内容，此处为图片URL 不传时，使用默认水印：内容由AI生成 |
| `meta_data` | string | 否 | 元数据标识，json格式字符串，透传字段，您可以 自定义格式 或使用 示例格式 ，示例如下： { "Label": "your_label","ContentProducer": "yourcontentproducer","ContentPropagator": "your_content_propagator","… |
| `callback_url` | string | 否 | Callback 协议 需要您在创建任务时主动设置 callback_url，请求方法为 POST，当视频生成任务有状态变化时，Vidu 将向此地址发送包含任务最新状态的回调请求。回调请求内容结构与查询任务API的返回体一致 回调返回的"status"包括以下状态： - processing 任务处理中 - succe… |

示例：
```json
{
  "model": "viduq2",
  "prompt": "一只可爱的小猫在花园里玩耍，阳光明媚，画面温馨"
}
```

## POST `/vidu-native/video/generations`
_创建视频_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 模型名字 grok-video-3 |
| `prompt` | string | 是 | 提示词 |
| `aspect_ratio` | string | 是 | 可选为 2:3, 3:2, 1:1 |
| `size` | string | 是 | 720P或者1080P |
| `images` | array | 是 | 图片链接 |

示例：
```json
{
  "model": "TC-Vidu",
  "prompt": "一只可爱的小猫在花园里玩耍",
  "settings": {
    "settings": {
      "duration": 4,
      "resolution": "1080p",
      "aspect_ratio": "16:9"
    }
  }
}
```

## GET `/vidu-native/video/generations/{task_id}`
_查询任务_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| task_id | path | 是 | string |  |
| X-Forwarded-Host | header | 否 | string |  |

_请求体无显式字段定义，见 swagger 示例。_

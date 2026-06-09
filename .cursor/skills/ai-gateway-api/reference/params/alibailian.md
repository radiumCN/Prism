# 阿里百炼 (/alibailian) · 参数字段

> 由 `scripts/gen_params.py` 从 swagger 自动生成。鉴权 `Authorization: Bearer <API_KEY>`。
> 字段名含 `.` 表示嵌套对象，`[]` 表示数组元素。说明过长已截断，完整内容见 swagger。

## POST `/alibailian/api/v1/services/aigc/multimodal-generation/generation`
_语音合成 Copy_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 |  |
| `input` | object | 是 |  |
| `input.text` | string | 是 |  |
| `input.voice` | string | 是 |  |
| `input.language_type` | string | 否 |  |

## POST `/alibailian/api/v1/services/aigc/video-generation/video-synthesis`
_happyhorse-1.0-video-edit_

**请求体字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | 模型名称。 固定值：happyhorse-1.0-video-edit。 |
| `input` | object | 是 | 输入 |
| `input.prompt` | string | 是 | 文本提示词。用来描述对视频的编辑意图，如风格转换、局部替换等。 支持任何语言输入，长度不超过5000个非中文字符或2500个中文字符，超过部分会自动截断。 |
| `input.media` | array | 是 | 媒体素材列表，用于指定待编辑的视频和参考图像。 数组必须包含1个 video 类型元素；可选包含0~5个 reference_image 类型元素。 |
| `input.media[].type` | string | 是 | 媒体素材类型。可选值为： video：必传。待编辑的视频。 reference_image：可选。参考图像。 素材限制： 视频数量：有且仅有1个。 参考图像数量：0～5张。 |
| `input.media[].url` | string | 是 | 传入视频（type=video） 待编辑的视频URL，必须为公网可访问的URL。 支持 HTTP 和 HTTPS 协议。 示例值：https://xxx/xxx.mp4。 视频限制： 格式：MP4、MOV（建议H.264编码）。 时长：3~60秒。 分辨率：长边不超过2160像素，短边不小于320像素。 宽高比：1:2… |
| `parameters` | object | 否 | 参数 |
| `parameters.resolution` | string | 否 | 生成视频的分辨率档位。 可选值： 1080P：默认值。 720P |
| `parameters.watermark` | boolean | 否 | 是否在生成的视频上添加水印标识。水印位于视频右下角，文案固定为“Happy Horse”。 true：默认值，添加水印。 false：不添加水印。 |
| `parameters.audio_setting ` | string | 否 | 声音控制。 auto：默认值，由模型自行控制。 origin：保留输入视频的原始声音。 |

示例：
```json
{
  "model": "happyhorse-1.0-video-edit",
  "input": {
    "prompt": "让视频中的马头人身角色穿上图片中的条纹毛衣",
    "media": [
      {
        "type": "video",
        "url": "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20260409/dozxak/Wan_Video_Edit_33_1.mp4"
      },
      {
        "type": "reference_image",
        "url": "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20260415/hynnff/wan-video-edit-clothes.webp"
      }
    ]
  },
  "parameters": {
    "resolution": "720P"
  }
}
```

## GET `/alibailian/api/v1/tasks/{task_id}`
_视频查询_

**路径/查询/头参数**

| 参数 | 位置 | 必填 | 类型 | 说明 |
|------|------|------|------|------|
| task_id | path | 是 | string |  |

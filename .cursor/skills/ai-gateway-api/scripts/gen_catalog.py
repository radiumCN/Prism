"""从 swagger 生成完整端点目录 all-endpoints.md。
用法: python scripts/gen_catalog.py <swagger.json> <输出.md>
重新生成: 当 swagger 更新后，重跑本脚本刷新 reference/all-endpoints.md。
"""
import json
import io
import sys
from collections import OrderedDict

swagger = sys.argv[1] if len(sys.argv) > 1 else "默认模块.swagger.json"
out = sys.argv[2] if len(sys.argv) > 2 else "all-endpoints.md"

with io.open(swagger, encoding="utf-8") as f:
    doc = json.load(f)

# (分组标题, 匹配前缀列表)，按顺序匹配，命中即归类
GROUPS = [
    ("OpenAI 兼容 · 文本/嵌入/重排序", ["/v1/chat/completions", "/v1/completions", "/v1/responses", "/v1/embeddings", "/v1/rerank", "/v1/messages", "/v1/models"]),
    ("OpenAI 兼容 · 音频", ["/v1/audio/"]),
    ("OpenAI 兼容 · 图片", ["/v1/images/"]),
    ("OpenAI/Sora · 视频", ["/v1/video/", "/v1/videos", "/sora/"]),
    ("Gemini 原生 (/v1beta)", ["/v1beta/"]),
    ("Midjourney (/mj)", ["/mj/"]),
    ("Ideogram (/ideogram)", ["/ideogram/"]),
    ("fal-ai (/fal-ai)", ["/fal-ai/"]),
    ("Replicate (/replicate)", ["/replicate/"]),
    ("Kling (/kling)", ["/kling/"]),
    ("Luma (/luma)", ["/luma/"]),
    ("Runway (/runwayml)", ["/runwayml/"]),
    ("即梦 Jimeng (/jimeng)", ["/jimeng/"]),
    ("海螺 Hailuo (/openapi/v2)", ["/openapi/"]),
    ("MiniMax (/minimax)", ["/minimax/"]),
    ("Suno (/suno)", ["/suno/"]),
    ("Vidu (/ent/v2, /vidu-native)", ["/ent/", "/vidu-native/"]),
    ("豆包/火山 Volc (/volc, /api/v3)", ["/volc/", "/api/v3/"]),
    ("阿里百炼 (/alibailian)", ["/alibailian/"]),
    ("腾讯云 VOD (/tencent-vod)", ["/tencent-vod/"]),
    ("数字人 (/v1/private-avatar, /v1/real-avatar)", ["/v1/private-avatar/", "/v1/real-avatar/"]),
    ("令牌/账号/额度 (/api)", ["/api/token", "/api/user", "/api/usage", "/api/upload"]),
]

METHOD_ORDER = {"post": 0, "get": 1, "put": 2, "patch": 3, "delete": 4}


def classify(path):
    for title, prefixes in GROUPS:
        for pre in prefixes:
            if path == pre or path.startswith(pre):
                return title
    return "其他"


buckets = OrderedDict((title, []) for title, _ in GROUPS)
buckets["其他"] = []

total_ops = 0
for path, methods in doc["paths"].items():
    for method, op in methods.items():
        if not isinstance(op, dict):
            continue
        total_ops += 1
        summary = (op.get("summary") or "").strip()
        buckets[classify(path)].append((method, path, summary))

lines = []
lines.append("# 全部端点目录（自动生成）")
lines.append("")
lines.append("> 由 `scripts/gen_catalog.py` 从 `默认模块.swagger.json` 生成，覆盖全部端点。")
lines.append("> swagger 更新后重跑：`python scripts/gen_catalog.py 默认模块.swagger.json reference/all-endpoints.md`")
lines.append(">")
lines.append(f"> 共 {len(doc['paths'])} 个 path，{total_ops} 个操作。鉴权统一 `Authorization: Bearer <API_KEY>`；")
lines.append("> 令牌管理类额外需 `new-api-user` 头。精确参数请在 swagger 中检索对应 path。")
lines.append("")

for title in buckets:
    ops = buckets[title]
    if not ops:
        continue
    ops.sort(key=lambda x: (x[1], METHOD_ORDER.get(x[0], 9)))
    lines.append(f"## {title}（{len(ops)}）")
    lines.append("")
    lines.append("| Method | Path | 说明 |")
    lines.append("|--------|------|------|")
    for method, path, summary in ops:
        summary = summary.replace("|", "\\|").replace("\n", " ")
        lines.append(f"| {method.upper()} | `{path}` | {summary} |")
    lines.append("")

with io.open(out, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

print(f"OK: {len(doc['paths'])} paths, {total_ops} ops -> {out}")

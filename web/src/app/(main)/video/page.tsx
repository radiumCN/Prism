'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Form, Input, Button, Select, Card, Spin, Empty, App,
  Typography, Tooltip, Radio, Tabs, Badge, Tag, Space, Divider, Switch, InputNumber,
} from 'antd';
import {
  VideoCameraOutlined, DownloadOutlined, ReloadOutlined,
  HistoryOutlined, ThunderboltOutlined, PlayCircleOutlined,
  LinkOutlined, PlusOutlined, DeleteOutlined, ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import AppLayout from '@/components/Layout/AppLayout';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { ModelInfo } from '@/types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface VideoHistoryItem {
  id: number;
  prompt: string;
  video_url: string;
  status: string;
  error_message?: string;
  created_at: string;
}

interface GeneratedVideo {
  id?: number;
  videoUrl: string;
  prompt: string;
  model?: string;
  resolution?: string;
  createdAt?: string;
}

interface VideoFormValues {
  modelKey: string;
  prompt: string;
  resolution: string;
  ratio: string;       // t2v, r2v
  duration: number;    // t2v, i2v, r2v (3-15)
  audioSetting: string;
  watermark: boolean;
  imageUrl?: string;   // i2v: first_frame
  videoUrl?: string;   // video-edit
}

// ─── Compact card for grid (history + extra items) ───────────────────────────
function VideoCard({ item, onPlay }: { item: GeneratedVideo; onPlay: (url: string) => void }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      styles={{ body: { padding: 0 } }}
      style={{
        borderRadius: 14, overflow: 'hidden',
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${hovered ? 'rgba(139,92,246,0.45)' : 'rgba(255,255,255,0.07)'}`,
        boxShadow: hovered ? '0 6px 24px rgba(139,92,246,0.18)' : '0 2px 8px rgba(0,0,0,0.25)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
      }}
      onClick={() => onPlay(item.videoUrl)}
    >
      <div style={{ position: 'relative', background: '#080808', aspectRatio: '16/9' }}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video src={item.videoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} preload="metadata" />
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: hovered ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.45)',
          transition: 'background 0.2s',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(139,92,246,0.8)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            transform: hovered ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 0.2s',
          }}>
            <PlayCircleOutlined style={{ fontSize: 18, color: '#fff', marginLeft: 1 }} />
          </div>
        </div>
      </div>
      <div style={{ padding: '10px 12px 12px' }}>
        <Paragraph ellipsis={{ rows: 2 }} style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginBottom: 6 }}>
          {item.prompt}
        </Paragraph>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {item.resolution && (
            <Tag style={{ fontSize: 10, margin: 0, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: 'rgba(167,139,250,0.9)' }}>
              {item.resolution}
            </Tag>
          )}
          {item.createdAt && (
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>{item.createdAt}</Text>
          )}
          <Tooltip title="下载">
            <Button size="small" type="text" icon={<DownloadOutlined />}
              style={{ color: 'rgba(255,255,255,0.5)', padding: '0 4px' }}
              onClick={(e) => { e.stopPropagation(); const a = document.createElement('a'); a.href = item.videoUrl; a.download = `ai-video-${Date.now()}.mp4`; a.target = '_blank'; a.click(); }}
            />
          </Tooltip>
        </div>
      </div>
    </Card>
  );
}

// ─── Hero player for the latest generated video ───────────────────────────────
function VideoHero({ item, onPlay }: { item: GeneratedVideo; onPlay: (url: string) => void }) {
  return (
    <div style={{
      borderRadius: 20, overflow: 'hidden',
      border: '1px solid rgba(139,92,246,0.35)',
      boxShadow: '0 16px 48px rgba(139,92,246,0.2)',
      background: '#080808',
      marginBottom: 24,
    }}>
      {/* Video area */}
      <div
        style={{ position: 'relative', cursor: 'pointer', aspectRatio: '16/9' }}
        onClick={() => onPlay(item.videoUrl)}
      >
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src={item.videoUrl}
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          preload="metadata"
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(139,92,246,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(139,92,246,0.5)',
          }}>
            <PlayCircleOutlined style={{ fontSize: 32, color: '#fff', marginLeft: 3 }} />
          </div>
        </div>
        {/* NEW badge */}
        <div style={{
          position: 'absolute', top: 14, left: 14,
          background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
          borderRadius: 20, padding: '3px 10px',
          fontSize: 11, color: '#fff', fontWeight: 600, letterSpacing: 0.5,
        }}>
          NEW
        </div>
      </div>

      {/* Info bar */}
      <div style={{ padding: '16px 20px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <CheckCircleOutlined style={{ fontSize: 18, color: '#a78bfa', marginTop: 2, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Paragraph
            ellipsis={{ rows: 2 }}
            style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, marginBottom: 8, fontWeight: 500 }}
          >
            {item.prompt}
          </Paragraph>
          <Space size={8} wrap>
            {item.model && (
              <Tag style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd', fontSize: 11 }}>
                {item.model}
              </Tag>
            )}
            {item.resolution && (
              <Tag style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
                {item.resolution}
              </Tag>
            )}
            {item.createdAt && (
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <ClockCircleOutlined style={{ fontSize: 10 }} />{item.createdAt}
              </span>
            )}
          </Space>
        </div>
        <Space>
          <Tooltip title="全屏播放">
            <Button
              icon={<PlayCircleOutlined />}
              style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.35)', color: '#a78bfa' }}
              onClick={() => onPlay(item.videoUrl)}
            >播放</Button>
          </Tooltip>
          <Tooltip title="下载视频">
            <Button
              icon={<DownloadOutlined />}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
              onClick={() => { const a = document.createElement('a'); a.href = item.videoUrl; a.download = `ai-video-${Date.now()}.mp4`; a.target = '_blank'; a.click(); }}
            >下载</Button>
          </Tooltip>
          <Tooltip title="复制链接">
            <Button
              icon={<LinkOutlined />}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
              onClick={() => navigator.clipboard.writeText(item.videoUrl)}
            />
          </Tooltip>
        </Space>
      </div>
    </div>
  );
}

export default function VideoPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const [mounted, setMounted] = useState(false);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [generating, setGenerating] = useState(false);
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [history, setHistory] = useState<VideoHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const [referenceImages, setReferenceImages] = useState<string[]>(['']);
  const [form] = Form.useForm<VideoFormValues>();
  const [selectedModelKey, setSelectedModelKey] = useState('');

  const selectedModel = models.find((m) => `${m.provider_id}:${m.model_id}` === selectedModelKey);
  const selectedModelName = selectedModel?.model_name?.toLowerCase() ?? '';

  const modelKind = selectedModelName.includes('video-edit') ? 'edit'
    : selectedModelName.includes('i2v') ? 'i2v'
    : selectedModelName.includes('r2v') ? 'r2v'
    : selectedModelName ? 't2v' : '';

  useEffect(() => { setMounted(true); }, []);

  const loadHistory = useCallback(async (populateVideos = false) => {
    setHistoryLoading(true);
    try {
      const items = await api.get<VideoHistoryItem[]>('/videos/history');
      const list = items ?? [];
      setHistory(list);
      if (populateVideos) {
        const recent = list
          .filter((h) => h.status === 'completed' && h.video_url)
          .slice(0, 10)
          .map((h) => ({ id: h.id, videoUrl: h.video_url, prompt: h.prompt, createdAt: h.created_at }));
        if (recent.length > 0) setVideos(recent);
      }
    } catch { /* non-critical */ }
    finally { setHistoryLoading(false); }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) { router.replace('/login'); return; }
    api.get<ModelInfo[]>('/models?type=video').then((list) => setModels(list ?? [])).catch(console.error);
    loadHistory(false);
  }, [mounted, isAuthenticated, router, loadHistory]);

  useEffect(() => {
    if (activeTab === 'history') loadHistory(false);
  }, [activeTab, loadHistory]);

  const handleGenerate = async (values: VideoFormValues) => {
    const [providerID, modelID] = values.modelKey.split(':').map(Number);
    setGenerating(true);
    try {
      const falseVal = false;
      const body: Record<string, unknown> = {
        model_id: modelID,
        provider_id: providerID,
        prompt: values.prompt,
        resolution: values.resolution || '1080P',
        watermark: values.watermark ?? falseVal,
      };
      // ratio: t2v / r2v only
      if ((modelKind === 't2v' || modelKind === 'r2v') && values.ratio) body.ratio = values.ratio;
      // duration: t2v, i2v, r2v (not video-edit)
      if (modelKind !== 'edit' && values.duration && values.duration > 0) body.duration = values.duration;
      // audio_setting: video-edit only
      if (modelKind === 'edit') body.audio_setting = values.audioSetting || 'auto';

      if (modelKind === 'i2v' && values.imageUrl) body.image_url = values.imageUrl;
      if (modelKind === 'r2v') body.reference_images = referenceImages.filter(Boolean);
      if (modelKind === 'edit') {
        if (values.videoUrl) body.video_url = values.videoUrl;
        body.reference_images = referenceImages.filter(Boolean);
      }

      const result = await api.post<{ id: number; video_url: string; prompt: string }>(
        '/videos/generate', body
      );
      const newVid: GeneratedVideo = {
        id: result.id,
        videoUrl: result.video_url,
        prompt: result.prompt,
        model: selectedModel ? `${selectedModel.provider_name} / ${selectedModel.display_name}` : undefined,
        resolution: values.resolution || '1080P',
        createdAt: new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      };
      setVideos((prev) => [newVid, ...prev]);
      setActiveTab('generate');
      message.success('视频生成成功');
      loadHistory(false);
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '生成失败，请检查模型配置');
    } finally {
      setGenerating(false);
    }
  };

  if (!mounted || !isAuthenticated) return null;

  return (
    <AppLayout>
      {/* Full-screen video player */}
      {playingUrl && (
        <div
          onClick={() => setPlayingUrl(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.96)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out',
          }}
        >
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={playingUrl} controls autoPlay
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12 }}
            onClick={(e) => e.stopPropagation()}
          />
          <Button
            icon={<DownloadOutlined />} type="primary"
            style={{ position: 'absolute', bottom: 32, right: 32 }}
            onClick={() => { const a = document.createElement('a'); a.href = playingUrl; a.download = `ai-video-${Date.now()}.mp4`; a.target = '_blank'; a.click(); }}
          >下载</Button>
        </div>
      )}

      <div style={{ padding: 24, overflow: 'auto', height: '100%' }}>
        <Title level={3} style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 24 }}>
          <VideoCameraOutlined style={{ marginRight: 8 }} />AI 视频
        </Title>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* ── Left: form ── */}
          <Card className="glass" style={{ width: 360, flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
            <Form
              form={form} layout="vertical" onFinish={handleGenerate}
              initialValues={{ resolution: '1080P', ratio: '16:9', duration: 5, audioSetting: 'auto', watermark: false }}
            >
              <Form.Item name="modelKey" label="模型" rules={[{ required: true, message: '请选择模型' }]}>
                <Select
                  placeholder="选择视频生成模型"
                  onChange={(v) => setSelectedModelKey(v as string)}
                  notFoundContent={<Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>暂无视频模型，请在管理后台添加类型为「视频生成」的模型</Text>}
                  options={models.map((m) => ({
                    value: `${m.provider_id}:${m.model_id}`,
                    label: (
                      <span>
                        <Tag color="blue" style={{ fontSize: 11, marginRight: 6 }}>{m.provider_name}</Tag>
                        {m.display_name}
                      </span>
                    ),
                  }))}
                />
              </Form.Item>

              {modelKind && (
                <div style={{ marginTop: -12, marginBottom: 12 }}>
                  <Tag color={{ t2v: 'purple', i2v: 'blue', r2v: 'cyan', edit: 'gold' }[modelKind]}>
                    {{ t2v: '文字 → 视频', i2v: '图片 → 视频', r2v: '参考图 → 视频', edit: '视频编辑' }[modelKind]}
                  </Tag>
                </div>
              )}

              <Form.Item name="prompt" label="描述提示词" rules={[{ required: true, message: '请输入提示词' }]}>
                <TextArea rows={4} placeholder="描述你想要生成的视频内容…" maxLength={2500} showCount />
              </Form.Item>

              {/* i2v ─ first-frame image */}
              {modelKind === 'i2v' && (
                <>
                  <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '4px 0 14px' }} />
                  <Form.Item name="imageUrl" label="首帧图片 URL（必填）" rules={[{ required: true, message: '请输入首帧图片 URL' }]}
                    extra={<span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>格式: JPEG/JPG/PNG/WEBP，宽高比 1:2.5~2.5:1，≤10MB</span>}>
                    <Input placeholder="https://example.com/image.jpg" />
                  </Form.Item>
                </>
              )}

              {/* r2v ─ reference images (1-9) */}
              {modelKind === 'r2v' && (
                <>
                  <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '4px 0 14px' }} />
                  <Form.Item label="参考图片（1-9 张，必填）" required
                    extra={<span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>在 prompt 中用 [Image 1]、[Image 2] 引用对应图片</span>}>
                    {referenceImages.map((url, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <Input value={url} placeholder={`[Image ${i + 1}] 对应的图片 URL`}
                          onChange={(e) => { const n = [...referenceImages]; n[i] = e.target.value; setReferenceImages(n); }} />
                        {referenceImages.length > 1 && (
                          <Button size="small" type="text" danger icon={<DeleteOutlined />}
                            onClick={() => setReferenceImages(referenceImages.filter((_, j) => j !== i))} />
                        )}
                      </div>
                    ))}
                    {referenceImages.length < 9 && (
                      <Button size="small" type="dashed" icon={<PlusOutlined />}
                        onClick={() => setReferenceImages([...referenceImages, ''])}
                        style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.2)' }}>
                        添加参考图片
                      </Button>
                    )}
                  </Form.Item>
                </>
              )}

              {/* video-edit ─ source video + optional reference images */}
              {modelKind === 'edit' && (
                <>
                  <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '4px 0 14px' }} />
                  <Form.Item name="videoUrl" label="待编辑视频 URL" rules={[{ required: true, message: '请输入视频 URL' }]}>
                    <Input placeholder="https://example.com/video.mp4（MP4/MOV，3–60 秒）" />
                  </Form.Item>
                  <Form.Item label="参考图片（可选，最多 5 张）">
                    {referenceImages.map((url, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <Input value={url} placeholder={`参考图片 URL ${i + 1}`}
                          onChange={(e) => { const n = [...referenceImages]; n[i] = e.target.value; setReferenceImages(n); }} />
                        {referenceImages.length > 1 && (
                          <Button size="small" type="text" danger icon={<DeleteOutlined />}
                            onClick={() => setReferenceImages(referenceImages.filter((_, j) => j !== i))} />
                        )}
                      </div>
                    ))}
                    {referenceImages.length < 5 && (
                      <Button size="small" type="dashed" icon={<PlusOutlined />}
                        onClick={() => setReferenceImages([...referenceImages, ''])}
                        style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.2)' }}>
                        添加参考图片
                      </Button>
                    )}
                  </Form.Item>
                </>
              )}

              <Divider style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '4px 0 14px' }} />

              <Form.Item label="分辨率" name="resolution">
                <Radio.Group>
                  <Radio value="1080P">1080P（默认）</Radio>
                  <Radio value="720P">720P</Radio>
                </Radio.Group>
              </Form.Item>

              {/* ratio — t2v and r2v only */}
              {(modelKind === 't2v' || modelKind === 'r2v') && (
                <Form.Item label="宽高比" name="ratio">
                  <Radio.Group>
                    <Radio value="16:9">16:9（默认）</Radio>
                    <Radio value="9:16">9:16</Radio>
                    <Radio value="1:1">1:1</Radio>
                    <Radio value="4:3">4:3</Radio>
                    <Radio value="3:4">3:4</Radio>
                  </Radio.Group>
                </Form.Item>
              )}

              {/* duration — t2v, i2v, r2v (not video-edit) */}
              {modelKind && modelKind !== 'edit' && (
                <Form.Item label="时长（秒）" name="duration">
                  <InputNumber min={3} max={15} style={{ width: '100%' }} placeholder="默认 5 秒（3-15）" />
                </Form.Item>
              )}

              {/* audio_setting — only for video-edit */}
              {modelKind === 'edit' && (
                <Form.Item label="音频处理" name="audioSetting">
                  <Radio.Group>
                    <Radio value="auto">AI 自动（默认）</Radio>
                    <Radio value="origin">保留原声</Radio>
                  </Radio.Group>
                </Form.Item>
              )}

              {/* watermark — all models */}
              {modelKind && (
                <Form.Item label="水印" name="watermark" valuePropName="checked">
                  <Switch
                    checkedChildren="显示水印"
                    unCheckedChildren="无水印"
                    style={{ background: form.getFieldValue('watermark') ? undefined : 'rgba(255,255,255,0.15)' }}
                  />
                </Form.Item>
              )}

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary" htmlType="submit" block loading={generating}
                  icon={<ThunderboltOutlined />}
                  style={{ height: 44, background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', border: 'none', fontSize: 15 }}
                >
                  {generating ? '生成中（最长约 10 分钟）…' : '生成视频'}
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* ── Right: results + history ── */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'generate',
                  label: (
                    <span>
                      <ThunderboltOutlined />本次生成
                      {videos.length > 0 && <Badge count={videos.length} style={{ marginLeft: 6 }} />}
                    </span>
                  ),
                  children: (
                    <>
                      {/* ── Generating state ── */}
                      {generating && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: 20 }}>
                          <div style={{
                            width: 72, height: 72, borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(167,139,250,0.1))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid rgba(139,92,246,0.35)',
                          }}>
                            <Spin size="large" />
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, marginBottom: 6, fontWeight: 500 }}>AI 正在生成视频…</div>
                            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>视频生成通常需要 2–10 分钟，请耐心等待</div>
                          </div>
                        </div>
                      )}

                      {/* ── Empty state ── */}
                      {!generating && videos.length === 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: 16 }}>
                          <VideoCameraOutlined style={{ fontSize: 56, color: 'rgba(255,255,255,0.1)' }} />
                          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>填写左侧表单，点击「生成视频」开始创作</Text>
                        </div>
                      )}

                      {videos.length > 0 && (
                        <>
                          {/* ── Hero: latest video ── */}
                          <VideoHero item={videos[0]} onPlay={setPlayingUrl} />

                          {/* ── Grid: previous videos in this session ── */}
                          {videos.length > 1 && (
                            <>
                              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 12 }}>
                                本次会话中的其他生成
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                                {videos.slice(1).map((v, i) => (
                                  <VideoCard key={i} item={v} onPlay={setPlayingUrl} />
                                ))}
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </>
                  ),
                },
                {
                  key: 'history',
                  label: (
                    <span><HistoryOutlined />历史记录</span>
                  ),
                  children: (
                    <>
                      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button size="small" icon={<ReloadOutlined />} onClick={() => loadHistory(false)}
                          loading={historyLoading} style={{ color: 'rgba(255,255,255,0.6)' }}>刷新</Button>
                      </div>
                      {historyLoading && <div style={{ textAlign: 'center', padding: 60 }}><Spin /></div>}
                      {!historyLoading && history.length === 0 && (
                        <Empty description={<Text style={{ color: 'rgba(255,255,255,0.4)' }}>暂无历史记录</Text>} style={{ padding: 60 }} />
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                        {history.map((item) => {
                          if (item.status === 'error') {
                            return (
                              <Card key={item.id} size="small"
                                style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: 12 }}>
                                <Tag color="error" style={{ marginBottom: 6 }}>生成失败</Tag>
                                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4 }}>{item.prompt}</div>
                                {item.error_message && <div style={{ color: 'rgba(239,68,68,0.8)', fontSize: 11 }}>{item.error_message}</div>}
                                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 4 }}>{item.created_at}</div>
                              </Card>
                            );
                          }
                          if (item.status === 'processing') {
                            return (
                              <Card key={item.id} size="small"
                                style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12 }}>
                                <Tag color="warning" style={{ marginBottom: 6 }}>生成中</Tag>
                                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{item.prompt}</div>
                                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 4 }}>{item.created_at}</div>
                              </Card>
                            );
                          }
                          return (
                            <VideoCard key={item.id}
                              item={{ id: item.id, videoUrl: item.video_url, prompt: item.prompt, createdAt: item.created_at }}
                              onPlay={setPlayingUrl}
                            />
                          );
                        })}
                      </div>
                    </>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

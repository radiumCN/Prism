'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Form, Input, Button, Select, Card, Spin, Empty, App,
  Typography, Tooltip, Radio, InputNumber, Divider, Tag, Space,
  Tabs, Badge, Segmented,
} from 'antd';
import { SettingOutlined, AppstoreOutlined } from '@ant-design/icons';
import {
  PictureOutlined, DownloadOutlined, ReloadOutlined,
  HistoryOutlined, ThunderboltOutlined, ExpandOutlined,
  CheckCircleOutlined, ClockCircleOutlined, LinkOutlined,
} from '@ant-design/icons';
import AppLayout from '@/components/Layout/AppLayout';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { ModelInfo } from '@/types';
import { useIsMobile } from '@/hooks/useIsMobile';

const { Title, Text, Paragraph } = Typography;

interface GeneratedImage {
  id?: number;
  url: string;
  prompt: string;
  model?: string;
  createdAt?: string;
}

interface HistoryItem {
  id: number;
  prompt: string;
  urls: string[];
  status: string;
  error_message?: string;
  created_at: string;
}

interface ImageFormValues {
  modelKey: string;
  prompt: string;
  negativePrompt?: string;
  // Gemini params
  aspectRatio: string;
  imageSize: string;
  // DALL-E params
  dalleSize: string;
  style?: string;
  quality?: string;
  n: number;
}

// Detect model family from model name
function modelFamily(modelName: string): 'dalle' | 'gemini' | 'imagen' | 'unknown' {
  const n = modelName.toLowerCase();
  if (n.includes('dall-e') || n.includes('dalle')) return 'dalle';
  if (n.startsWith('imagen') || n.includes('imagen-4')) return 'imagen';
  if (n.includes('gemini') && (n.includes('image') || n.includes('exp-image'))) return 'gemini';
  return 'unknown';
}

// Gemini aspect ratio options (from skill doc)
const GEMINI_ASPECT_RATIOS = [
  { label: '1:1  正方形', value: '1:1' },
  { label: '16:9  横屏宽', value: '16:9' },
  { label: '9:16  竖屏长', value: '9:16' },
  { label: '3:2  横屏标准', value: '3:2' },
  { label: '2:3  竖屏标准', value: '2:3' },
  { label: '4:3  传统横屏', value: '4:3' },
  { label: '3:4  传统竖屏', value: '3:4' },
  { label: '4:5  社交媒体', value: '4:5' },
  { label: '5:4  风景方形', value: '5:4' },
  { label: '21:9  超宽屏', value: '21:9' },
];

// Gemini image size options (from skill doc)
const GEMINI_IMAGE_SIZES = [
  { label: '1K  默认标准', value: '1K' },
  { label: '2K  高清', value: '2K' },
  { label: '4K  超高清', value: '4K' },
  { label: '0.5K / 512  仅 Gemini 3.1', value: '512' },
];

// DALL-E size presets
const DALLE_SIZES = [
  { label: '1024×1024  1:1', value: '1024x1024' },
  { label: '1536×1024  3:2', value: '1536x1024' },
  { label: '1024×1536  2:3', value: '1024x1536' },
  { label: '1792×1024  16:9', value: '1792x1024' },
  { label: '1024×1792  9:16', value: '1024x1792' },
];

function downloadImage(url: string, filename = 'generated.png') {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.click();
}

function ImageCard({ img, onExpand }: { img: GeneratedImage; onExpand: (url: string) => void }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${hovered ? 'rgba(139,92,246,0.6)' : 'rgba(255,255,255,0.08)'}`,
        boxShadow: hovered ? '0 8px 32px rgba(139,92,246,0.25)' : '0 2px 8px rgba(0,0,0,0.3)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        cursor: 'zoom-in',
      }}
      onClick={() => onExpand(img.url)}
    >
      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img.url}
        alt={img.prompt}
        style={{
          width: '100%',
          display: 'block',
          objectFit: 'cover',
          transition: 'transform 0.3s ease',
          transform: hovered ? 'scale(1.03)' : 'scale(1)',
        }}
      />

      {/* Hover overlay with actions */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
        opacity: hovered ? 1 : 0.6,
        transition: 'opacity 0.2s',
        pointerEvents: 'none',
      }} />

      {/* Top-right action buttons — only on hover */}
      <div style={{
        position: 'absolute', top: 10, right: 10,
        display: 'flex', gap: 6,
        opacity: hovered ? 1 : 0,
        transform: hovered ? 'translateY(0)' : 'translateY(-6px)',
        transition: 'opacity 0.2s, transform 0.2s',
        pointerEvents: hovered ? 'auto' : 'none',
      }}>
        <Tooltip title="展开查看">
          <Button
            size="small"
            icon={<ExpandOutlined />}
            style={{
              background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.18)',
              color: '#fff', backdropFilter: 'blur(8px)', borderRadius: 8,
            }}
            onClick={(e) => { e.stopPropagation(); onExpand(img.url); }}
          />
        </Tooltip>
        <Tooltip title="下载图片">
          <Button
            size="small"
            icon={<DownloadOutlined />}
            style={{
              background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.18)',
              color: '#fff', backdropFilter: 'blur(8px)', borderRadius: 8,
            }}
            onClick={(e) => { e.stopPropagation(); downloadImage(img.url, `ai-image-${Date.now()}.png`); }}
          />
        </Tooltip>
      </div>

      {/* Bottom info bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '12px 12px 10px',
        pointerEvents: 'none',
      }}>
        <div style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          color: 'rgba(255,255,255,0.9)',
          fontSize: 12,
          lineHeight: '1.5',
          marginBottom: 4,
        }}>
          {img.prompt}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {img.model && (
            <span style={{
              fontSize: 10, color: 'rgba(255,255,255,0.45)',
              background: 'rgba(139,92,246,0.25)', borderRadius: 4, padding: '1px 6px',
            }}>
              {img.model}
            </span>
          )}
          {img.createdAt && (
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginLeft: 'auto' }}>
              {img.createdAt}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Hero display for the latest generated image ─────────────────────────────
function ImageHero({ img, onExpand }: { img: GeneratedImage; onExpand: (url: string) => void }) {
  return (
    <div style={{
      borderRadius: 20, overflow: 'hidden',
      border: '1px solid rgba(139,92,246,0.35)',
      boxShadow: '0 16px 48px rgba(139,92,246,0.2)',
      background: '#080808',
      marginBottom: 24,
    }}>
      {/* Image area */}
      <div
        style={{ position: 'relative', cursor: 'zoom-in' }}
        onClick={() => onExpand(img.url)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img.url}
          alt={img.prompt}
          style={{ width: '100%', maxHeight: 520, objectFit: 'contain', display: 'block', background: '#080808' }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 40%)',
          pointerEvents: 'none',
        }} />
        {/* Hover expand hint */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0,
          transition: 'opacity 0.2s',
        }}
          className="img-hero-overlay"
        >
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(139,92,246,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(139,92,246,0.4)',
          }}>
            <ExpandOutlined style={{ fontSize: 22, color: '#fff' }} />
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
            {img.prompt}
          </Paragraph>
          <Space size={8} wrap>
            {img.model && (
              <Tag style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd', fontSize: 11 }}>
                {img.model}
              </Tag>
            )}
            {img.createdAt && (
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <ClockCircleOutlined style={{ fontSize: 10 }} />{img.createdAt}
              </span>
            )}
          </Space>
        </div>
        <Space>
          <Tooltip title="展开查看">
            <Button
              icon={<ExpandOutlined />}
              style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.35)', color: '#a78bfa' }}
              onClick={() => onExpand(img.url)}
            >展开</Button>
          </Tooltip>
          <Tooltip title="下载图片">
            <Button
              icon={<DownloadOutlined />}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
              onClick={() => downloadImage(img.url, `ai-image-${Date.now()}.png`)}
            >下载</Button>
          </Tooltip>
          <Tooltip title="复制图片链接">
            <Button
              icon={<LinkOutlined />}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
              onClick={() => navigator.clipboard.writeText(img.url)}
            />
          </Tooltip>
        </Space>
      </div>
    </div>
  );
}

export default function ImagePage() {
  const { message } = App.useApp();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [generating, setGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedUrl, setExpandedUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('generate');
  const [selectedModelKey, setSelectedModelKey] = useState('');
  // Mobile: which panel is visible ('result' | 'form')
  const [mobilePanel, setMobilePanel] = useState<'result' | 'form'>('result');
  const [form] = Form.useForm<ImageFormValues>();

  useEffect(() => { setMounted(true); }, []);

  // Determine which param set to show based on selected model
  const currentFamily = useMemo(() => {
    const m = models.find((m) => `${m.provider_id}:${m.model_id}` === selectedModelKey);
    return m ? modelFamily(m.model_name) : 'unknown';
  }, [selectedModelKey, models]);

  const isGemini = currentFamily === 'gemini' || currentFamily === 'imagen';
  const isDalle = currentFamily === 'dalle';

  const loadHistory = useCallback(async (populateImages = false) => {
    setHistoryLoading(true);
    try {
      const items = await api.get<HistoryItem[]>('/images/history');
      const list = items ?? [];
      setHistory(list);
      // On initial load, populate the "本次生成" panel with recent completed images
      if (populateImages) {
        const recent: GeneratedImage[] = list
          .filter((h) => h.status === 'completed' && h.urls.length > 0)
          .slice(0, 20)
          .flatMap((h) =>
            h.urls.map((url) => ({ id: h.id, url, prompt: h.prompt, createdAt: h.created_at }))
          );
        if (recent.length > 0) setImages(recent);
      }
    } catch {
      // history is non-critical
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) { router.replace('/login'); return; }
    api.get<ModelInfo[]>('/models?type=image').then((list) => setModels(list ?? [])).catch(console.error);
    loadHistory(false);
  }, [mounted, isAuthenticated, router, loadHistory]);

  const handleGenerate = async (values: ImageFormValues) => {
    const [providerID, modelID] = values.modelKey.split(':').map(Number);
    setGenerating(true);
    try {
      // Build request based on model family
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: Record<string, any> = {
        model_id: modelID,
        provider_id: providerID,
        prompt: values.prompt,
        negative_prompt: values.negativePrompt,
        n: values.n || 1,
      };
      if (isGemini) {
        body.aspect_ratio = values.aspectRatio || '1:1';
        body.image_size = values.imageSize || '1K';
      } else {
        // DALL-E style: parse size string to width/height
        const [w, h] = (values.dalleSize || '1024x1024').split('x').map(Number);
        body.width = w;
        body.height = h;
        body.style = values.style;
        body.quality = values.quality;
      }

      const result = await api.post<{ id: number; urls: string[]; prompt: string }>(
        '/images/generate', body
      );
      const selectedModel = models.find((m) => `${m.provider_id}:${m.model_id}` === values.modelKey);
      const newImgs = (result.urls || []).map((url: string) => ({
        id: result.id,
        url,
        prompt: result.prompt,
        model: selectedModel ? `${selectedModel.provider_name} / ${selectedModel.display_name}` : '',
        createdAt: new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      }));
      setImages((prev) => [...newImgs, ...prev]);
      message.success(`成功生成 ${newImgs.length} 张图像`);
      // On mobile: auto-switch to result panel after generation
      if (isMobile) setMobilePanel('result');
      // Refresh history silently so the history tab stays up to date
      loadHistory(false);
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '生成失败，请检查模型配置');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') loadHistory(false);
  }, [activeTab, loadHistory]);

  if (!mounted || !isAuthenticated) return null;

  return (
    <AppLayout>
      {/* Lightbox */}
      {expandedUrl && (
        <div
          onClick={() => setExpandedUrl(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.92)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={expandedUrl}
            alt="preview"
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }}
            onClick={(e) => e.stopPropagation()}
          />
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            style={{ position: 'absolute', bottom: 32, right: 32 }}
            onClick={() => downloadImage(expandedUrl, `ai-image-${Date.now()}.png`)}
          >
            下载
          </Button>
        </div>
      )}

      {/* Mobile panel switcher */}
      {isMobile && (
        <div style={{
          padding: '8px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600 }}>
            <PictureOutlined style={{ marginRight: 6 }} />AI 绘图
          </span>
          <Segmented
            size="small"
            value={mobilePanel}
            onChange={(v) => setMobilePanel(v as 'result' | 'form')}
            options={[
              { value: 'result', label: <span><AppstoreOutlined /> 结果</span> },
              { value: 'form', label: <span><SettingOutlined /> 参数</span> },
            ]}
            style={{ background: 'rgba(255,255,255,0.08)' }}
          />
        </div>
      )}

      <div style={{ padding: isMobile ? '12px 14px' : 24, overflow: 'auto', height: '100%' }}>
        {!isMobile && (
          <Title level={3} style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 24 }}>
            <PictureOutlined style={{ marginRight: 8 }} />
            AI 绘图
          </Title>
        )}

        <div style={{ display: 'flex', gap: isMobile ? 0 : 24, alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row' }}>
          {/* Left panel: form */}
          {(!isMobile || mobilePanel === 'form') && (
          <Card className="glass" style={{ width: isMobile ? '100%' : 360, flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleGenerate}
              initialValues={{
                aspectRatio: '1:1', imageSize: '1K',
                dalleSize: '1024x1024', n: 1,
                style: 'vivid', quality: 'standard',
              }}
            >
              <Form.Item name="modelKey" label="模型" rules={[{ required: true, message: '请选择模型' }]}>
                <Select
                  placeholder="选择图像生成模型"
                  onChange={(val) => setSelectedModelKey(val as string)}
                  notFoundContent={
                    <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                      暂无图像模型，请在管理后台添加类型为「图像生成」的模型
                    </Text>
                  }
                  options={models.map((m) => ({
                    value: `${m.provider_id}:${m.model_id}`,
                    label: (
                      <span>
                        <Tag color={modelFamily(m.model_name) === 'dalle' ? 'blue' : 'green'} style={{ fontSize: 11 }}>
                          {modelFamily(m.model_name) === 'dalle' ? 'DALL-E' : modelFamily(m.model_name) === 'imagen' ? 'Imagen' : 'Gemini'}
                        </Tag>
                        {m.display_name}
                      </span>
                    ),
                  }))}
                />
              </Form.Item>

              <Form.Item name="prompt" label="描述提示词" rules={[{ required: true, message: '请输入图像描述' }]}>
                <Input.TextArea
                  rows={4}
                  placeholder="描述你想要的图像，例如：一只坐在月光下弹吉他的猫，水彩画风格，高质量..."
                  style={{ resize: 'none' }}
                />
              </Form.Item>

              <Form.Item name="negativePrompt" label="负向提示词（可选）">
                <Input.TextArea
                  rows={2}
                  placeholder="不想要出现的元素，例如：模糊, 低质量, 变形..."
                  style={{ resize: 'none' }}
                />
              </Form.Item>

              {/* Gemini params */}
              {isGemini && (
                <>
                  <Form.Item name="aspectRatio" label="宽高比">
                    <Radio.Group style={{ width: '100%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {GEMINI_ASPECT_RATIOS.map((s) => (
                          <Radio key={s.value} value={s.value} style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                            {s.label}
                          </Radio>
                        ))}
                      </div>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item name="imageSize" label="分辨率">
                    <Select options={GEMINI_IMAGE_SIZES} />
                  </Form.Item>
                </>
              )}

              {/* DALL-E / unknown params */}
              {!isGemini && (
                <>
                  <Form.Item name="dalleSize" label="尺寸">
                    <Radio.Group style={{ width: '100%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {DALLE_SIZES.map((s) => (
                          <Radio key={s.value} value={s.value} style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                            {s.label}
                          </Radio>
                        ))}
                      </div>
                    </Radio.Group>
                  </Form.Item>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Form.Item name="style" label="风格">
                      <Select options={[
                        { value: 'vivid', label: '生动 (Vivid)' },
                        { value: 'natural', label: '自然 (Natural)' },
                      ]} />
                    </Form.Item>
                    <Form.Item name="quality" label="质量">
                      <Select options={[
                        { value: 'standard', label: '标准' },
                        { value: 'hd', label: 'HD 高清' },
                      ]} />
                    </Form.Item>
                  </div>
                </>
              )}

              <Form.Item name="n" label={`生成数量${isGemini ? '（Gemini 目前每次生成 1 张）' : ''}`}>
                <InputNumber min={1} max={isGemini ? 1 : 4} style={{ width: '100%' }} disabled={isGemini} />
              </Form.Item>

              <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '8px 0 16px' }} />

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={generating}
                  icon={<ThunderboltOutlined />}
                  style={{ height: 44, background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', border: 'none', fontSize: 15 }}
                >
                  {generating ? '生成中...' : '生成图像'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
          )}

          {/* Right panel: results + history */}
          {(!isMobile || mobilePanel === 'result') && (
          <div style={{ flex: 1, minWidth: 0, width: isMobile ? '100%' : undefined }}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'generate',
                  label: (
                    <span>
                      <ThunderboltOutlined />
                      本次生成
                      {images.length > 0 && <Badge count={images.length} style={{ marginLeft: 6 }} />}
                    </span>
                  ),
                  children: (
                    <>
                      {generating && (
                        <div style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          justifyContent: 'center', padding: '80px 0', gap: 20,
                        }}>
                          <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(167,139,250,0.1))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid rgba(139,92,246,0.3)',
                          }}>
                            <Spin size="large" />
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, marginBottom: 4 }}>AI 正在创作中…</div>
                            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>通常需要 10–30 秒，请稍候</div>
                          </div>
                        </div>
                      )}
                      {!generating && images.length === 0 && (
                        <div style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          justifyContent: 'center', padding: isMobile ? '48px 0' : '80px 0', gap: 16,
                        }}>
                          <PictureOutlined style={{ fontSize: isMobile ? 44 : 56, color: 'rgba(255,255,255,0.1)' }} />
                          {isMobile ? (
                            <Button
                              type="primary"
                              icon={<SettingOutlined />}
                              onClick={() => setMobilePanel('form')}
                              style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', border: 'none' }}
                            >
                              去配置参数并生成
                            </Button>
                          ) : (
                            <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
                              填写左侧表单，点击「生成图像」开始创作
                            </Text>
                          )}
                        </div>
                      )}
                      {images.length > 0 && (
                        <>
                          {/* Latest image — hero display */}
                          <ImageHero img={images[0]} onExpand={setExpandedUrl} />
                          {/* Remaining images — compact grid */}
                          {images.length > 1 && (
                            <>
                              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 12 }}>
                                本次其他生成（共 {images.length} 张）
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                                {images.slice(1).map((img, i) => (
                                  <ImageCard key={i + 1} img={img} onExpand={setExpandedUrl} />
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
                    <span>
                      <HistoryOutlined />
                      历史记录
                    </span>
                  ),
                  children: (
                    <>
                      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          icon={<ReloadOutlined />}
                          onClick={() => loadHistory(false)}
                          loading={historyLoading}
                          style={{ color: 'rgba(255,255,255,0.6)' }}
                        >
                          刷新
                        </Button>
                      </div>
                      {historyLoading && (
                        <div style={{ textAlign: 'center', padding: 60 }}><Spin /></div>
                      )}
                      {!historyLoading && history.length === 0 && (
                        <Empty
                          description={<Text style={{ color: 'rgba(255,255,255,0.4)' }}>暂无历史记录</Text>}
                          style={{ padding: 60 }}
                        />
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                        {history.flatMap((item) => {
                          if (item.status === 'error') {
                            return [(
                              <Card
                                key={`err-${item.id}`}
                                size="small"
                                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12 }}
                              >
                                <Tag color="error" style={{ marginBottom: 6 }}>生成失败</Tag>
                                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4 }}>{item.prompt}</div>
                                {item.error_message && (
                                  <div style={{ color: 'rgba(239,68,68,0.8)', fontSize: 11 }}>{item.error_message}</div>
                                )}
                                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 4 }}>{item.created_at}</div>
                              </Card>
                            )];
                          }
                          return item.urls.map((url, j) => (
                            <ImageCard
                              key={`${item.id}-${j}`}
                              img={{ url, prompt: item.prompt, createdAt: item.created_at }}
                              onExpand={setExpandedUrl}
                            />
                          ));
                        })}
                      </div>
                    </>
                  ),
                },
              ]}
            />
          </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

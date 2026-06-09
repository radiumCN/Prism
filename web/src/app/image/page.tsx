'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Card, Image, Spin, Empty, message, Typography } from 'antd';
import { PictureOutlined } from '@ant-design/icons';
import AppLayout from '@/components/Layout/AppLayout';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { ModelInfo } from '@/types';

const { Title, Text } = Typography;

interface GeneratedImage {
  url: string;
  prompt: string;
}

interface ImageFormValues {
  modelKey: string; // "provider_id:model_id"
  prompt: string;
  width?: number;
  height?: number;
}

export default function ImagePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [generating, setGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [form] = Form.useForm<ImageFormValues>();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    api.get<ModelInfo[]>('/models?type=image').then((list) => setModels(list ?? [])).catch(console.error);
  }, [isAuthenticated, router]);

  const handleGenerate = async (values: ImageFormValues) => {
    const [providerID, modelID] = values.modelKey.split(':').map(Number);
    setGenerating(true);
    try {
      const result = await api.post<{ result_url: string; prompt: string }>('/images/generate', {
        model_id: modelID,
        provider_id: providerID,
        prompt: values.prompt,
        width: values.width,
        height: values.height,
      });
      setImages((prev) => [{ url: result.result_url, prompt: result.prompt }, ...prev]);
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '生成失败');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AppLayout>
      <div style={{ padding: 24, overflow: 'auto', height: '100%' }}>
        <Title level={3} style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 24 }}>
          <PictureOutlined style={{ marginRight: 8 }} />
          AI 绘图
        </Title>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <Card className="glass" style={{ width: 380, flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
            <Form form={form} layout="vertical" onFinish={handleGenerate}>
              <Form.Item name="modelKey" label="模型" rules={[{ required: true }]}>
                <Select
                  placeholder="选择图像生成模型"
                  options={models.map((m) => ({
                    value: `${m.provider_id}:${m.model_id}`,
                    label: `${m.provider_name} / ${m.display_name}`,
                  }))}
                />
              </Form.Item>
              <Form.Item name="prompt" label="描述" rules={[{ required: true, message: '请输入图像描述' }]}>
                <Input.TextArea
                  rows={4}
                  placeholder="描述你想要的图像，例如：一只坐在月光下的猫..."
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={generating}
                  style={{ height: 44, background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', border: 'none' }}
                >
                  {generating ? '生成中...' : '生成图像'}
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <div style={{ flex: 1, minWidth: 300 }}>
            {generating && (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.5)' }}>正在生成图像...</Text>
                </div>
              </div>
            )}
            {!generating && images.length === 0 && (
              <Empty
                description={<Text style={{ color: 'rgba(255,255,255,0.4)' }}>还没有生成的图像</Text>}
                style={{ padding: 60 }}
              />
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {images.map((img, i) => (
                <Card
                  key={i}
                  className="glass"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}
                  cover={<Image src={img.url} alt={img.prompt} style={{ borderRadius: '12px 12px 0 0' }} />}
                >
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{img.prompt}</Text>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

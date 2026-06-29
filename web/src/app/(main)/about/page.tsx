'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Tag, Divider, Space, Skeleton } from 'antd';
import {
  ApiOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  GithubOutlined,
  CodeOutlined,
  MessageOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  AppstoreOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import AppLayout from '@/components/Layout/AppLayout';
import { api } from '@/lib/api';

interface VersionInfo {
  version: string;
  git_commit: string;
  build_time: string;
}

const { Title, Text, Paragraph } = Typography;

const FEATURES = [
  {
    icon: <MessageOutlined style={{ fontSize: 22, color: '#a78bfa' }} />,
    title: '多模型对话',
    desc: '支持 OpenAI、Anthropic Claude、Google Gemini 等主流大模型，统一接口无缝切换。',
  },
  {
    icon: <PictureOutlined style={{ fontSize: 22, color: '#f472b6' }} />,
    title: 'AI 绘图',
    desc: '集成 DALL-E、Gemini Imagen 等图像生成模型，支持风格、尺寸等多维度参数调整。',
  },
  {
    icon: <VideoCameraOutlined style={{ fontSize: 22, color: '#fb923c' }} />,
    title: '视频生成',
    desc: '接入主流视频生成 API，文生视频一键完成，支持分辨率、时长等高级参数。',
  },
  {
    icon: <AppstoreOutlined style={{ fontSize: 22, color: '#34d399' }} />,
    title: 'Skill 系统',
    desc: '可配置自定义系统提示词模板（Skill），一键切换 AI 角色与专业场景。',
  },
  {
    icon: <ToolOutlined style={{ fontSize: 22, color: '#60a5fa' }} />,
    title: 'MCP 工具调用',
    desc: '支持 Model Context Protocol，连接数据库、搜索引擎、代码仓库等外部工具。',
  },
  {
    icon: <SafetyOutlined style={{ fontSize: 22, color: '#facc15' }} />,
    title: '多账户隔离',
    desc: '供应商、模型、Skill、MCP 配置严格按账号隔离，数据安全互不干扰。',
  },
];

const TECH_STACK = [
  { label: 'Go', color: 'cyan' },
  { label: 'Gin', color: 'blue' },
  { label: 'GORM', color: 'geekblue' },
  { label: 'PostgreSQL', color: 'geekblue' },
  { label: 'Redis', color: 'red' },
  { label: 'Next.js 15', color: 'default' },
  { label: 'React 19', color: 'blue' },
  { label: 'Ant Design', color: 'blue' },
  { label: 'TypeScript', color: 'blue' },
  { label: 'JWT', color: 'purple' },
  { label: 'SSE 流式输出', color: 'green' },
  { label: 'MCP Protocol', color: 'orange' },
];

export default function AboutPage() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);

  useEffect(() => {
    api.get<VersionInfo>('/version').then(setVersionInfo).catch(() => {
      setVersionInfo({ version: 'unknown', git_commit: 'unknown', build_time: 'unknown' });
    });
  }, []);

  const webVersion = process.env.NEXT_PUBLIC_WEB_VERSION ?? '0.1.0';
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME;
  const buildDate = buildTime ? new Date(buildTime).toLocaleDateString('zh-CN') : '-';

  return (
    <AppLayout>
      <div style={{ padding: '40px 32px', overflow: 'auto', height: '100%' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            width: 88, height: 88, borderRadius: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 0 40px rgba(124,58,237,0.5)',
            overflow: 'hidden',
          }}>
            <img src="/icon.png" alt="Prism" style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 24 }} />
          </div>
          <Title level={2} style={{ color: 'rgba(255,255,255,0.95)', margin: 0 }}>
            Prism
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>
            统一 AI 能力的私有化部署平台
          </Text>
          <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {versionInfo ? (
              <>
                <Tag color="purple">
                  服务端 {versionInfo.version === 'dev' ? 'dev (未编译)' : `v${versionInfo.version}`}
                </Tag>
                <Tag color="blue">前端 v{webVersion}</Tag>
                {versionInfo.git_commit !== 'unknown' && (
                  <Tag color="default" style={{ fontFamily: 'monospace' }}>
                    {versionInfo.git_commit.slice(0, 7)}
                  </Tag>
                )}
                {versionInfo.build_time !== 'unknown' && (
                  <Tag color="default">
                    构建于 {new Date(versionInfo.build_time).toLocaleDateString('zh-CN')}
                  </Tag>
                )}
                {versionInfo.build_time === 'unknown' && (
                  <Tag color="default">前端构建于 {buildDate}</Tag>
                )}
              </>
            ) : (
              <Skeleton.Button active size="small" style={{ width: 200 }} />
            )}
          </div>
        </div>

        {/* Intro */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '24px 28px',
          maxWidth: 720,
          margin: '0 auto 40px',
        }}>
          <Paragraph style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.8, margin: 0 }}>
            Prism 是一个面向团队和个人的私有化 AI 接入平台。通过统一的供应商管理与模型配置，
            将 OpenAI、Anthropic、Google 等多家大模型服务整合为一个一致的接口，
            支持多账户隔离、对话、图像生成、视频生成、Skill 提示词模板以及
            基于 MCP 协议的外部工具调用。
          </Paragraph>
        </div>

        {/* Features */}
        <div style={{ maxWidth: 920, margin: '0 auto 40px' }}>
          <Title level={4} style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 20 }}>
            核心功能
          </Title>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}>
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14,
                  padding: '20px 22px',
                  transition: 'border-color 0.2s',
                }}
                className="glass-hover"
              >
                <div style={{ marginBottom: 12 }}>{f.icon}</div>
                <Text strong style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15, display: 'block', marginBottom: 6 }}>
                  {f.title}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.7 }}>
                  {f.desc}
                </Text>
              </div>
            ))}
          </div>
        </div>

        {/* Tech stack */}
        <div style={{ maxWidth: 920, margin: '0 auto 40px' }}>
          <Title level={4} style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 16 }}>
            技术栈
          </Title>
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14,
            padding: '20px 24px',
          }}>
            <Space wrap size={10}>
              {TECH_STACK.map((t) => (
                <Tag key={t.label} color={t.color} style={{ fontSize: 13, padding: '2px 10px' }}>
                  {t.label}
                </Tag>
              ))}
            </Space>
          </div>
        </div>

        {/* API & Links */}
        <div style={{ maxWidth: 920, margin: '0 auto 40px' }}>
          <Title level={4} style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 16 }}>
            接口与资源
          </Title>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 14,
          }}>
            {[
              {
                icon: <ApiOutlined style={{ color: '#60a5fa' }} />,
                title: 'REST API',
                desc: '后端提供完整 RESTful 接口，支持 Bearer JWT 鉴权，可独立接入任意前端或脚本。',
              },
              {
                icon: <ThunderboltOutlined style={{ color: '#34d399' }} />,
                title: 'SSE 流式输出',
                desc: '对话接口基于 Server-Sent Events 实现实时流式回复，低延迟、高稳定。',
              },
              {
                icon: <CodeOutlined style={{ color: '#f472b6' }} />,
                title: 'MCP Protocol',
                desc: '兼容 Model Context Protocol Streamable HTTP 规范，可接入任意标准 MCP Server。',
              },
              {
                icon: <GithubOutlined style={{ color: 'rgba(255,255,255,0.7)' }} />,
                title: '开源项目',
                desc: '完整源码开放，欢迎提交 Issue 和 Pull Request 共同完善。',
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 12,
                  padding: '16px 18px',
                  display: 'flex',
                  gap: 14,
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ fontSize: 20, marginTop: 2, flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <Text strong style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, display: 'block', marginBottom: 4 }}>
                    {item.title}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.7 }}>
                    {item.desc}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Divider style={{ borderColor: 'rgba(255,255,255,0.07)', maxWidth: 920, margin: '0 auto 24px' }} />

        {/* Footer */}
        <div style={{ textAlign: 'center', maxWidth: 920, margin: '0 auto' }}>
          <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
            Prism &nbsp;·&nbsp; MIT License &nbsp;·&nbsp; Built with ❤️ using Go & Next.js
          </Text>
        </div>

      </div>
    </AppLayout>
  );
}

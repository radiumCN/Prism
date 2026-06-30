'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, Card, Form, Input, Button, Switch, App, Typography, Divider, Alert } from 'antd';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/Layout/AppLayout';
import { useIsMobile } from '@/hooks/useIsMobile';
import ProvidersTable from '@/components/Admin/ProvidersTable';
import ModelsTable from '@/components/Admin/ModelsTable';
import SkillsTable from '@/components/Admin/SkillsTable';
import MCPTable from '@/components/Admin/MCPTable';
import UsersTable from '@/components/Admin/UsersTable';
import FeedbackList from '@/components/Admin/FeedbackList';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';

const { Title } = Typography;

export default function AdminPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const isMobile = useIsMobile();
  const [settingsForm] = Form.useForm();
  const [savingSettings, setSavingSettings] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (!isAdmin) {
      router.replace('/chat');
      return;
    }

    api.get<Record<string, string>>('/admin/settings').then((settings) => {
      settingsForm.setFieldsValue(settings);
    }).catch(console.error);
  }, [mounted, isAuthenticated, isAdmin, router, settingsForm]);

  const handleSaveSettings = async (values: Record<string, unknown>) => {
    setSavingSettings(true);
    try {
      await api.put('/admin/settings', {
        settings: Object.fromEntries(
          Object.entries(values).map(([k, v]) => [k, String(v ?? '')])
        ),
      });
      message.success('设置已保存');
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSavingSettings(false);
    }
  };

  if (!mounted || !isAdmin) return null;

  const cardStyle = {
    border: '1px solid rgba(255,255,255,0.1)',
  };
  const cardBodyStyle = { padding: isMobile ? 10 : 24 };

  return (
    <AppLayout>
      <div style={{ padding: isMobile ? '12px 10px' : 24, overflow: 'auto', height: '100%' }}>
        <Title level={isMobile ? 5 : 3} style={{ color: 'rgba(255,255,255,0.9)', marginBottom: isMobile ? 12 : 24 }}>
          管理后台
        </Title>

        <Tabs
          defaultActiveKey="providers"
          size={isMobile ? 'small' : 'middle'}
          items={[
            {
              key: 'providers',
              label: '供应商',
              children: (
                <Card className="glass" style={cardStyle} styles={{ body: cardBodyStyle }}>
                  <ProvidersTable />
                </Card>
              ),
            },
            {
              key: 'models',
              label: '模型',
              children: (
                <Card className="glass" style={cardStyle} styles={{ body: cardBodyStyle }}>
                  <ModelsTable />
                </Card>
              ),
            },
            {
              key: 'skills',
              label: 'Skill',
              children: (
                <Card className="glass" style={cardStyle} styles={{ body: cardBodyStyle }}>
                  <SkillsTable />
                </Card>
              ),
            },
            {
              key: 'mcp',
              label: 'MCP',
              children: (
                <Card className="glass" style={cardStyle} styles={{ body: cardBodyStyle }}>
                  <MCPTable />
                </Card>
              ),
            },
            {
              key: 'users',
              label: '用户',
              children: (
                <Card className="glass" style={cardStyle} styles={{ body: cardBodyStyle }}>
                  <UsersTable />
                </Card>
              ),
            },
            {
              key: 'feedback',
              label: '反馈',
              children: (
                <Card className="glass" style={cardStyle} styles={{ body: cardBodyStyle }}>
                  <FeedbackList />
                </Card>
              ),
            },
            {
              key: 'settings',
              label: '设置',
              children: (
                <Card className="glass" style={{ ...cardStyle, maxWidth: 640 }} styles={{ body: cardBodyStyle }}>
                  <Form form={settingsForm} layout="vertical" onFinish={handleSaveSettings}>

                    {/* ── 基础设置 ── */}
                    <Typography.Text strong style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>基础设置</Typography.Text>
                    <Divider style={{ margin: '8px 0 16px', borderColor: 'rgba(255,255,255,0.08)' }} />
                    <Form.Item name="site_name" label="站点名称">
                      <Input placeholder="Prism" />
                    </Form.Item>
                    <Form.Item name="registration_open" label="开放注册" valuePropName="checked"
                      getValueFromEvent={(checked: boolean) => String(checked)}
                      getValueProps={(v) => ({ checked: v === 'true' })}>
                      <Switch />
                    </Form.Item>

                    {/* ── AI 功能开关 ── */}
                    <Typography.Text strong style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, display: 'block', marginTop: 24 }}>AI 功能开关</Typography.Text>
                    <Divider style={{ margin: '8px 0 16px', borderColor: 'rgba(255,255,255,0.08)' }} />

                    <Alert
                      type="info"
                      showIcon
                      style={{ marginBottom: 16, fontSize: 12 }}
                      description={
                        <span>
                          <b>MCP 工作原理：</b>在对话创建时选择 MCP Server 后，AI 每次发送消息前会自动向 MCP Server 请求可用工具列表，
                          并在 AI 请求中注入这些工具。当 AI 决定调用工具时，后端会自动执行调用并将结果反馈给 AI，
                          最多循环 <b>5 轮</b>，之后流式输出最终回复。
                        </span>
                      }
                    />

                    <Form.Item
                      name="mcp_enabled"
                      label="启用 MCP 工具调用"
                      tooltip="关闭后，所有对话中不再向 MCP Server 请求工具，AI 退化为纯文本模式"
                      valuePropName="checked"
                      getValueFromEvent={(checked: boolean) => String(checked)}
                      getValueProps={(v) => ({ checked: v !== 'false' })}
                    >
                      <Switch checkedChildren="启用" unCheckedChildren="关闭" />
                    </Form.Item>

                    <Form.Item
                      name="skill_enabled"
                      label="启用 Skill 系统提示词"
                      tooltip="关闭后，对话绑定的 Skill system_prompt 不会注入到 AI 请求中"
                      valuePropName="checked"
                      getValueFromEvent={(checked: boolean) => String(checked)}
                      getValueProps={(v) => ({ checked: v !== 'false' })}
                    >
                      <Switch checkedChildren="启用" unCheckedChildren="关闭" />
                    </Form.Item>

                    {/* ── SMTP 设置 ── */}
                    <Typography.Text strong style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, display: 'block', marginTop: 24 }}>SMTP 邮件设置</Typography.Text>
                    <Divider style={{ margin: '8px 0 16px', borderColor: 'rgba(255,255,255,0.08)' }} />
                    <Form.Item name="smtp_host" label="SMTP 主机">
                      <Input placeholder="smtp.example.com" />
                    </Form.Item>
                    <Form.Item name="smtp_port" label="SMTP 端口">
                      <Input placeholder="587" />
                    </Form.Item>
                    <Form.Item name="smtp_user" label="SMTP 用户名">
                      <Input />
                    </Form.Item>
                    <Form.Item name="smtp_pass" label="SMTP 密码">
                      <Input.Password />
                    </Form.Item>

                    <Form.Item style={{ marginTop: 8 }}>
                      <Button type="primary" htmlType="submit" loading={savingSettings}>
                        保存设置
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              ),
            },
          ]}
        />
      </div>
    </AppLayout>
  );
}

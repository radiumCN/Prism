'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, Card, Form, Input, Button, Switch, message, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/Layout/AppLayout';
import ProvidersTable from '@/components/Admin/ProvidersTable';
import ModelsTable from '@/components/Admin/ModelsTable';
import SkillsTable from '@/components/Admin/SkillsTable';
import MCPTable from '@/components/Admin/MCPTable';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';

const { Title } = Typography;

export default function AdminPage() {
  const router = useRouter();
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const [settingsForm] = Form.useForm();
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
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
  }, [isAuthenticated, isAdmin, router, settingsForm]);

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

  if (!isAdmin) return null;

  return (
    <AppLayout>
      <div style={{ padding: 24, overflow: 'auto', height: '100%' }}>
        <Title level={3} style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 24 }}>
          管理后台
        </Title>

        <Tabs
          defaultActiveKey="providers"
          items={[
            {
              key: 'providers',
              label: '供应商管理',
              children: (
                <Card className="glass" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  <ProvidersTable />
                </Card>
              ),
            },
            {
              key: 'models',
              label: '模型管理',
              children: (
                <Card className="glass" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  <ModelsTable />
                </Card>
              ),
            },
            {
              key: 'skills',
              label: 'Skill 管理',
              children: (
                <Card className="glass" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  <SkillsTable />
                </Card>
              ),
            },
            {
              key: 'mcp',
              label: 'MCP 配置',
              children: (
                <Card className="glass" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  <MCPTable />
                </Card>
              ),
            },
            {
              key: 'settings',
              label: '系统设置',
              children: (
                <Card className="glass" style={{ border: '1px solid rgba(255,255,255,0.1)', maxWidth: 600 }}>
                  <Form form={settingsForm} layout="vertical" onFinish={handleSaveSettings}>
                    <Form.Item name="site_name" label="站点名称">
                      <Input placeholder="ModelHub" />
                    </Form.Item>
                    <Form.Item name="registration_open" label="开放注册" valuePropName="checked"
                      getValueFromEvent={(checked: boolean) => String(checked)}
                      getValueProps={(v) => ({ checked: v === 'true' })}>
                      <Switch />
                    </Form.Item>
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
                    <Form.Item>
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

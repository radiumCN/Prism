'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal, Form, Input, Button, Tabs, Avatar, Typography,
  Divider, Tag, App, Space, Select, Alert,
} from 'antd';
import {
  UserOutlined, LockOutlined, MailOutlined,
  EditOutlined, SafetyOutlined, CloudOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import type { User } from '@/types';

const { Text } = Typography;

interface OSSConfig {
  provider: string;
  secret_id: string;
  secret_key: string;
  bucket: string;
  region: string;
  base_url: string;
  path_prefix: string;
}

const REGION_HINT: Record<string, string> = {
  tencent_cos: '例：ap-guangzhou、ap-beijing、ap-shanghai',
  aliyun_oss: '例：oss-cn-hangzhou、oss-cn-shanghai、oss-cn-shenzhen',
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ProfileModal({ open, onClose }: Props) {
  const { message } = App.useApp();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [usernameForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [ossForm] = Form.useForm();
  const [savingUsername, setSavingUsername] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingOSS, setSavingOSS] = useState(false);
  const [ossProvider, setOssProvider] = useState('none');

  const loadOSSConfig = useCallback(async () => {
    try {
      const cfg = await api.get<OSSConfig>('/user/oss-config');
      ossForm.setFieldsValue(cfg);
      setOssProvider(cfg.provider ?? 'none');
    } catch { /* ignore */ }
  }, [ossForm]);

  useEffect(() => {
    if (open) loadOSSConfig();
  }, [open, loadOSSConfig]);

  const handleUpdateUsername = async (values: { username: string }) => {
    setSavingUsername(true);
    try {
      const updated = await api.put<User>('/user/profile', { username: values.username });
      updateUser(updated);
      message.success('用户名已更新');
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '更新失败');
    } finally {
      setSavingUsername(false);
    }
  };

  const handleUpdatePassword = async (values: {
    old_password: string;
    new_password: string;
    confirm_password: string;
  }) => {
    if (values.new_password !== values.confirm_password) {
      message.error('两次输入的新密码不一致');
      return;
    }
    setSavingPassword(true);
    try {
      await api.put('/user/profile', {
        old_password: values.old_password,
        new_password: values.new_password,
      });
      message.success('密码已更新，请重新登录');
      passwordForm.resetFields();
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '密码更新失败');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveOSS = async (values: OSSConfig) => {
    setSavingOSS(true);
    try {
      await api.put('/user/oss-config', values);
      message.success('OSS 配置已保存');
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSavingOSS(false);
    }
  };

  const roleColor = user?.role === 'admin' ? 'purple' : 'blue';
  const roleLabel = user?.role === 'admin' ? '管理员' : '普通用户';

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={null}
      width={480}
      destroyOnHidden
      style={{
        background: 'rgba(15,12,41,0.98)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 0,
        maxHeight: '90vh',
        overflow: 'hidden',
      }}
      styles={{
        body: { display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' },
        mask: { backdropFilter: 'blur(4px)' },
      }}
    >
      {/* Header — 固定不滚动 */}
      <div style={{
        padding: '20px 24px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: 14,
        flexShrink: 0,
      }}>
        <Avatar
          size={48}
          style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', flexShrink: 0, fontSize: 20 }}
          icon={<UserOutlined />}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: 600, marginBottom: 3 }}>
            {user?.username}
          </div>
          <Space size={8}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              <MailOutlined style={{ fontSize: 11 }} />{user?.email}
            </span>
            <Tag color={roleColor} style={{ margin: 0, fontSize: 11 }}>{roleLabel}</Tag>
          </Space>
        </div>
      </div>

      {/* Tabs — 可滚动区域 */}
      <div style={{ padding: '0 24px 20px', overflowY: 'auto', flex: 1 }}>
        <Tabs
          defaultActiveKey="username"
          style={{ color: 'rgba(255,255,255,0.7)' }}
          items={[
            {
              key: 'username',
              label: (
                <span><EditOutlined style={{ marginRight: 4 }} />修改用户名</span>
              ),
              children: (
                <Form
                  form={usernameForm}
                  layout="vertical"
                  onFinish={handleUpdateUsername}
                  initialValues={{ username: user?.username }}
                  style={{ paddingTop: 8 }}
                >
                  <Form.Item
                    name="username"
                    label={<Text style={{ color: 'rgba(255,255,255,0.7)' }}>新用户名</Text>}
                    rules={[
                      { required: true, message: '请输入用户名' },
                      { min: 3, max: 50, message: '用户名长度 3-50 个字符' },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined style={{ color: 'rgba(255,255,255,0.3)' }} />}
                      placeholder="3-50 个字符"
                    />
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button
                      type="primary" htmlType="submit" loading={savingUsername}
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', border: 'none' }}
                    >
                      保存用户名
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: 'oss',
              label: (
                <span><CloudOutlined style={{ marginRight: 4 }} />对象存储</span>
              ),
              children: (
                <Form
                  form={ossForm}
                  layout="vertical"
                  onFinish={handleSaveOSS}
                  size="small"
                  style={{ paddingTop: 8 }}
                >
                  <Alert
                    type="info"
                    showIcon
                    style={{ marginBottom: 12, fontSize: 11 }}
                    description="部分 AI 绘图接口（如 Gemini）返回 base64 数据，配置 OSS 后自动上传并以 URL 保存，降低数据库压力。不配置时使用本地磁盘。"
                  />

                  {/* Provider row + credential row on same line when possible */}
                  <Form.Item name="provider" label={<Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>存储提供商</Text>} style={{ marginBottom: 10 }}>
                    <Select
                      onChange={(v) => setOssProvider(v)}
                      options={[
                        { label: '本地磁盘（不启用 OSS）', value: 'none' },
                        { label: '腾讯云 COS', value: 'tencent_cos' },
                        { label: '阿里云 OSS', value: 'aliyun_oss' },
                      ]}
                    />
                  </Form.Item>

                  {ossProvider !== 'none' && (<>
                    {/* Credentials — two columns */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                      <Form.Item
                        name="secret_id"
                        label={<Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>SecretId / AK ID</Text>}
                        style={{ marginBottom: 10 }}
                      >
                        <Input.Password placeholder="留空则不修改" />
                      </Form.Item>
                      <Form.Item
                        name="secret_key"
                        label={<Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>SecretKey / AK Secret</Text>}
                        style={{ marginBottom: 10 }}
                      >
                        <Input.Password placeholder="留空则不修改" />
                      </Form.Item>
                    </div>

                    {/* Bucket + Region — two columns */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                      <Form.Item
                        name="bucket"
                        label={<Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Bucket</Text>}
                        style={{ marginBottom: 10 }}
                      >
                        <Input placeholder="my-bucket" />
                      </Form.Item>
                      <Form.Item
                        name="region"
                        label={<Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>地域</Text>}
                        tooltip={REGION_HINT[ossProvider]}
                        style={{ marginBottom: 10 }}
                      >
                        <Input placeholder={ossProvider === 'tencent_cos' ? 'ap-guangzhou' : 'oss-cn-hangzhou'} />
                      </Form.Item>
                    </div>

                    {/* Optional fields — two columns */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                      <Form.Item
                        name="base_url"
                        label={<Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>自定义域名（可选）</Text>}
                        style={{ marginBottom: 10 }}
                      >
                        <Input placeholder="https://cdn.example.com" />
                      </Form.Item>
                      <Form.Item
                        name="path_prefix"
                        label={<Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>路径前缀（可选）</Text>}
                        style={{ marginBottom: 10 }}
                      >
                        <Input placeholder="generations/" />
                      </Form.Item>
                    </div>
                  </>)}

                  <Form.Item style={{ marginBottom: 0, marginTop: 4 }}>
                    <Button
                      type="primary" htmlType="submit" loading={savingOSS}
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', border: 'none' }}
                    >
                      保存 OSS 配置
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: 'password',
              label: (
                <span><SafetyOutlined style={{ marginRight: 4 }} />修改密码</span>
              ),
              children: (
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={handleUpdatePassword}
                  style={{ paddingTop: 8 }}
                >
                  <Form.Item
                    name="old_password"
                    label={<Text style={{ color: 'rgba(255,255,255,0.7)' }}>当前密码</Text>}
                    rules={[{ required: true, message: '请输入当前密码' }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: 'rgba(255,255,255,0.3)' }} />}
                      placeholder="请输入当前密码"
                    />
                  </Form.Item>

                  <Divider style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '4px 0 16px' }} />

                  <Form.Item
                    name="new_password"
                    label={<Text style={{ color: 'rgba(255,255,255,0.7)' }}>新密码</Text>}
                    rules={[
                      { required: true, message: '请输入新密码' },
                      { min: 8, message: '密码至少 8 个字符' },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: 'rgba(255,255,255,0.3)' }} />}
                      placeholder="至少 8 个字符"
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirm_password"
                    label={<Text style={{ color: 'rgba(255,255,255,0.7)' }}>确认新密码</Text>}
                    rules={[{ required: true, message: '请再次输入新密码' }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: 'rgba(255,255,255,0.3)' }} />}
                      placeholder="再次输入新密码"
                    />
                  </Form.Item>

                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button
                      type="primary" htmlType="submit" loading={savingPassword}
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', border: 'none' }}
                    >
                      更新密码
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </div>
    </Modal>
  );
}

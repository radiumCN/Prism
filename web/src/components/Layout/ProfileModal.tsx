'use client';

import React, { useState } from 'react';
import {
  Modal, Form, Input, Button, Tabs, Avatar, Typography,
  Divider, Tag, App, Space,
} from 'antd';
import {
  UserOutlined, LockOutlined, MailOutlined,
  EditOutlined, SafetyOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import type { User } from '@/types';

const { Text } = Typography;

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
  const [savingUsername, setSavingUsername] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

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
      styles={{
        content: { background: 'rgba(15,12,41,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 0 },
        mask: { backdropFilter: 'blur(4px)' },
      }}
    >
      {/* Header */}
      <div style={{
        padding: '28px 28px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <Avatar
          size={56}
          style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', flexShrink: 0, fontSize: 22 }}
          icon={<UserOutlined />}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 17, fontWeight: 600, marginBottom: 4 }}>
            {user?.username}
          </div>
          <Space size={8}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
              <MailOutlined style={{ fontSize: 12 }} />{user?.email}
            </span>
            <Tag color={roleColor} style={{ margin: 0, fontSize: 11 }}>{roleLabel}</Tag>
          </Space>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 28px 24px' }}>
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

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Layout, Avatar, Dropdown, Modal, Form, Select, Input, App,
  Tabs, List, Tag, Typography, Empty, Button, Spin,
  Upload, Image,
} from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import {
  MessageOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  DashboardOutlined,
  InfoCircleOutlined,
  CommentOutlined,
  ReloadOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import ProfileModal from './ProfileModal';
import { api, BASE } from '@/lib/api';

const { Sider } = Layout;

// Strip "/api" suffix to get the static-file base for /uploads/*
const IMG_BASE = BASE.replace(/\/api$/, '');

const TYPE_COLOR: Record<string, string> = { general: 'blue', bug: 'red', feature: 'green' };
const TYPE_LABEL: Record<string, string> = { general: '一般', bug: '问题反馈', feature: '功能建议' };
const STATUS_COLOR: Record<string, string> = { pending: 'orange', reviewed: 'blue', closed: 'default' };
const STATUS_LABEL: Record<string, string> = { pending: '待处理', reviewed: '已查阅', closed: '已关闭' };

interface FeedbackItem {
  id: number;
  type: string;
  content: string;
  images: string[];
  status: string;
  admin_note: string;
  created_at: string;
}

export default function NavRail() {
  const { message } = App.useApp();
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('submit');
  const [feedbackForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [myList, setMyList] = useState<FeedbackItem[]>([]);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => setMounted(true), []);
  const isAdmin = mounted && user?.role === 'admin';

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const fetchMyFeedback = useCallback(async () => {
    setListLoading(true);
    try {
      const data = await api.get<FeedbackItem[]>('/feedback/mine');
      setMyList(data ?? []);
    } catch {
      // ignore
    } finally {
      setListLoading(false);
    }
  }, []);

  const openFeedback = (tab: string) => {
    setActiveTab(tab);
    setFeedbackOpen(true);
    if (tab === 'history') fetchMyFeedback();
  };

  const handleFeedbackSubmit = async () => {
    try {
      const values = await feedbackForm.validateFields();
      setSubmitting(true);
      // Collect successfully uploaded image URLs
      const images = fileList
        .filter((f) => f.status === 'done' && f.response?.url)
        .map((f) => f.response.url as string);
      await api.post('/feedback', { ...values, images });
      message.success('反馈已提交，感谢您的建议！');
      feedbackForm.resetFields();
      setFileList([]);
      // switch to history after submit
      setActiveTab('history');
      fetchMyFeedback();
    } catch (err: unknown) {
      if (err instanceof Error) message.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Shared upload logic ----
  const uploadViaFetch = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('access_token') ?? '';
    const res = await fetch(`${BASE}/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: '上传失败' }));
      throw new Error(err.error || '上传失败');
    }
    const data = await res.json();
    return data.url as string;
  }, []);

  // Upload a File object and append it to fileList (used by paste handler)
  const uploadPastedFile = useCallback(async (file: File) => {
    if (fileList.length >= 5) {
      message.warning('最多上传 5 张图片');
      return;
    }
    const uid = `paste-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const entry: UploadFile = {
      uid,
      name: file.name || `截图-${Date.now()}.png`,
      status: 'uploading',
      percent: 0,
    };
    setFileList((prev) => [...prev, entry]);
    try {
      const url = await uploadViaFetch(file);
      setFileList((prev) =>
        prev.map((f) =>
          f.uid === uid
            ? { ...f, status: 'done', response: { url }, url: `${IMG_BASE}${url}`, thumbUrl: `${IMG_BASE}${url}` }
            : f
        )
      );
    } catch {
      setFileList((prev) => prev.map((f) => (f.uid === uid ? { ...f, status: 'error' } : f)));
      message.error('图片上传失败');
    }
  }, [fileList.length, message, uploadViaFetch]);

  // Paste handler for the submit form area
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter((item) => item.type.startsWith('image/'));
    if (imageItems.length === 0) return;
    e.preventDefault();
    imageItems.forEach((item) => {
      const file = item.getAsFile();
      if (file) uploadPastedFile(file);
    });
  }, [uploadPastedFile]);

  const uploadProps: UploadProps = {
    name: 'file',
    accept: 'image/jpeg,image/png,image/gif,image/webp',
    listType: 'picture-card',
    fileList,
    maxCount: 5,
    onChange: ({ fileList: fl }) => setFileList(fl),
    beforeUpload: (file) => {
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        message.error('仅支持 JPG / PNG / GIF / WEBP');
        return Upload.LIST_IGNORE;
      }
      if (file.size > 5 * 1024 * 1024) {
        message.error('图片不能超过 5 MB');
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        const url = await uploadViaFetch(file as File);
        onSuccess?.({ url });
      } catch (err) {
        onError?.(err as Error);
      }
    },
  };

  const menuItems = [
    { key: '/chat', icon: <MessageOutlined />, label: '对话', onClick: () => router.push('/chat') },
    { key: '/image', icon: <PictureOutlined />, label: '绘图', onClick: () => router.push('/image') },
    { key: '/video', icon: <VideoCameraOutlined />, label: '视频', onClick: () => router.push('/video') },
    ...(isAdmin
      ? [{ key: '/admin', icon: <DashboardOutlined />, label: '管理', onClick: () => router.push('/admin') }]
      : []),
    { key: '/about', icon: <InfoCircleOutlined />, label: '关于', onClick: () => router.push('/about') },
  ];

  const userMenuItems = [
    { key: 'settings', icon: <SettingOutlined />, label: '个人设置', onClick: () => setProfileOpen(true) },
    { key: 'feedback', icon: <CommentOutlined />, label: '我的反馈', onClick: () => openFeedback('submit') },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
  ];

  const selectedKey = menuItems.find((m) => pathname.startsWith(m.key))?.key || '/chat';

  return (
    <>
    <Sider
      width={64}
      style={{
        background: 'rgba(15,12,41,0.6)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 8,
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', gap: 4 }}>
        {menuItems.map((item) => (
          <div
            key={item.key}
            onClick={item.onClick}
            style={{
              width: 44, height: 44,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              borderRadius: 12, cursor: 'pointer',
              background: selectedKey === item.key ? 'rgba(124,58,237,0.25)' : 'transparent',
              border: selectedKey === item.key ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent',
              color: selectedKey === item.key ? '#a78bfa' : 'rgba(255,255,255,0.5)',
              fontSize: 18,
              transition: 'all 0.2s',
            }}
            className="glass-hover"
            title={item.label}
          >
            {item.icon}
          </div>
        ))}

        <div style={{ flex: 1 }} />

        <Dropdown menu={{ items: userMenuItems }} placement="topLeft" trigger={['click']}>
          <Avatar
            style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}
            icon={<UserOutlined />}
          />
        </Dropdown>
      </div>
    </Sider>

    <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />

    <Modal
      title="我的反馈"
      open={feedbackOpen}
      onCancel={() => setFeedbackOpen(false)}
      footer={activeTab === 'submit' ? undefined : null}
      onOk={handleFeedbackSubmit}
      okText="提交反馈"
      cancelText="取消"
      confirmLoading={submitting}
      width={560}
    >
      <Tabs
        activeKey={activeTab}
        onChange={(k) => {
          setActiveTab(k);
          if (k === 'history') fetchMyFeedback();
        }}
        items={[
          {
            key: 'submit',
            label: '提交反馈',
            children: (
              // onPaste on the outer div catches paste anywhere in the form,
              // including outside the textarea (e.g. after clicking Upload area).
              <div onPaste={handlePaste}>
                <Form form={feedbackForm} layout="vertical" style={{ marginTop: 4 }}>
                  <Form.Item name="type" label="反馈类型" initialValue="general">
                    <Select
                      options={[
                        { label: '一般反馈', value: 'general' },
                        { label: '问题反馈（Bug）', value: 'bug' },
                        { label: '功能建议', value: 'feature' },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item
                    name="content"
                    label="反馈内容"
                    rules={[{ required: true, message: '请填写反馈内容' }]}
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="请描述您的问题或建议..."
                      maxLength={2000}
                      showCount
                    />
                  </Form.Item>
                  <Form.Item
                    label={
                      <span>
                        上传截图（可选，最多 5 张）
                        <span style={{ marginLeft: 8, fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>
                          支持点击 / 拖拽 / <kbd style={{ padding: '0 3px', borderRadius: 3, border: '1px solid rgba(255,255,255,0.2)', fontSize: 11 }}>Ctrl+V</kbd> 粘贴
                        </span>
                      </span>
                    }
                  >
                    <Upload {...uploadProps}>
                      {fileList.length < 5 && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <PlusOutlined />
                          <span style={{ fontSize: 12 }}>点击 / 粘贴</span>
                        </div>
                      )}
                    </Upload>
                  </Form.Item>
                </Form>
              </div>
            ),
          },
          {
            key: 'history',
            label: '历史记录',
            children: (
              <div style={{ minHeight: 200 }}>
                <div style={{ textAlign: 'right', marginBottom: 8 }}>
                  <Button
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={fetchMyFeedback}
                    loading={listLoading}
                  >
                    刷新
                  </Button>
                </div>
                {listLoading ? (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <Spin />
                  </div>
                ) : myList.length === 0 ? (
                  <Empty description="暂无反馈记录" />
                ) : (
                  <List
                    dataSource={myList}
                    pagination={{
                      pageSize: 5,
                      size: 'small',
                      showTotal: (total) => `共 ${total} 条`,
                      style: { marginTop: 12, textAlign: 'right' },
                    }}
                    renderItem={(item) => (
                      <List.Item
                        key={item.id}
                        style={{
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: 4,
                          padding: '10px 0',
                          borderBottom: '1px solid rgba(255,255,255,0.07)',
                        }}
                      >
                        {/* Header row */}
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <Tag color={TYPE_COLOR[item.type] ?? 'default'}>
                            {TYPE_LABEL[item.type] ?? item.type}
                          </Tag>
                          <Tag color={STATUS_COLOR[item.status] ?? 'default'}>
                            {STATUS_LABEL[item.status] ?? item.status}
                          </Tag>
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            {new Date(item.created_at).toLocaleString('zh-CN')}
                          </Typography.Text>
                        </div>

                        {/* Content */}
                        <Typography.Text style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>
                          {item.content}
                        </Typography.Text>

                        {/* Attached images */}
                        {item.images && item.images.length > 0 && (
                          <Image.PreviewGroup>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                              {item.images.map((url, idx) => (
                                <Image
                                  key={idx}
                                  src={`${IMG_BASE}${url}`}
                                  width={72}
                                  height={72}
                                  style={{ objectFit: 'cover', borderRadius: 6, cursor: 'pointer' }}
                                  alt={`截图${idx + 1}`}
                                />
                              ))}
                            </div>
                          </Image.PreviewGroup>
                        )}

                        {/* Admin reply */}
                        {item.admin_note && (
                          <div
                            style={{
                              marginTop: 4,
                              padding: '6px 10px',
                              background: 'rgba(124,58,237,0.12)',
                              borderLeft: '3px solid #7c3aed',
                              borderRadius: '0 6px 6px 0',
                              fontSize: 12,
                              color: 'rgba(255,255,255,0.8)',
                              width: '100%',
                            }}
                          >
                            <span style={{ color: '#a78bfa', fontWeight: 600, marginRight: 6 }}>
                              管理员回复：
                            </span>
                            {item.admin_note}
                          </div>
                        )}
                      </List.Item>
                    )}
                  />
                )}
              </div>
            ),
          },
        ]}
      />
    </Modal>
    </>
  );
}

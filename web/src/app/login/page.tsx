'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import type { AuthResponse, PublicSiteConfig } from '@/types';
import styles from './login.module.css';

type Tab = 'login' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [siteName, setSiteName] = useState('Prism');
  const [configLoaded, setConfigLoaded] = useState(false);
  const [codeSending, setCodeSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [registerForm] = Form.useForm();

  useEffect(() => {
    api.get<PublicSiteConfig>('/site/config')
      .then((config) => {
        setSiteName(config.site_name || 'Prism');
        setRegistrationOpen(config.registration_open);
        if (!config.registration_open) {
          setActiveTab('login');
        }
      })
      .catch(() => {
        setRegistrationOpen(false);
        setActiveTab('login');
      })
      .finally(() => setConfigLoaded(true));
  }, []);

  const handleLogin = async (values: { account: string; password: string }) => {
    setLoading(true);
    try {
      const data = await api.post<AuthResponse>('/auth/login', values);
      setAuth(data.user, data.access_token, data.refresh_token);
      router.replace('/chat');
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    const email = registerForm.getFieldValue('email') as string;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      message.warning('请先输入有效的邮箱地址');
      return;
    }
    setCodeSending(true);
    try {
      await api.post('/auth/send-code', { email });
      message.success('验证码已发送，请查收邮件');
      // 60 秒倒计时
      setCooldown(60);
      timerRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '发送失败');
    } finally {
      setCodeSending(false);
    }
  };

  const handleRegister = async (values: { username: string; email: string; password: string; code: string }) => {
    setLoading(true);
    try {
      const data = await api.post<AuthResponse>('/auth/register', values);
      setAuth(data.user, data.access_token, data.refresh_token);
      router.replace('/chat');
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Decorative orbs */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />

      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoWrap}>
          <div className={styles.logoIcon}>
            <img src="/icon.png" alt="Prism" className={styles.logoImg} />
          </div>
          <h1 className={styles.logoTitle}>{siteName}</h1>
          <p className={styles.logoSub}>AI 模型聚合平台</p>
        </div>

        {/* Tab switcher — only when registration is open */}
        {configLoaded && registrationOpen && (
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'login' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('login')}
            >
              登 录
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'register' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('register')}
            >
              注 册
            </button>
            <div
              className={styles.tabSlider}
              style={{ transform: activeTab === 'register' ? 'translateX(100%)' : 'translateX(0)' }}
            />
          </div>
        )}

        {/* Login form */}
        {(activeTab === 'login' || !registrationOpen) && (
          <Form onFinish={handleLogin} layout="vertical" size="large" className={styles.form}>
            <Form.Item
              name="account"
              rules={[{ required: true, message: '请输入邮箱或用户名' }]}
            >
              <Input
                prefix={<UserOutlined className={styles.inputIcon} />}
                placeholder="邮箱 / 用户名"
                className={styles.input}
                autoComplete="username"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined className={styles.inputIcon} />}
                placeholder="密码"
                className={styles.input}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
              <Button
                htmlType="submit"
                block
                loading={loading}
                className={styles.submitBtn}
              >
                {loading ? '登录中...' : '登 录'}
              </Button>
            </Form.Item>
          </Form>
        )}

        {/* Register form */}
        {configLoaded && registrationOpen && activeTab === 'register' && (
          <Form form={registerForm} onFinish={handleRegister} layout="vertical" size="large" className={styles.form}>
            <Form.Item
              name="username"
              rules={[{ required: true, min: 3, message: '用户名至少 3 个字符' }]}
            >
              <Input
                prefix={<UserOutlined className={styles.inputIcon} />}
                placeholder="用户名"
                className={styles.input}
              />
            </Form.Item>
            <Form.Item
              name="email"
              rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}
            >
              <Input
                prefix={<MailOutlined className={styles.inputIcon} />}
                placeholder="邮箱地址"
                className={styles.input}
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, min: 8, message: '密码至少 8 个字符' }]}
            >
              <Input.Password
                prefix={<LockOutlined className={styles.inputIcon} />}
                placeholder="密码（至少 8 位）"
                className={styles.input}
              />
            </Form.Item>

            {/* 验证码行 */}
            <Form.Item
              name="code"
              rules={[
                { required: true, message: '请输入验证码' },
                { len: 6, message: '验证码为 6 位数字' },
              ]}
            >
              <div className={styles.codeRow}>
                <Input
                  prefix={<SafetyOutlined className={styles.inputIcon} />}
                  placeholder="6 位验证码"
                  maxLength={6}
                  className={styles.input}
                  onChange={(e) => registerForm.setFieldValue('code', e.target.value)}
                />
                <Button
                  className={styles.sendCodeBtn}
                  onClick={handleSendCode}
                  loading={codeSending}
                  disabled={cooldown > 0}
                >
                  {cooldown > 0 ? `${cooldown}s` : '获取验证码'}
                </Button>
              </div>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
              <Button
                htmlType="submit"
                block
                loading={loading}
                className={styles.submitBtn}
              >
                {loading ? '注册中...' : '注 册'}
              </Button>
            </Form.Item>
          </Form>
        )}
      </div>
    </div>
  );
}

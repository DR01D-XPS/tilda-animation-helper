import React, { useState, useEffect } from 'react';
import { loadSettings, saveSettings } from '../../utils/storage';
import type { ExtensionSettings } from '../../utils/storage';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<ExtensionSettings>({
    theme: 'dark',
    aiProvider: 'mock',
    apiKey: '',
    apiModel: '',
  });
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    loadSettings().then((s) => setSettings(s));
  }, []);

  const handleSave = async () => {
    await saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestAPI = async () => {
    if (!settings.apiKey || settings.aiProvider === 'mock') return;
    setTesting(true);
    setTestResult(null);
    try {
      // Minimal test call to verify the key works
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${settings.apiKey}` },
      });
      if (response.ok) {
        setTestResult({ ok: true, msg: '✓ Ключ действителен, соединение установлено' });
      } else {
        const err = await response.json() as { error?: { message?: string } };
        setTestResult({ ok: false, msg: err?.error?.message || `HTTP ${response.status}` });
      }
    } catch (e) {
      setTestResult({ ok: false, msg: String(e) });
    } finally {
      setTesting(false);
    }
  };

  const modelPlaceholder = settings.aiProvider === 'openai'
    ? 'gpt-4o-mini (по умолчанию)'
    : 'claude-opus-4-7';

  return (
    <div className="tah-section">
      {/* AI Provider */}
      <div className="tah-section">
        <label className="tah-label">AI-провайдер</label>
        <select
          className="tah-select"
          value={settings.aiProvider}
          onChange={(e) => setSettings((s) => ({ ...s, aiProvider: e.target.value as ExtensionSettings['aiProvider'] }))}
        >
          <option value="mock">Mock (без API, шаблонная генерация)</option>
          <option value="openai">OpenAI (GPT-4o / gpt-4o-mini)</option>
          <option value="claude">Claude — скоро (раскомментируй в aiProvider.ts)</option>
        </select>
      </div>

      {/* API Key */}
      {settings.aiProvider !== 'mock' && (
        <>
          <div className="tah-section">
            <label className="tah-label">API-ключ</label>
            <div className="tah-row">
              <input
                className="tah-input"
                style={{ flex: 1, fontFamily: showKey ? 'inherit' : 'monospace', letterSpacing: showKey ? 'normal' : '0.15em' }}
                type={showKey ? 'text' : 'password'}
                placeholder={settings.aiProvider === 'openai' ? 'sk-proj-...' : 'sk-ant-...'}
                value={settings.apiKey || ''}
                onChange={(e) => setSettings((s) => ({ ...s, apiKey: e.target.value.trim() }))}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                className="tah-btn tah-btn-secondary tah-btn-sm"
                onClick={() => setShowKey((v) => !v)}
                title={showKey ? 'Скрыть ключ' : 'Показать ключ'}
              >
                {showKey ? '🙈' : '👁'}
              </button>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
              Ключ хранится только локально в chrome.storage.local — не передаётся никуда, кроме API запросов.
            </div>
          </div>

          {/* Model override */}
          <div className="tah-section">
            <label className="tah-label">Модель (необязательно)</label>
            <input
              className="tah-input"
              placeholder={modelPlaceholder}
              value={settings.apiModel || ''}
              onChange={(e) => setSettings((s) => ({ ...s, apiModel: e.target.value.trim() }))}
            />
          </div>

          {/* Test button */}
          <div className="tah-row">
            <button
              className="tah-btn tah-btn-secondary"
              onClick={handleTestAPI}
              disabled={testing || !settings.apiKey}
              style={{ flex: 1 }}
            >
              {testing ? <><span className="tah-spinner" /> Проверка…</> : '🔌 Проверить соединение'}
            </button>
          </div>

          {testResult && (
            <div className={testResult.ok ? 'tah-info' : 'tah-warning'}>
              {testResult.msg}
            </div>
          )}
        </>
      )}

      {settings.aiProvider === 'mock' && (
        <div className="tah-info">
          Mock-режим работает без API. Анимации генерируются по ключевым словам из 13 пресетов.
          Для умной генерации выберите OpenAI и введите ключ.
        </div>
      )}

      {/* Save */}
      <button
        className="tah-btn tah-btn-primary tah-btn-full"
        onClick={handleSave}
      >
        {saved ? '✓ Сохранено!' : '💾 Сохранить настройки'}
      </button>

      <div className="tah-divider" />

      {/* Info */}
      <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--text-secondary)' }}>Горячая клавиша:</strong> Alt+Shift+T — открыть/закрыть панель<br />
        <strong style={{ color: 'var(--text-secondary)' }}>Версия:</strong> 1.0.0<br />
        <strong style={{ color: 'var(--text-secondary)' }}>Стабильность селектора:</strong><br />
        <span className="tah-stability-badge tah-stability-stable">✓ stable</span> — data-elem-id / #id (надёжно)<br />
        <span className="tah-stability-badge tah-stability-unstable">~ unstable</span> — по классу (может меняться)<br />
        <span className="tah-stability-badge tah-stability-fragile">! fragile</span> — nth-child (хрупко)
      </div>
    </div>
  );
};

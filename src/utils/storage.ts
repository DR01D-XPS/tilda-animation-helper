import type { GeneratedCode } from '../types';

const HISTORY_KEY = 'tah_history';
const SETTINGS_KEY = 'tah_settings';
const MAX_HISTORY = 50;

export interface ExtensionSettings {
  theme: 'dark' | 'light';
  aiProvider: 'mock' | 'claude' | 'openai';
  apiKey?: string;
  apiModel?: string;
}

export async function saveHistory(history: GeneratedCode[]): Promise<void> {
  const trimmed = history.slice(0, MAX_HISTORY);
  return new Promise((resolve) => {
    chrome.storage.local.set({ [HISTORY_KEY]: trimmed }, resolve);
  });
}

export async function loadHistory(): Promise<GeneratedCode[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get(HISTORY_KEY, (result) => {
      resolve((result[HISTORY_KEY] as GeneratedCode[]) || []);
    });
  });
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [SETTINGS_KEY]: settings }, resolve);
  });
}

export async function loadSettings(): Promise<ExtensionSettings> {
  return new Promise((resolve) => {
    chrome.storage.local.get(SETTINGS_KEY, (result) => {
      resolve((result[SETTINGS_KEY] as ExtensionSettings) || {
        theme: 'dark',
        aiProvider: 'mock',
      });
    });
  });
}

/**
 * AI Provider — генерация анимаций через OpenAI API или mock-режим.
 *
 * Два режима:
 *   preset  — AI выбирает пресет из списка и настраивает параметры
 *   custom  — AI пишет полный CSS/JS код с нуля по описанию пользователя
 *
 * API-ключ хранится в chrome.storage.local. Не хардкодьте его в исходниках.
 */

import type { TildaElement, AnimationPresetId, AnimationOptions, GeneratedCode } from '../types';
import { generateAnimation } from './animationGenerator';
import { detectPresetFromQuery, getPreset } from './presets';
import {
  buildAnimationPrompt,
  buildCustomAnimationPrompt,
  parseAIResponse,
  parseCustomResponse,
  generateUniqueClassName,
} from './promptBuilder';

export interface AIGenerateRequest {
  element: TildaElement;
  animationQuery: string;
  options?: Partial<AnimationOptions>;
  apiKey?: string;
  model?: string;
  provider?: 'mock' | 'openai' | 'claude';
  isCustom?: boolean;
}

// ─── Mock: preset-based ────────────────────────────────────────────────────────

function mockGenerate(request: AIGenerateRequest): {
  presetId: AnimationPresetId;
  options: Partial<AnimationOptions>;
} {
  const presetId = detectPresetFromQuery(request.animationQuery);
  const query = request.animationQuery.toLowerCase();
  const options: Partial<AnimationOptions> = {};

  if (query.includes('медленно') || query.includes('slow')) options.duration = 1400;
  if (query.includes('быстро') || query.includes('fast')) options.duration = 400;
  if (query.includes('очень медленно')) options.duration = 2000;
  const delayMatch = query.match(/задержк[аой]\s*(\d+)/);
  if (delayMatch) options.delay = parseInt(delayMatch[1]) * 100;
  if (query.includes('немного') || query.includes('subtle')) options.distance = 16;
  if (query.includes('далеко') || query.includes('large')) options.distance = 60;

  return { presetId, options };
}

// ─── Mock: custom fallback ─────────────────────────────────────────────────────

function mockCustomGenerate(request: AIGenerateRequest): GeneratedCode {
  const { presetId, options } = mockGenerate(request);
  const code = generateAnimation(request.element, presetId, options);
  const mockNote =
    'ℹ️ Mock-режим: применён ближайший пресет по ключевым словам. ' +
    'Для настоящей кастомной анимации включите OpenAI в настройках (вкладка ⚙️ API).';
  return {
    ...code,
    presetName: `✏️ Своя (mock → ${getPreset(presetId).nameRu})`,
    warnings: [mockNote, ...code.warnings],
  };
}

// ─── OpenAI: preset selection ──────────────────────────────────────────────────

async function callOpenAIPreset(request: AIGenerateRequest): Promise<{
  presetId: AnimationPresetId;
  options: Partial<AnimationOptions>;
}> {
  const model = request.model || 'gpt-4o-mini';
  const prompt = buildAnimationPrompt(request.element, request.animationQuery);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${request.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: 512,
      messages: [
        {
          role: 'system',
          content:
            'You are a CSS/JS animation expert for Tilda website builder. Respond only with valid JSON as instructed.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI ${response.status}: ${err.slice(0, 200)}`);
  }

  const data = (await response.json()) as { choices: Array<{ message: { content: string } }> };
  const raw = data.choices?.[0]?.message?.content || '';
  const parsed = parseAIResponse(raw);

  return {
    presetId: parsed.presetId as AnimationPresetId,
    options: parsed.options as Partial<AnimationOptions>,
  };
}

// ─── OpenAI: custom full code generation ──────────────────────────────────────

async function callOpenAICustom(request: AIGenerateRequest): Promise<GeneratedCode> {
  const model = request.model || 'gpt-4o-mini';
  const uniqueClass = generateUniqueClassName();
  const prompt = buildCustomAnimationPrompt(request.element, request.animationQuery, uniqueClass);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${request.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.5,
      max_tokens: 2048,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert CSS/JS animation engineer for Tilda Zero Block. ' +
            'Generate production-ready code. Respond ONLY in the exact format requested — no markdown, no explanations outside the delimiters.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI ${response.status}: ${err.slice(0, 200)}`);
  }

  const data = (await response.json()) as { choices: Array<{ message: { content: string } }> };
  const raw = data.choices?.[0]?.message?.content || '';
  const { css, js } = parseCustomResponse(raw);

  if (!css) {
    throw new Error('AI вернул пустой CSS. Попробуйте переформулировать описание.');
  }

  const instructions = buildCustomInstructions(request.element.selector);

  const warnings: string[] = [];
  if (request.element.hasExistingTransform) {
    warnings.push(
      '⚠️ Элемент уже имеет CSS transform от Tilda. Если анимация смещает элемент — выберите внутренний элемент (.tn-atom) вместо .tn-elem.'
    );
  }
  if (request.element.selectorStability === 'fragile') {
    warnings.push('⚠️ Нестабильный селектор (nth-child). Проверяйте код после изменений в редакторе Tilda.');
  }

  return {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    elementLabel: request.element.humanLabel,
    selector: request.element.selector,
    presetId: 'custom',
    presetName: '✏️ Своя анимация',
    css: `<style>\n${css}\n</style>`,
    js: js ? `<script>\n${js}\n</script>` : '',
    instructions,
    warnings,
    animClassName: uniqueClass,
  };
}

// ─── AI_INTEGRATION_POINT: Claude API ─────────────────────────────────────────
// async function callClaudeCustom(request: AIGenerateRequest): Promise<GeneratedCode> { ... }

// ─── Main entry ────────────────────────────────────────────────────────────────

export async function generateWithAI(
  request: AIGenerateRequest,
  provider: 'mock' | 'openai' | 'claude' = 'mock'
): Promise<GeneratedCode> {
  const effectiveProvider = request.provider ?? provider;
  const isCustom = request.isCustom ?? false;

  // ── Custom animation path ──────────────────────────────────────────────────
  if (isCustom) {
    if (!request.animationQuery?.trim()) {
      throw new Error('Введите описание анимации перед генерацией.');
    }

    if (effectiveProvider === 'openai' && request.apiKey) {
      try {
        return await callOpenAICustom(request);
      } catch (err) {
        console.warn('[TAH] OpenAI custom failed, falling back to mock:', err);
        const code = mockCustomGenerate(request);
        return {
          ...code,
          warnings: [
            `⚠️ OpenAI недоступен: ${String(err).slice(0, 120)}. Использован mock-режим.`,
            ...code.warnings,
          ],
        };
      }
    }

    // Mock fallback for custom
    return mockCustomGenerate(request);
  }

  // ── Preset-based path ─────────────────────────────────────────────────────
  let presetId: AnimationPresetId;
  let options: Partial<AnimationOptions> = {};

  if (effectiveProvider === 'openai' && request.apiKey) {
    try {
      ({ presetId, options } = await callOpenAIPreset(request));
    } catch (err) {
      console.warn('[TAH] OpenAI preset failed, using mock:', err);
      ({ presetId, options } = mockGenerate(request));
    }
  } else {
    ({ presetId, options } = mockGenerate(request));
  }

  return generateAnimation(request.element, presetId, { ...request.options, ...options });
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function buildCustomInstructions(selector: string): string {
  return `Как вставить кастомную анимацию в Tilda:

1. Откройте редактор страницы в Tilda.
2. Добавьте блок T123 «HTML-код» в конец страницы.
3. Вставьте сначала блок <style>...</style>, затем <script>...</script>.
4. Сохраните блок и опубликуйте страницу.

Важно:
• Кастомная анимация написана AI специально под ваш элемент.
• Селектор: ${selector}
• Если анимация не работает — откройте DevTools (F12) → Console и проверьте ошибки.
• Если элемент не найден — пересканируйте страницу расширением и выберите заново.`;
}

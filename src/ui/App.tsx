import React, { useReducer, useEffect, useRef, useCallback } from 'react';
import type { AppState, AppAction, TildaElement, GeneratedCode, AppTab } from '../types';
import { ANIMATION_PRESETS, PRESET_IDS } from '../generator/presets';
import { generateWithAI } from '../generator/aiProvider';
import { ElementList } from './components/ElementList';
import { ElementPreview } from './components/ElementPreview';
import { CodeOutput } from './components/CodeOutput';
import { History } from './components/History';
import { Settings } from './components/Settings';
import { loadHistory, saveHistory, loadSettings } from '../utils/storage';

// ── Reducer ────────────────────────────────────────────────────────────────────
const initialState: AppState = {
  isOpen: false,
  isMinimized: false,
  isPickerActive: false,
  scannedElements: [],
  selectedElement: null,
  objectQuery: '',
  animationQuery: '',
  searchResults: [],
  generatedCode: null,
  history: [],
  theme: 'dark',
  isScanning: false,
  isGenerating: false,
  activeTab: 'search',
  scanError: null,
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'OPEN_PANEL': return { ...state, isOpen: true };
    case 'CLOSE_PANEL': return { ...state, isOpen: false };
    case 'TOGGLE_PANEL': return { ...state, isOpen: !state.isOpen };
    case 'TOGGLE_MINIMIZE': return { ...state, isMinimized: !state.isMinimized };
    case 'SET_PICKER_ACTIVE': return { ...state, isPickerActive: action.payload };
    case 'SET_SCANNED_ELEMENTS': return { ...state, scannedElements: action.payload, searchResults: action.payload };
    case 'SET_SELECTED_ELEMENT': return { ...state, selectedElement: action.payload };
    case 'SET_OBJECT_QUERY': return { ...state, objectQuery: action.payload };
    case 'SET_ANIMATION_QUERY': return { ...state, animationQuery: action.payload };
    case 'SET_SEARCH_RESULTS': return { ...state, searchResults: action.payload };
    case 'SET_GENERATED_CODE': return { ...state, generatedCode: action.payload };
    case 'ADD_TO_HISTORY': return {
      ...state,
      history: [action.payload, ...state.history].slice(0, 50),
    };
    case 'SET_HISTORY': return { ...state, history: action.payload };
    case 'TOGGLE_THEME': return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
    case 'SET_SCANNING': return { ...state, isScanning: action.payload };
    case 'SET_GENERATING': return { ...state, isGenerating: action.payload };
    case 'SET_ACTIVE_TAB': return { ...state, activeTab: action.payload };
    case 'SET_SCAN_ERROR': return { ...state, scanError: action.payload };
    default: return state;
  }
}

// ── Props from content script ──────────────────────────────────────────────────
export interface AppProps {
  onScan: () => Promise<TildaElement[]>;
  onStartPicker: (onSelect: (el: TildaElement) => void, onCancel: () => void) => void;
  onStopPicker: () => void;
  onSearchElements: (query: string, elements: TildaElement[]) => TildaElement[];
  onHighlightElement: (selector: string) => void;
  onClearHighlight: () => void;
}

// ── Main App ───────────────────────────────────────────────────────────────────
export const App: React.FC<AppProps> = ({
  onScan,
  onStartPicker,
  onStopPicker,
  onSearchElements,
  onHighlightElement,
  onClearHighlight,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [selectedPreset, setSelectedPreset] = React.useState('fade-up');
  const panelRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  // Load initial data
  useEffect(() => {
    loadHistory().then((h) => dispatch({ type: 'SET_HISTORY', payload: h }));
    loadSettings().then((s) => {
      if (s.theme === 'light' && state.theme === 'dark') dispatch({ type: 'TOGGLE_THEME' });
    });
  }, []);

  // Listen for toggle from background
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.type === 'TAH_TOGGLE_PANEL') {
        dispatch({ type: 'TOGGLE_PANEL' });
      }
    };
    window.addEventListener('tah-message', handler);
    return () => window.removeEventListener('tah-message', handler);
  }, []);

  // Search as user types
  useEffect(() => {
    if (!state.objectQuery.trim()) {
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: state.scannedElements });
      return;
    }
    const results = onSearchElements(state.objectQuery, state.scannedElements);
    dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
  }, [state.objectQuery, state.scannedElements]);

  // ── Drag to reposition panel ───────────────────────────────────────────────
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    isDragging.current = true;
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current || !panelRef.current) return;
      const x = e.clientX - dragOffset.current.x;
      const y = e.clientY - dragOffset.current.y;
      panelRef.current.style.left = `${Math.max(0, Math.min(x, window.innerWidth - 380))}px`;
      panelRef.current.style.top = `${Math.max(0, Math.min(y, window.innerHeight - 60))}px`;
      panelRef.current.style.right = 'auto';
    };
    const onUp = () => { isDragging.current = false; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleScan = useCallback(async () => {
    dispatch({ type: 'SET_SCANNING', payload: true });
    dispatch({ type: 'SET_SCAN_ERROR', payload: null });
    try {
      const elements = await onScan();
      dispatch({ type: 'SET_SCANNED_ELEMENTS', payload: elements });
      if (elements.length === 0) {
        dispatch({ type: 'SET_SCAN_ERROR', payload: 'Элементы не найдены. Убедитесь, что страница содержит Zero Block блоки Tilda.' });
      }
    } catch (err) {
      dispatch({ type: 'SET_SCAN_ERROR', payload: `Ошибка сканирования: ${String(err)}` });
    } finally {
      dispatch({ type: 'SET_SCANNING', payload: false });
    }
  }, [onScan]);

  const handlePickerStart = useCallback(() => {
    dispatch({ type: 'SET_PICKER_ACTIVE', payload: true });
    onStartPicker(
      (el) => {
        dispatch({ type: 'SET_SELECTED_ELEMENT', payload: el });
        dispatch({ type: 'SET_PICKER_ACTIVE', payload: false });
        dispatch({ type: 'SET_ACTIVE_TAB', payload: 'generate' });
      },
      () => dispatch({ type: 'SET_PICKER_ACTIVE', payload: false })
    );
  }, [onStartPicker]);

  const handlePickerStop = useCallback(() => {
    onStopPicker();
    dispatch({ type: 'SET_PICKER_ACTIVE', payload: false });
  }, [onStopPicker]);

  const handleSelectFromList = useCallback((el: TildaElement) => {
    dispatch({ type: 'SET_SELECTED_ELEMENT', payload: el });
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'generate' });
    onHighlightElement(el.selector);
  }, [onHighlightElement]);

  const handleHoverElement = useCallback((el: TildaElement | null) => {
    if (el) onHighlightElement(el.selector);
    else onClearHighlight();
  }, [onHighlightElement, onClearHighlight]);

  const handleGenerate = useCallback(async () => {
    if (!state.selectedElement) return;
    dispatch({ type: 'SET_GENERATING', payload: true });
    try {
      // Load current settings fresh so apiKey/provider are always up to date
      const settings = await loadSettings();
      const code = await generateWithAI(
        {
          element: state.selectedElement,
          animationQuery: state.animationQuery || selectedPreset,
          options: {},
          apiKey: settings.apiKey,
          model: settings.apiModel,
          provider: settings.aiProvider,
        },
        settings.aiProvider,
      );
      dispatch({ type: 'SET_GENERATED_CODE', payload: code });
    } catch (err) {
      console.error('Generation error:', err);
    } finally {
      dispatch({ type: 'SET_GENERATING', payload: false });
    }
  }, [state.selectedElement, state.animationQuery, selectedPreset]);

  const handleSaveToHistory = useCallback(async () => {
    if (!state.generatedCode) return;
    dispatch({ type: 'ADD_TO_HISTORY', payload: state.generatedCode });
    const newHistory = [state.generatedCode, ...state.history].slice(0, 50);
    await saveHistory(newHistory);
  }, [state.generatedCode, state.history]);

  const handleHistorySelect = useCallback((code: GeneratedCode) => {
    dispatch({ type: 'SET_GENERATED_CODE', payload: code });
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'generate' });
  }, []);

  const handleClearHistory = useCallback(async () => {
    dispatch({ type: 'SET_HISTORY', payload: [] });
    await saveHistory([]);
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────
  const themeClass = `tah-${state.theme}`;

  return (
    <div className={themeClass}>
      <div
        id="tah-panel"
        ref={panelRef}
        className={[
          !state.isOpen ? 'tah-hidden' : '',
          state.isMinimized ? 'tah-minimized' : '',
        ].filter(Boolean).join(' ')}
      >
        {/* Header */}
        <div className="tah-header" onMouseDown={handleHeaderMouseDown}>
          <div className="tah-logo">T</div>
          <span className="tah-title">Tilda Animation</span>
          <span className="tah-version">v1.0</span>
          <div className="tah-header-btns">
            <button
              className="tah-icon-btn"
              onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
              title="Сменить тему"
            >
              {state.theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              className="tah-icon-btn"
              onClick={() => dispatch({ type: 'TOGGLE_MINIMIZE' })}
              title={state.isMinimized ? 'Развернуть' : 'Свернуть'}
            >
              {state.isMinimized ? '▲' : '▼'}
            </button>
            <button
              className="tah-icon-btn"
              onClick={() => dispatch({ type: 'CLOSE_PANEL' })}
              title="Закрыть"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Picker active bar */}
        {state.isPickerActive && (
          <div className="tah-picker-active-bar">
            🎯 Выберите элемент на странице | Esc — отмена
            <button
              className="tah-icon-btn"
              style={{ marginLeft: 8, background: 'rgba(255,255,255,0.2)', color: 'white' }}
              onClick={handlePickerStop}
            >
              ✕
            </button>
          </div>
        )}

        {/* Tabs */}
        {!state.isMinimized && (
          <div className="tah-tabs">
            {(['search', 'generate', 'history', 'settings'] as AppTab[]).map((tab) => (
              <button
                key={tab}
                className={`tah-tab${state.activeTab === tab ? ' active' : ''}`}
                onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab })}
              >
                {tab === 'search' ? '🔍 Поиск'
                  : tab === 'generate' ? '⚡ Код'
                  : tab === 'history' ? '📋 История'
                  : '⚙️ API'}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        {!state.isMinimized && (
          <div className="tah-body">

            {/* ─ SEARCH TAB ─────────────────────────────────────────────── */}
            {state.activeTab === 'search' && (
              <>
                <div className="tah-row">
                  <button
                    className="tah-btn tah-btn-primary"
                    style={{ flex: 1 }}
                    onClick={handleScan}
                    disabled={state.isScanning}
                  >
                    {state.isScanning ? (
                      <><span className="tah-spinner" /> Сканирование…</>
                    ) : (
                      '🔎 Сканировать страницу'
                    )}
                  </button>
                  <button
                    className={`tah-btn ${state.isPickerActive ? 'tah-btn-danger' : 'tah-btn-ghost'}`}
                    onClick={state.isPickerActive ? handlePickerStop : handlePickerStart}
                    title="Выбрать элемент кликом на странице"
                  >
                    {state.isPickerActive ? '✕ Отмена' : '🎯 Выбрать'}
                  </button>
                </div>

                {state.scanError && (
                  <div className="tah-warning">
                    <span>⚠️</span>
                    <span>{state.scanError}</span>
                  </div>
                )}

                {state.scannedElements.length > 0 && (
                  <>
                    <div className="tah-section">
                      <label className="tah-label">Какой объект анимировать?</label>
                      <input
                        className="tah-input"
                        placeholder='Например: "заголовок", "кнопка перейти", "картинка справа"'
                        value={state.objectQuery}
                        onChange={(e) => dispatch({ type: 'SET_OBJECT_QUERY', payload: e.target.value })}
                      />
                    </div>

                    <div className="tah-section">
                      <div className="tah-row">
                        <span className="tah-section-title" style={{ flex: 1 }}>
                          Найдено: {state.searchResults.length} / {state.scannedElements.length}
                        </span>
                      </div>
                      <ElementList
                        elements={state.searchResults.slice(0, 30)}
                        selectedElement={state.selectedElement}
                        onSelect={handleSelectFromList}
                        onHover={handleHoverElement}
                      />
                    </div>
                  </>
                )}

                {state.scannedElements.length === 0 && !state.isScanning && !state.scanError && (
                  <div className="tah-empty">
                    <span className="tah-empty-icon">📄</span>
                    <span>Нажмите «Сканировать страницу»</span>
                    <span style={{ fontSize: 11 }}>
                      или используйте 🎯 для выбора элемента мышкой
                    </span>
                  </div>
                )}
              </>
            )}

            {/* ─ GENERATE TAB ───────────────────────────────────────────── */}
            {state.activeTab === 'generate' && (
              <>
                {!state.selectedElement ? (
                  <div className="tah-empty">
                    <span className="tah-empty-icon">🎯</span>
                    <span>Элемент не выбран</span>
                    <button
                      className="tah-btn tah-btn-primary"
                      onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'search' })}
                    >
                      Перейти к поиску
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="tah-section">
                      <label className="tah-label">Выбранный элемент</label>
                      <ElementPreview element={state.selectedElement} />
                      <button
                        className="tah-btn tah-btn-secondary tah-btn-sm"
                        onClick={() => {
                          dispatch({ type: 'SET_SELECTED_ELEMENT', payload: null });
                          dispatch({ type: 'SET_ACTIVE_TAB', payload: 'search' });
                        }}
                      >
                        ✕ Сменить элемент
                      </button>
                    </div>

                    <div className="tah-section">
                      <label className="tah-label">Тип анимации</label>
                      <select
                        className="tah-select"
                        value={selectedPreset}
                        onChange={(e) => setSelectedPreset(e.target.value)}
                      >
                        {PRESET_IDS.map((id) => (
                          <option key={id} value={id}>
                            {ANIMATION_PRESETS[id].nameRu} — {ANIMATION_PRESETS[id].description.slice(0, 50)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="tah-section">
                      <label className="tah-label">Описание анимации (необязательно)</label>
                      <input
                        className="tah-input"
                        placeholder='Например: "медленно появляется снизу с задержкой"'
                        value={state.animationQuery}
                        onChange={(e) => dispatch({ type: 'SET_ANIMATION_QUERY', payload: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                      />
                    </div>

                    <button
                      className="tah-btn tah-btn-primary tah-btn-full"
                      onClick={handleGenerate}
                      disabled={state.isGenerating}
                    >
                      {state.isGenerating ? (
                        <><span className="tah-spinner" /> Генерация…</>
                      ) : (
                        '⚡ Сгенерировать код'
                      )}
                    </button>

                    {state.generatedCode && (
                      <>
                        <div className="tah-divider" />
                        <CodeOutput code={state.generatedCode} onSave={handleSaveToHistory} />
                      </>
                    )}
                  </>
                )}
              </>
            )}

            {/* ─ HISTORY TAB ────────────────────────────────────────────── */}
            {state.activeTab === 'history' && (
              <History
                history={state.history}
                onSelect={handleHistorySelect}
                onClear={handleClearHistory}
              />
            )}

            {/* ─ SETTINGS TAB ───────────────────────────────────────────── */}
            {state.activeTab === 'settings' && <Settings />}

          </div>
        )}
      </div>
    </div>
  );
};

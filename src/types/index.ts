export type HumanElementType =
  | 'heading'
  | 'text'
  | 'button'
  | 'image'
  | 'shape'
  | 'group'
  | 'video'
  | 'svg'
  | 'background'
  | 'unknown';

export type SelectorStability = 'stable' | 'unstable' | 'fragile';

export interface TildaElement {
  id: string;
  blockId: string;
  elemId: string;
  tagName: string;
  className: string;
  textContent: string;
  selector: string;
  humanLabel: string;
  humanType: HumanElementType;
  boundingRect: {
    top: number;
    left: number;
    width: number;
    height: number;
    right: number;
    bottom: number;
  };
  dataset: Record<string, string>;
  computedStyles: {
    width: string;
    height: string;
    top: string;
    left: string;
    opacity: string;
    transform: string;
    zIndex: string;
    position: string;
  };
  isZeroBlock: boolean;
  blockIndex: number;
  hasExistingTransform: boolean;
  selectorStability: SelectorStability;
  altText?: string;
  ariaLabel?: string;
}

export type AnimationPresetId =
  | 'fade-up'
  | 'fade-in'
  | 'slide-left'
  | 'slide-right'
  | 'scale-in'
  | 'parallax-scroll'
  | 'floating-loop'
  | 'hover-lift'
  | 'text-reveal'
  | 'stagger-animation'
  | 'background-blur-glow'
  | 'smooth-image-zoom'
  | 'scroll-pin'
  | 'custom';

export interface AnimationOptions {
  duration: number;
  delay: number;
  easing: string;
  distance: number;
  staggerDelay: number;
  responsive: boolean;
  reducedMotion: boolean;
}

export const DEFAULT_OPTIONS: AnimationOptions = {
  duration: 800,
  delay: 0,
  easing: 'ease',
  distance: 32,
  staggerDelay: 100,
  responsive: true,
  reducedMotion: true,
};

export interface GeneratedCode {
  id: string;
  timestamp: number;
  elementLabel: string;
  selector: string;
  presetId: AnimationPresetId;
  presetName: string;
  css: string;
  js: string;
  instructions: string;
  warnings: string[];
  animClassName: string;
}

export interface AnimationPreset {
  id: AnimationPresetId;
  name: string;
  nameRu: string;
  description: string;
  needsJS: boolean;
  category: 'entrance' | 'scroll' | 'loop' | 'hover' | 'group';
  warningsForZeroBlock: string[];
}

export type AppTab = 'search' | 'generate' | 'history' | 'settings';

export interface AppState {
  isOpen: boolean;
  isMinimized: boolean;
  isPickerActive: boolean;
  scannedElements: TildaElement[];
  selectedElement: TildaElement | null;
  objectQuery: string;
  animationQuery: string;
  searchResults: TildaElement[];
  generatedCode: GeneratedCode | null;
  history: GeneratedCode[];
  theme: 'dark' | 'light';
  isScanning: boolean;
  isGenerating: boolean;
  activeTab: AppTab;
  scanError: string | null;
}

export type AppAction =
  | { type: 'OPEN_PANEL' }
  | { type: 'CLOSE_PANEL' }
  | { type: 'TOGGLE_PANEL' }
  | { type: 'TOGGLE_MINIMIZE' }
  | { type: 'SET_PICKER_ACTIVE'; payload: boolean }
  | { type: 'SET_SCANNED_ELEMENTS'; payload: TildaElement[] }
  | { type: 'SET_SELECTED_ELEMENT'; payload: TildaElement | null }
  | { type: 'SET_OBJECT_QUERY'; payload: string }
  | { type: 'SET_ANIMATION_QUERY'; payload: string }
  | { type: 'SET_SEARCH_RESULTS'; payload: TildaElement[] }
  | { type: 'SET_GENERATED_CODE'; payload: GeneratedCode | null }
  | { type: 'ADD_TO_HISTORY'; payload: GeneratedCode }
  | { type: 'SET_HISTORY'; payload: GeneratedCode[] }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_SCANNING'; payload: boolean }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_ACTIVE_TAB'; payload: AppTab }
  | { type: 'SET_SCAN_ERROR'; payload: string | null };

export interface ContentScriptAPI {
  scan: () => Promise<TildaElement[]>;
  startPicker: () => void;
  stopPicker: () => void;
  searchElements: (query: string, elements: TildaElement[]) => TildaElement[];
  highlightElement: (selector: string) => void;
  clearHighlight: () => void;
}

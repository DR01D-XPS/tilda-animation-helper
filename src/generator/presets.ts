import type { AnimationPreset, AnimationPresetId } from '../types';

export const ANIMATION_PRESETS: Record<AnimationPresetId, AnimationPreset> = {
  'custom': {
    id: 'custom',
    name: 'Custom Animation',
    nameRu: '✏️ Своя анимация',
    description: 'Опишите анимацию текстом — AI сгенерирует уникальный CSS/JS код',
    needsJS: true,
    category: 'entrance',
    warningsForZeroBlock: [],
  },
  'fade-up': {
    id: 'fade-up',
    name: 'Fade Up',
    nameRu: 'Появление снизу',
    description: 'Элемент плавно появляется снизу вверх при попадании в зону видимости',
    needsJS: true,
    category: 'entrance',
    warningsForZeroBlock: [],
  },
  'fade-in': {
    id: 'fade-in',
    name: 'Fade In',
    nameRu: 'Плавное появление',
    description: 'Элемент плавно появляется при попадании в зону видимости',
    needsJS: true,
    category: 'entrance',
    warningsForZeroBlock: [],
  },
  'slide-left': {
    id: 'slide-left',
    name: 'Slide from Right',
    nameRu: 'Въезд справа',
    description: 'Элемент въезжает справа при скролле до него',
    needsJS: true,
    category: 'entrance',
    warningsForZeroBlock: ['Zero Block использует overflow:hidden на .t396 — убедитесь, что элемент не обрезается'],
  },
  'slide-right': {
    id: 'slide-right',
    name: 'Slide from Left',
    nameRu: 'Въезд слева',
    description: 'Элемент въезжает слева при скролле до него',
    needsJS: true,
    category: 'entrance',
    warningsForZeroBlock: ['Zero Block использует overflow:hidden на .t396 — убедитесь, что элемент не обрезается'],
  },
  'scale-in': {
    id: 'scale-in',
    name: 'Scale In',
    nameRu: 'Увеличение при появлении',
    description: 'Элемент появляется увеличиваясь из меньшего размера',
    needsJS: true,
    category: 'entrance',
    warningsForZeroBlock: ['Может конфликтовать с существующим transform у Zero Block элемента'],
  },
  'parallax-scroll': {
    id: 'parallax-scroll',
    name: 'Parallax Scroll',
    nameRu: 'Параллакс при скролле',
    description: 'Элемент движется с другой скоростью при скролле (эффект глубины)',
    needsJS: true,
    category: 'scroll',
    warningsForZeroBlock: [
      'Zero Block элементы используют absolute positioning — parallax может сместить элемент',
      'Протестируйте на мобильных устройствах — parallax может быть некомфортен',
    ],
  },
  'floating-loop': {
    id: 'floating-loop',
    name: 'Floating Loop',
    nameRu: 'Плавающая анимация',
    description: 'Элемент медленно плавает вверх-вниз в бесконечном цикле',
    needsJS: false,
    category: 'loop',
    warningsForZeroBlock: ['Может конфликтовать с существующим transform у Zero Block элемента'],
  },
  'hover-lift': {
    id: 'hover-lift',
    name: 'Hover Lift',
    nameRu: 'Подъём при наведении',
    description: 'Элемент поднимается и добавляет тень при наведении мышки',
    needsJS: false,
    category: 'hover',
    warningsForZeroBlock: [],
  },
  'text-reveal': {
    id: 'text-reveal',
    name: 'Text Reveal',
    nameRu: 'Раскрытие текста',
    description: 'Текст появляется с эффектом раскрытия снизу вверх через clip-path',
    needsJS: true,
    category: 'entrance',
    warningsForZeroBlock: ['Требует корректной работы clip-path — проверьте совместимость браузеров'],
  },
  'stagger-animation': {
    id: 'stagger-animation',
    name: 'Stagger Animation',
    nameRu: 'Последовательное появление',
    description: 'Группа элементов появляется один за другим с задержкой',
    needsJS: true,
    category: 'group',
    warningsForZeroBlock: [
      'Требует группы элементов с одинаковым родительским селектором',
      'Убедитесь, что все дочерние элементы имеют схожую структуру',
    ],
  },
  'background-blur-glow': {
    id: 'background-blur-glow',
    name: 'Background Blur Glow',
    nameRu: 'Свечение и размытие фона',
    description: 'Элемент появляется с эффектом свечения и backdrop-blur',
    needsJS: true,
    category: 'entrance',
    warningsForZeroBlock: ['backdrop-filter может не работать во всех браузерах'],
  },
  'smooth-image-zoom': {
    id: 'smooth-image-zoom',
    name: 'Smooth Image Zoom',
    nameRu: 'Плавный зум изображения',
    description: 'Изображение медленно увеличивается при появлении на экране',
    needsJS: true,
    category: 'entrance',
    warningsForZeroBlock: ['Применяйте к контейнеру изображения, не к самому img'],
  },
  'scroll-pin': {
    id: 'scroll-pin',
    name: 'Scroll Pin',
    nameRu: 'Фиксация при скролле',
    description: 'Элемент фиксируется на экране во время прокрутки секции',
    needsJS: true,
    category: 'scroll',
    warningsForZeroBlock: [
      'Изменяет position элемента — может конфликтовать с Zero Block layout',
      'Рекомендуется применять к блоку целиком (#rec...), а не к внутреннему элементу',
    ],
  },
};

export const PRESET_IDS = Object.keys(ANIMATION_PRESETS) as AnimationPresetId[];

export function getPreset(id: AnimationPresetId): AnimationPreset {
  return ANIMATION_PRESETS[id];
}

export function detectPresetFromQuery(query: string): AnimationPresetId {
  const q = query.toLowerCase();

  if (q.includes('параллакс') || q.includes('parallax') || q.includes('при скролл')) return 'parallax-scroll';
  if (q.includes('плавает') || q.includes('float') || q.includes('качает') || q.includes('движется') && q.includes('цикл')) return 'floating-loop';
  if (q.includes('hover') || q.includes('наведен') || q.includes('при наведении') || q.includes('подним')) return 'hover-lift';
  if (q.includes('текст') && (q.includes('открыва') || q.includes('reveal') || q.includes('раскры'))) return 'text-reveal';
  if (q.includes('последовательно') || q.includes('stagger') || q.includes('поочерёдно') || q.includes('по одному')) return 'stagger-animation';
  if (q.includes('справа') || q.includes('from right') || q.includes('slide left')) return 'slide-left';
  if (q.includes('слева') || q.includes('from left') || q.includes('slide right')) return 'slide-right';
  if (q.includes('масштаб') || q.includes('scale') || q.includes('увеличен') || q.includes('zoom in')) return 'scale-in';
  if (q.includes('зум') || q.includes('zoom') && q.includes('карт')) return 'smooth-image-zoom';
  if (q.includes('свечен') || q.includes('glow') || q.includes('blur')) return 'background-blur-glow';
  if (q.includes('фиксац') || q.includes('pin') || q.includes('sticky')) return 'scroll-pin';
  if (q.includes('снизу') || q.includes('вверх') || q.includes('fade up') || q.includes('появ') && q.includes('снизу')) return 'fade-up';
  if (q.includes('плавно') || q.includes('появ') || q.includes('fade')) return 'fade-in';

  return 'fade-up';
}

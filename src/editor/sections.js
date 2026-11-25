import { defaultConfig } from '../defaults.js';

/** Field definitions for the visual config editor, grouped into collapsible sections. */
export function editorSections() {
  var defaults = defaultConfig();
  return [
    {
      key: 'general',
      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
      title: 'Основные настройки',
      description: 'Выбор кормушки, MQTT topic и параметры карточки',
      fields: [
        { key: 'device_id', label: 'Кормушка Zigbee2MQTT', type: 'device', default: '' },
        { key: 'topic',         label: 'MQTT topic для команд',    type: 'text',   default: 'zigbee2mqtt/Feeder/set',
          note: { type: 'template', text: '<code>zigbee2mqtt/&lt;имя устройства&gt;/set</code>. Если базовый topic или имя отличаются, укажите свой адрес.' } },
        { key: 'title',         label: 'Заголовок карточки', type: 'text',   default: defaults.title },
        { key: 'icon',          label: 'Значок (эмодзи или URL изображения)', type: 'text', default: '🐱',
          note: { type: 'template', text: 'Вставьте эмодзи или укажите путь к изображению, например <code>/config/www/images/your_icon.png</code>.' } },
        { key: 'max_schedules', label: 'Максимум кормлений в расписании',       type: 'number', default: 6 },
        { key: 'quick_feed_default', label: 'Любимое число порций', type: 'number', default: 0,
          note: { type: 'template', text: 'Это число порций отмечается звёздочкой на вкладке «Покормить». Значение <code>0</code> отключает отметку.' } },
        { key: 'vibration_enabled', label: 'Вибрация при нажатии', type: 'checkbox', default: true },
        { key: 'sound_enabled', label: 'Звук при нажатии', type: 'checkbox', default: false,
          note: { type: 'template', text: 'Короткий щелчок при нажатии кнопки. По умолчанию выключен.' } },
        { key: 'mqtt_retain',   label: 'Флаг MQTT retain',    type: 'checkbox', default: false,
          note: { type: 'template', text: 'Добавляет <code>retain: true</code> к MQTT-командам, чтобы брокер хранил последнее сообщение.' } },
      ]
    },
    {
      key: 'colors',
      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',
      title: 'Цвета',
      description: 'Оформление карточки',
      fields: [
        { key: 'color_accent',    label: 'Акцент (вкладки, кнопки)',         type: 'color', default: 'rgb(255,218,120)' },
        { key: 'color_positive',  label: 'Успех (в сети, выдача корма)',    type: 'color', default: 'rgb(206,245,149)' },
        { key: 'color_danger',    label: 'Опасность (ошибки, удаление)',        type: 'color', default: 'rgb(255,145,138)' },
        { key: 'color_warning',   label: 'Предупреждение',               type: 'color', default: 'rgb(255,181,129)' },
        { key: 'color_card_bg',   label: 'Фон карточки',               type: 'color', default: '#111318' },
        { key: 'color_block_bg',  label: 'Основной фон блока',     type: 'color', default: '#1c1f27' },
        { key: 'color_block_bg2', label: 'Тёмный фон блока',        type: 'color', default: '#262a35' },
      ]
    },
    {
      key: 'labels',
      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
      title: 'Подписи',
      description: 'Заголовки вкладок и статусы',
      fields: [
        { key: 'label_schedule',    label: 'Вкладка «Расписание»',            type: 'text', default: defaults.label_schedule },
        { key: 'label_feed',        label: 'Вкладка «Покормить»',            type: 'text', default: defaults.label_feed },
        { key: 'label_settings',    label: 'Вкладка «Настройки»',            type: 'text', default: defaults.label_settings },
        { key: 'label_portions_today', label: 'Статистика — порций сегодня',   type: 'text', default: defaults.label_portions_today },
        { key: 'label_grams_today', label: 'Статистика — граммов сегодня',         type: 'text', default: defaults.label_grams_today },
        { key: 'label_per_portion',    label: 'Статистика — вес порции',               type: 'text', default: defaults.label_per_portion },
        { key: 'label_status_passed',  label: 'Расписание — прошедшее кормление',          type: 'text', default: defaults.label_status_passed },
        { key: 'label_status_next',    label: 'Расписание — следующее кормление',            type: 'text', default: defaults.label_status_next },
        { key: 'label_status_pending', label: 'Расписание — ожидаемое кормление',         type: 'text', default: defaults.label_status_pending },
      ]
    },
    {
      key: 'entities_schedule',
      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
      title: 'Сущности — расписание',
      description: 'Данные расписания и текст для заголовка',
      fields: [
        {
          key: 'entity_schedule',
          label: 'Расписание кормления',
          type: 'entity',
          default: 'sensor.feeder_schedule'
        },
        {
          key: 'entity_schedule_pretty',
          label: 'Текст расписания (необязательно)',
          type: 'entity',
          default: '',
          note: { type: 'template', text: 'Текст для заголовка карточки, когда расписание кормушки недоступно.' }
        },
      ]
    },
    {
      key: 'entities_stats',
      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
      title: 'Сущности — статистика',
      description: 'Порции и вес за день, последнее кормление',
      fields: [
        {
          key: 'entity_portions_day',
          label: 'Порций сегодня',
          type: 'entity',
          default: ''
        },
        {
          key: 'entity_weight_day',
          label: 'Граммов сегодня',
          type: 'entity',
          default: ''
        },
        {
          key: 'entity_feeding_source',
          label: 'Источник последнего кормления',
          type: 'entity',
          default: 'sensor.feeder_feeding_source'
        },
        {
          key: 'entity_feeding_size',
          label: 'Размер последней порции',
          type: 'entity',
          default: 'sensor.feeder_feeding_size'
        },
      ]
    },
    {
      key: 'entities_control',
      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>',
      title: 'Сущности — управление',
      description: 'Вес порции, размер выдачи и режим',
      fields: [
        {
          key: 'entity_portion_weight',
          label: 'Вес порции (г)',
          type: 'entity',
          default: 'number.feeder_portion_weight'
        },
        {
          key: 'entity_serving_size',
          label: 'Число порций для ручного кормления',
          type: 'entity',
          default: 'number.feeder_serving_size'
        },
        {
          key: 'entity_mode',
          label: 'Режим кормушки',
          type: 'entity',
          default: 'select.feeder_mode'
        },
      ]
    },
    {
      key: 'entities_device',
      icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
      title: 'Сущности — устройство',
      description: 'Переключатели, ошибки и прошивка',
      fields: [
        {
          key: 'entity_child_lock',
          label: 'Блокировка от детей',
          type: 'entity',
          default: 'switch.feeder_child_lock'
        },
        {
          key: 'entity_led',
          label: 'Световой индикатор',
          type: 'entity',
          default: 'switch.feeder_led_indicator'
        },
        {
          key: 'entity_error',
          label: 'Ошибка кормушки',
          type: 'entity',
          default: 'binary_sensor.feeder_error'
        },
        {
          key: 'entity_update',
          label: 'Обновление прошивки',
          type: 'entity',
          default: 'update.feeder'
        },
        {
          key: 'entity_food_level',
          label: 'Уровень корма (необязательно)',
          type: 'entity',
          default: '',
          note: { type: 'template', text: 'Датчик со значением от 0 до 100 %. Если он выбран, в заголовке появится шкала уровня корма.' }
        },
      ]
    },
  ];
}

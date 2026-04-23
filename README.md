# Aqara Feeder Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/release/badbadtrip/aqara-feeder-card.svg)](https://github.com/badbadtrip/aqara-feeder-card/releases)
[![GitHub stars](https://img.shields.io/github/stars/badbadtrip/aqara-feeder-card.svg)](https://github.com/badbadtrip/aqara-feeder-card/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/badbadtrip/aqara-feeder-card.svg)](https://github.com/badbadtrip/aqara-feeder-card/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## English

A custom Lovelace card for **Home Assistant** to control an Aqara pet feeder (and compatible Zigbee feeders) via [Zigbee2MQTT](https://www.zigbee2mqtt.io/).

### Features

- **Schedule tab** — view, add, edit and delete feeding schedules; send directly to the feeder via MQTT
- **Feed now tab** — quick 1–6 portion buttons + custom stepper with confirmation popup
- **Settings tab** — portion weight, child lock, LED indicator, operating mode, firmware version
- **Stats bar** — portions today, grams today, grams per portion
- **Full color theming** — 7 configurable colors (accents + backgrounds)
- **Custom labels** — all UI text is overridable
- **Haptic feedback** — optional vibration on mobile
- **Live status** — animated online/offline dot, error badge, schedule text in header
- **Visual config UI** — no YAML required

### Screenshots

<p align="center">
  <img src="screenshots/schedule.png" width="360" alt="Schedule tab">
  <img src="screenshots/feed-now.png" width="360" alt="Feed now tab">
  <img src="screenshots/settings.png" width="360" alt="Settings tab">
</p>

### Requirements

| Requirement | Details |
| --- | --- |
| Home Assistant | 2023.1 or newer |
| Zigbee2MQTT | Any recent version |
| MQTT integration | Configured in HA |
| Feeder | Aqara Pet Feeder C1 / E1 or compatible Zigbee feeder |

### Installation

#### Via HACS (recommended)

1. Open **HACS** → **Frontend**
2. Click the three-dot menu → **Custom repositories**
3. Enter URL: `https://github.com/badbadtrip/aqara-feeder-card`, Category: **Dashboard**
4. Click **Download**
5. Reload your browser

#### Manual

1. Copy `aqara-feeder-card.js` to `/config/www/`
2. Go to **Settings → Dashboards → Resources**
3. Add resource: URL `/local/aqara-feeder-card.js`, type: **JavaScript module**
4. Reload your browser

### Adding the card

In dashboard edit mode click **Add card** and search for **Aqara Feeder Card**.

Minimal YAML:

```yaml
type: custom:aqara-feeder-card
title: Feed the cat
icon: 🐱
topic: zigbee2mqtt/Feeder/set
```

### Configuration reference

#### General

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | string | `Feed the cat` | Card title |
| `icon` | string | `🐱` | Emoji or image path, e.g. `/local/images/cat.png` |
| `topic` | string | `zigbee2mqtt/Feeder/set` | MQTT set topic for your feeder |
| `max_schedules` | number | `6` | Maximum number of schedule slots |
| `vibration_enabled` | boolean | `true` | Haptic feedback on mobile |

#### Labels (all optional)

| Key | Default |
| --- | --- |
| `label_schedule` | `Schedule` |
| `label_feed` | `Feed now` |
| `label_settings` | `Settings` |
| `label_portions_today` | `Portions today` |
| `label_grams_today` | `Grams today` |
| `label_per_portion` | `Per portion` |

#### Colors (all optional — any valid CSS color value)

| Key | Default | Used for |
| --- | --- | --- |
| `color_accent` | `rgb(255,218,120)` | Active tab, Save/Apply buttons |
| `color_positive` | `rgb(206,245,149)` | Online dot, Feed now button |
| `color_danger` | `rgb(255,145,138)` | Error badge, delete button |
| `color_warning` | `rgb(255,181,129)` | Reserved accent color |
| `color_card_bg` | `#111318` | Card background |
| `color_block_bg` | `#1c1f27` | Stats tiles, list rows, popups |
| `color_block_bg2` | `#262a35` | Buttons, inputs, hover states |

#### Entities

Entity IDs are created automatically by Zigbee2MQTT when the feeder is paired.  
Find them at **Settings → Devices & Services → Zigbee2MQTT → your feeder**.

| Key | Default | Source |
| --- | --- | --- |
| `entity_schedule` | `sensor.feeder_schedule` | Auto (Z2M) |
| `entity_schedule_pretty` | `sensor.feeder_schedule_pretty` | ⚠️ Template — see below |
| `entity_portions_day` | `sensor.feeder_portions_per_day` | ⚠️ Template — see below |
| `entity_weight_day` | `sensor.feeder_weight_per_day` | ⚠️ Template — see below |
| `entity_portion_weight` | `number.feeder_portion_weight` | Auto (Z2M) |
| `entity_serving_size` | `number.feeder_serving_size` | Auto (Z2M) |
| `entity_feeding_source` | `sensor.feeder_feeding_source` | Auto (Z2M) |
| `entity_feeding_size` | `sensor.feeder_feeding_size` | Auto (Z2M) |
| `entity_mode` | `select.feeder_mode` | Auto (Z2M) |
| `entity_child_lock` | `switch.feeder_child_lock` | Auto (Z2M) |
| `entity_led` | `switch.feeder_led_indicator` | Auto (Z2M) |
| `entity_error` | `binary_sensor.feeder_error` | Auto (Z2M) |
| `entity_update` | `update.feeder` | Auto (Z2M) |

### Template sensors (required setup)

Three entities used by the card are **not created by Zigbee2MQTT** — you must add them yourself.

---

#### `sensor.feeder_schedule_pretty`

Formats the raw schedule JSON into a human-readable string shown in the card header (e.g. `08:00 - 2 por. | 18:00 - 3 por.`).

Add to your `template.yaml` (or under `template:` in `configuration.yaml`):

```yaml
- sensor:
    - name: "Feeder Schedule (pretty)"
      unique_id: feeder_schedule_pretty
      icon: mdi:calendar-clock
      state: >-
        {% set raw = states('sensor.feeder_schedule') -%}
        {% if raw in ['unknown','unavailable','none',''] -%}
        unavailable
        {%- else -%}
        {% set tuples = raw | regex_findall("hour'\\s*:\\s*(\\d+)\\s*,\\s*'minute'\\s*:\\s*(\\d+)\\s*,\\s*'size'\\s*:\\s*(\\d+)") -%}
        {%- if tuples | length == 0 -%}
        unavailable
        {%- else -%}
        {%- for t in tuples -%}
        {{ "%02d:%02d - %d por." | format(t[0]|int, t[1]|int, t[2]|int) }}{% if not loop.last %} | {% endif %}
        {%- endfor -%}
        {%- endif -%}
        {%- endif -%}
```

> **Note:** `sensor.feeder_schedule` is the raw entity created by Zigbee2MQTT. If your feeder's entity has a different ID, update the `states(...)` call above.

---

#### `sensor.feeder_portions_per_day`

Counts the number of times the feeder dispensed food today. Uses the [`history_stats`](https://www.home-assistant.io/integrations/history_stats/) integration which is included in Home Assistant by default.

Add to `configuration.yaml`:

```yaml
sensor:
  - platform: history_stats
    name: "Feeder Portions Per Day"
    unique_id: feeder_portions_per_day
    entity_id: sensor.feeder_feeding_source
    # counts every state change (each feeding event)
    state: "schedule"
    type: count
    start: "{{ today_at('00:00') }}"
    end: "{{ now() }}"

  # If you also want to count manual feedings, add a second sensor:
  - platform: history_stats
    name: "Feeder Portions Per Day (manual)"
    unique_id: feeder_portions_per_day_manual
    entity_id: sensor.feeder_feeding_source
    state: "manual"
    type: count
    start: "{{ today_at('00:00') }}"
    end: "{{ now() }}"
```

> Alternatively, you can count total feedings regardless of source using a template sensor that watches `sensor.feeder_feeding_size` state changes — see the approach below.

Or, using a template sensor that increments on any state change of `sensor.feeder_feeding_size` (works for all sources):

```yaml
# In template.yaml
- trigger:
    - trigger: state
      entity_id: sensor.feeder_feeding_size
  sensor:
    - name: "Feeder Portions Per Day"
      unique_id: feeder_portions_per_day
      state: >
        {% set today = now().date() | string %}
        {% if states('sensor.feeder_portions_per_day') == 'unknown'
              or this.attributes.get('last_reset_date','') != today %}
          1
        {% else %}
          {{ (states('sensor.feeder_portions_per_day') | int(0)) + 1 }}
        {% endif %}
      attributes:
        last_reset_date: "{{ now().date() | string }}"
```

> **Recommended approach:** use `history_stats` — it is simpler, survives restarts, and resets automatically at midnight.

---

#### `sensor.feeder_weight_per_day`

Calculates total grams dispensed today: `portions_today × grams_per_portion`.  
Depends on `sensor.feeder_portions_per_day` and `number.feeder_portion_weight` (both must exist).

Add to `template.yaml`:

```yaml
- sensor:
    - name: "Feeder Weight Per Day"
      unique_id: feeder_weight_per_day
      unit_of_measurement: "g"
      icon: mdi:weight-gram
      state: >
        {% set portions = states('sensor.feeder_portions_per_day') | int(0) %}
        {% set grams = states('number.feeder_portion_weight') | float(0) %}
        {{ (portions * grams) | round(0) | int }}
```

---

#### Applying changes

After adding any of the above, reload the relevant config without restarting HA:

- **Developer Tools → YAML → Reload Template Entities** — for `template.yaml` changes
- **Developer Tools → YAML → Reload All YAML** — for `configuration.yaml` changes (e.g. `history_stats`)

---

### Full YAML example

```yaml
type: custom:aqara-feeder-card
title: Whiskers
icon: /local/images/cat.png
topic: zigbee2mqtt/Feeder/set
max_schedules: 6
vibration_enabled: true
color_accent: "rgb(255,218,120)"
color_positive: "rgb(206,245,149)"
color_danger: "rgb(255,145,138)"
color_warning: "rgb(255,181,129)"
color_card_bg: "#111318"
color_block_bg: "#1c1f27"
color_block_bg2: "#262a35"
label_schedule: Schedule
label_feed: Feed now
label_settings: Settings
label_portions_today: Portions today
label_grams_today: Grams today
label_per_portion: Per portion
entity_schedule: sensor.feeder_schedule
entity_schedule_pretty: sensor.feeder_schedule_pretty
entity_portions_day: sensor.feeder_portions_per_day
entity_weight_day: sensor.feeder_weight_per_day
entity_portion_weight: number.feeder_portion_weight
entity_serving_size: number.feeder_serving_size
entity_feeding_source: sensor.feeder_feeding_source
entity_feeding_size: sensor.feeder_feeding_size
entity_mode: select.feeder_mode
entity_child_lock: switch.feeder_child_lock
entity_led: switch.feeder_led_indicator
entity_error: binary_sensor.feeder_error
entity_update: update.feeder
```

### Finding the MQTT topic

Open Zigbee2MQTT → **Devices** → find your feeder. The friendly name is used in the topic:

```text
zigbee2mqtt/<friendly_name>/set
```

Example — if the friendly name is `Feeder`:

```text
zigbee2mqtt/Feeder/set
```

### Contributing

Issues and pull requests are welcome. Please open an issue before starting large changes.

### License

[MIT](LICENSE)

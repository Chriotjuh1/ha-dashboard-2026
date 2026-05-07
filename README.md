# Claude Dark — Home Assistant Dashboard 2026

Een modern Lovelace dashboard voor Home Assistant in de huiskleuren van Claude:
warm dark, koraaloranje accenten, crème typografie. Gebouwd met de **sections
view** (grid-gebaseerd, native in HA ≥ 2024.3) plus enkele populaire HACS-kaarten
voor extra finesse.

## Inhoud

```
.
├── themes/
│   └── claude_dark.yaml          # Custom HA theme
├── dashboards/
│   └── claude_dashboard.yaml     # Lovelace dashboard (storage-vrij, YAML-mode)
└── configuration_snippet.yaml    # Toe te voegen aan configuration.yaml
```

## Installatie

### 1. Thema installeren

Kopieer `themes/claude_dark.yaml` naar `<config>/themes/claude_dark.yaml` op je
HA-instance. Voeg in `configuration.yaml` toe (zie ook
`configuration_snippet.yaml`):

```yaml
frontend:
  themes: !include_dir_merge_named themes
```

Herstart Home Assistant en kies **Claude Dark** via je profielinstellingen
(rechtsonder → Thema).

### 2. Dashboard installeren

Kopieer `dashboards/claude_dashboard.yaml` naar
`<config>/dashboards/claude_dashboard.yaml`.

Voeg in `configuration.yaml` onder `lovelace:` toe:

```yaml
lovelace:
  mode: storage          # default UI editor blijft werken
  dashboards:
    claude-dashboard:
      mode: yaml
      title: Claude
      icon: mdi:hexagon-multiple
      show_in_sidebar: true
      filename: dashboards/claude_dashboard.yaml
```

Herstart HA → "Claude" verschijnt in de zijbalk.

### 3. HACS-afhankelijkheden

Het dashboard gebruikt deze custom cards (allen via HACS → Frontend):

| Card | Gebruik |
| --- | --- |
| `mushroom` | Compacte tegels voor licht, klimaat, media |
| `mini-graph-card` | Inline grafieken voor energie en sensoren |
| `bubble-card` | Mooie pop-up controls voor lampen |
| `button-card` | Custom scènetegels |

Zonder HACS werkt 90% nog steeds — vervang in dat geval de mushroom-tegels door
ingebouwde `tile`-cards (zelfde entity_id, andere `type:`).

### 4. Entities aanpassen

Het dashboard bevat **placeholder entity_ids** zoals `light.woonkamer`,
`sensor.zonnepanelen_vermogen`, etc. Zoek-en-vervang deze met je eigen
entities. Alle placeholders staan tussen `# CHANGEME:` comments voor snel
terugvinden.

## Schermafbeelding (referentie)

```
┌──────────────────────────────────────────────────────────┐
│  Goedemorgen, Chris                          21°C  ☀️    │
├──────────────────────────────────────────────────────────┤
│  [Verlichting]   [Klimaat]   [Media]    [Beveiliging]   │
│                                                          │
│  ╭──────────╮   ╭──────────╮   ╭───────────────────╮    │
│  │ 💡 Woonk │   │ 🌡 21.4° │   │ 🎵 Now Playing    │    │
│  │  3 aan   │   │  vochtig │   │   Bonobo - Linked │    │
│  ╰──────────╯   ╰──────────╯   ╰───────────────────╯    │
│                                                          │
│  Energie vandaag           ⚡ 2.4 kW   ☀ 1.8 kW         │
│  ▁▂▃▅▇▆▄▃▂▁▁▂▄▆▇▆▅▃▂▁                                  │
└──────────────────────────────────────────────────────────┘
```

## Kleuren-palet

| Token | Hex | Gebruik |
| --- | --- | --- |
| `claude-bg` | `#1F1E1B` | Page background |
| `claude-surface` | `#2C2A26` | Cards |
| `claude-surface-2` | `#36332E` | Hover / nested |
| `claude-primary` | `#D97757` | Accent / aan-staat |
| `claude-primary-soft` | `#E89B7E` | Iconen, hover |
| `claude-cream` | `#F4F1EA` | Primaire tekst |
| `claude-muted` | `#8A8580` | Secundaire tekst |
| `claude-success` | `#7FB069` | Status OK |
| `claude-warning` | `#E8B86E` | Waarschuwing |
| `claude-danger` | `#D96D6D` | Alarm |

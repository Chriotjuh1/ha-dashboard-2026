# Claude Dark — Home Assistant Dashboard 2026

Een Lovelace dashboard dat de **claude.ai design taal** naar Home Assistant
brengt: warm dark (`#262624`), koraaloranje accent (`#C96342`), crème
typografie, **Fraunces** serif voor headings + **Inter** voor body, generous
whitespace en bijna onzichtbare borders i.p.v. drop shadows.

Gebouwd met de native **sections view** (HA ≥ 2024.3) en zwaar gebruik van
**card-mod** om elke card de claude.ai-look te geven.

## Inhoud

```
.
├── themes/
│   └── claude_dark.yaml          # Custom HA theme
├── dashboards/
│   └── claude_dashboard.yaml     # Lovelace dashboard (storage-vrij, YAML-mode)
├── preview/
│   ├── index.html                # Desktop preview
│   └── mobile.html               # Mobile-first preview (HA Companion stijl)
└── configuration_snippet.yaml    # Toe te voegen aan configuration.yaml
```

## Preview

Twee statische HTML-mockups om de look in je browser te bekijken zonder HA:

- `preview/index.html` — **desktop** layout met zijbalk, 4-koloms grids
- `preview/mobile.html` — **mobile-first** layout in een phone-frame met
  bottom-tabs, single/2-koloms grids, en `:active` tap-feedback (zoals de
  HA Companion app)

Beide gebruiken exact dezelfde Fraunces+Inter fonts, Claude-kleuren, borders en
hover-states als de echte Lovelace dashboard. Geen server nodig, gewoon
dubbelklikken.

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
| `card-mod` | **Vereist** — geeft elke card de claude.ai look (fonts, borders, hover) |
| `mushroom` | Compacte tegels voor personen, klimaat |
| `mini-graph-card` | Inline grafiek voor zonneproductie |
| `neerslag-card` | Buienalarm radar (al in gebruik) |

Zonder card-mod blijft het thema werken, maar valt de typografie terug op de
systeem-font-stack en zijn hover/border-effecten basaal. **Sterk aangeraden om
card-mod te installeren.**

### 3b. Google Fonts

Het thema laadt automatisch **Fraunces** (serif) en **Inter** (sans) van Google
Fonts via `card-mod-root-yaml`. Dit gebeurt via een `@import` in de root
shadow-DOM — geen extra resource nodig. Heb je Local Network only restrictions,
zelfhost de fonts en pas het pad in `themes/claude_dark.yaml` aan.

### 4. Entities

Dit dashboard is afgestemd op de entities van Chris' HA-instance:
`sensor.zonnepanelen_*`, `sensor.sma_*`, `switch.woonkamerlamp`,
`person.chris_joosten`, `weather.forecast_home`, `sensor.pmd|restafval|papier`,
`climate.woonkamer`, `sensor.carbu_com_super95_3640_*`, etc. Geen placeholders
meer — alles werkt direct.

## Design taal

| Element | Detail |
| --- | --- |
| Achtergrond | `#262624` (warm dark) |
| Cards | `#30302E` met `1px` border `rgba(240,238,230,0.07)`, **geen schaduw** |
| Hover | border klimt naar `rgba(240,238,230,0.14)` + iets lichtere bg |
| Headings | Fraunces, `400 weight`, letter-spacing `-0.02em` |
| Body | Inter, `400 weight` |
| Cijfers | Fraunces, 32–40px voor stats |
| Primary CTA | Vol koraal `#C96342`, hover `#D97757` |
| Secondary CTA | Transparant met dunne border |
| Border-radius | `16px` (cards), `12px` (inputs) |

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

## Standalone Webapp (Thuis dashboard)

Naast het native Lovelace dashboard biedt dit project ook een **volledig zelfstandige
webapp** — een single-page app gebouwd in vanilla JavaScript + WebSocket, geoptimaliseerd voor mobiel. Wordt geladen als Lovelace dashboard via een iframe-card wrapper (`joosten_app.yaml`).

### Installatie

1. **Webapp installeren:**
   - Kopieer de inhoud van `webapp/` (index.html, manifest.json, icon.svg) naar `<config>/www/dashboard/`
   - Kopieer `www/claude-fonts.js` naar `<config>/www/claude-fonts.js`

2. **Dashboard wrapper installeren:**
   - Kopieer `dashboards/joosten_app.yaml` naar `<config>/dashboards/joosten_app.yaml`

3. **In configuration.yaml toevoegen** (zie `configuration_snippet.yaml`):
   
   ```yaml
   lovelace:
     mode: storage
     dashboards:
       joosten-app:
         mode: yaml
         title: Thuis
         icon: mdi:hexagon-multiple
         show_in_sidebar: true
         filename: dashboards/joosten_app.yaml
   ```

4. **Herstart Home Assistant**
   - Settings → System → **Restart Home Assistant**
   - "Thuis" verschijnt in de zijbalk als dashboard met de webapp full-screen

### Voordelen webapp

- **Sneller laden** — geen Lovelace overhead
- **Volledig responsief** — geoptimaliseerd voor HA Companion app (portrait)
- **Real-time updates** — WebSocket-verbinding (niet polling)
- **PWA-capable** — installeerbaar op home screen
- **Gestroomlijnde UI** — bottom-nav op mobiel, 7 views (Start, Zonne, Media, Lampen, Afval, Weer, Benzine)

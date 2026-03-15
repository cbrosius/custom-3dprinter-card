# Custom 3D Printer Card V2

Eine Home Assistant Custom Card für 3D-Drucker mit nativen HA-Komponenten.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Home Assistant](https://img.shields.io/badge/home%20assistant-2025.10.0%2B-blue)

## Features

- **GUI-Konfiguration**: Vollständig konfigurierbar über die Home Assistant UI
- **Native HA-Komponenten**: Verwendet hui-tile-card und mushroom-template-card
- **Status-basierte Anzeige**: Verschiedene Ansichten je nach Druckerstatus
- **Kamera-Stream**: Unterstützt MJPEG, HLS und Snapshot-Polling
- **Konfigurierbare Kacheln**: Optionale Anzeige von Layer, Fortschritt, Bett, Nozzle, Leistung, Zeit, ETA

## Status-Ansichten

### Unavailable (Ausgeschaltet)
- Header mit Drucker-Bild/Icon, Name, Status und Power-ON Button

### Idle (Bereit)
- Header mit Name, Status und Power-OFF Button
- Kamera (volle Breite)
- Temperatur-Kacheln: Druckbett, Nozzle

### Printing (Druckt)
- Kamera (volle Breite) mit Live-Badge
- Druckmodell-Vorschau (klickbar für Lightbox)
- Job-Name und Zeit (Startzeit + ETA mit Relative-Time)
- Fortschrittsbalken mit Prozentanzeige
- Header-Sensor-Strip: Layer, Bett-Temperatur, Nozzle-Temperatur
- Konfigurierbare Kacheln (2-Spalten-Raster):
  - Aktueller Layer / Gesamt-Layer
  - Druckfortschritt (%)
  - Druckbett-Temperatur
  - Nozzle-Temperatur
  - Leistungsaufnahme (W)
  - Bisherige Druckzeit
  - ETA

## Installation

### HACS (Home Assistant Community Store)

1. Öffne HACS in Home Assistant
2. Gehe zu "Frontend" → "Benutzerdefinierte Repositories"
3. Füge die URL dieses Repositories hinzu
4. Wähle "Lovelace" als Kategorie
5. Installiere die Card
6. Lade die Ressourcen neu oder starte Home Assistant neu

### Manuelle Installation

1. Lade die Dateien aus dem `dist`-Ordner herunter
2. Kopiere sie in das Verzeichnis `config/www/community/custom-printer-card/`
3. Füge folgende Ressourcen in deine Lovelace-Dashboard-Konfiguration ein:

```yaml
resources:
  - type: module
    url: /hacsfiles/custom-printer-card/printer-card-v2.js
```

## Konfiguration

### GUI-Konfiguration (Empfohlen)

1. Füge eine neue Card zu deinem Dashboard hinzu
2. Suche nach "3D Printer Card"
3. Wähle deine Drucker-Entitäten aus
4. Passe die Anzeige-Einstellungen nach Bedarf an

### YAML-Konfiguration

```yaml
type: custom:printer-card-v2
name: Mein 3D Drucker
printer_status_entity: sensor.printer_status
camera_entity: camera.printer_camera
power_switch_entity: switch.printer_power
power_sensor_entity: sensor.printer_power_watts
bed_temp_entity: sensor.bed_temperature
nozzle_temp_entity: sensor.nozzle_temperature
print_progress_entity: sensor.print_progress
print_start_time: sensor.print_start_time
eta_entity: sensor.eta
current_layer_entity: sensor.current_layer
total_layers_entity: sensor.total_layers
thumbnail_entity: sensor.print_thumbnail
job_name_entity: sensor.job_name
accent_color: [175, 100, 0]

# Drucker-Bild
printer_image: "A1Mini.jpg"

# Kacheln während Druck (alle Standard: true)
show_tile_layer: true
show_tile_progress: true
show_tile_bed: true
show_tile_nozzle: true
show_tile_power: true
show_tile_elapsed: true
show_tile_eta: true
```

### Konfigurationsoptionen

| Option | Typ | Beschreibung | Standard |
|--------|-----|--------------|----------|
| `name` | string | Anzeigename des Druckers | "3D Drucker" |
| `printer_image` | string/object | Drucker-Bild | "" |
| `printer_status_entity` | string | Status-Sensor des Druckers | - |
| `camera_entity` | string | Kamera-Entität | - |
| `power_switch_entity` | string | Power-Schalter Entität | - |
| `power_sensor_entity` | string | Leistungsaufnahme Sensor (W) | - |
| `accent_color` | array | Akzentfarbe RGB [r,g,b] | [175,100,0] |
| `bed_temp_entity` | string | Druckbett-Temperatur Sensor | - |
| `nozzle_temp_entity` | string | Nozzle-Temperatur Sensor | - |
| `print_progress_entity` | string | Druckfortschritt Sensor (%) | - |
| `print_start_time` | string | Druckstart-Zeit Sensor | - |
| `eta_entity` | string | Fertigstellung (ETA) Sensor | - |
| `current_layer_entity` | string | Aktueller Layer Sensor | - |
| `total_layers_entity` | string | Gesamtlayers Sensor | - |
| `thumbnail_entity` | string | Modell-Vorschaubild Sensor | - |
| `job_name_entity` | string | Dateiname / Job-Name Sensor | - |
| `show_tile_layer` | boolean | Layer-Kachel anzeigen | true |
| `show_tile_progress` | boolean | Fortschritt-Kachel anzeigen | true |
| `show_tile_bed` | boolean | Bett-Temperatur-Kachel anzeigen | true |
| `show_tile_nozzle` | boolean | Nozzle-Temperatur-Kachel anzeigen | true |
| `show_tile_power` | boolean | Leistungs-Kachel anzeigen | true |
| `show_tile_elapsed` | boolean | Bisherige Zeit-Kachel anzeigen | true |
| `show_tile_eta` | boolean | ETA-Kachel anzeigen | true |

## Voraussetzungen

- Home Assistant 2025.10+
- Drucker-Integration in Home Assistant eingerichtet (z.B. PrusaLink, OctoPrint, Bambu Lab, etc.)
- Optional: Eine Kamera, die den Drucker überwacht
- Optional: Ein Schalter zur Steuerung der Spannungsversorgung
- Optional: Leistungs-Sensor zur Erfassung des Stromverbrauchs


## Mitwirken

Beiträge sind willkommen! Bitte erstelle einen Pull Request oder öffne ein Issue.

## Lizenz

MIT License

## Danksagung

- [Home Assistant](https://www.home-assistant.io/)
- Verwendet native HA-Komponenten: hui-tile-card, mushroom-template-card, ha-relative-time

## Support

Bei Problemen oder Fragen erstelle bitte ein Issue im GitHub Repository.

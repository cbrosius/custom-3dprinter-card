import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@3.3.3/lit-element.js?module";

const SCHEMA = [
  {
    name: "name",
    selector: { text: {} },
    label: "Name",
    help: "Anzeigename des Druckers",
  },
  {
    name: "icon",
    selector: { icon: {} },
    label: "Icon",
    help: "Icon für den Drucker (optional, Standard: mdi:printer-3d)",
  },
  {
    name: "device",
    selector: { device: {} },
    label: "Device",
    help: "PrusaLink Device (automatische Entitätserkennung)",
  },
  {
    name: "camera",
    selector: { entity: { domain: ["camera"] } },
    label: "Kamera",
    help: "Kamera-Entität für den Drucker",
  },
  {
    name: "power_switch",
    selector: { entity: { domain: ["switch"] } },
    label: "Spannungsversorgungs-Schalter",
    help: "Schalter zum Ein-/Ausschalten der Spannungsversorgung",
  },
  {
    type: "expand",
    name: "sensor_settings",
    icon: "mdi:thermometer",
    title: "Temperatur-Sensoren",
    schema: [
      {
        name: "bed_temp_sensor",
        selector: { entity: { domain: ["sensor"] } },
        label: "Druckbett-Temperatur",
        help: "Sensor für die Druckbett-Temperatur",
      },
      {
        name: "nozzle_temp_sensor",
        selector: { entity: { domain: ["sensor"] } },
        label: "Nozzle-Temperatur",
        help: "Sensor für die Nozzle-Temperatur",
      },
    ],
  },
  {
    type: "expand",
    name: "print_settings",
    icon: "mdi:printer-3d",
    title: "Druck-Sensoren",
    schema: [
      {
        name: "progress_sensor",
        selector: { entity: { domain: ["sensor"] } },
        label: "Druckfortschritt (%)",
        help: "Sensor für den Druckfortschritt in Prozent",
      },
      {
        name: "time_elapsed_sensor",
        selector: { entity: { domain: ["sensor"] } },
        label: "Bisherige Laufzeit",
        help: "Sensor für die bisherige Druckzeit",
      },
      {
        name: "time_remaining_sensor",
        selector: { entity: { domain: ["sensor"] } },
        label: "Restlaufzeit",
        help: "Sensor für die verbleibende Druckzeit",
      },
      {
        name: "current_layer_sensor",
        selector: { entity: { domain: ["sensor"] } },
        label: "Aktueller Layer",
        help: "Sensor für den aktuellen Layer",
      },
      {
        name: "total_layers_sensor",
        selector: { entity: { domain: ["sensor"] } },
        label: "Gesamtlayers",
        help: "Sensor für die Gesamtzahl der Layers",
      },
      {
        name: "fan_speed_sensor",
        selector: { entity: { domain: ["sensor"] } },
        label: "Lüfter",
        help: "Sensor für die Lüftergeschwindigkeit",
      },
    ],
  },
  {
    type: "expand",
    name: "display_settings",
    icon: "mdi:cog",
    title: "Anzeige-Einstellungen",
    schema: [
      {
        name: "show_preview",
        selector: { boolean: {} },
        label: "Druckvorschau anzeigen",
        help: "Zeigt eine Vorschau des Druckmodells an",
      },
    ],
  },
];

class PrusaCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        padding: 0;
      }

      .form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .section {
        background: var(--card-background-color, var(--ha-card-background));
        border-radius: 12px;
        padding: 16px;
      }

      .section-title {
        font-size: 16px;
        font-weight: 500;
        color: var(--primary-text-color);
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .field {
        margin-bottom: 16px;
      }

      .field:last-child {
        margin-bottom: 0;
      }

      .field-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
        margin-bottom: 4px;
        display: block;
      }

      .field-help {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }

      .auto-detect {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-top: 8px;
      }

      .auto-detect-button {
        padding: 8px 16px;
        border-radius: 8px;
        border: none;
        background: var(--primary-color);
        color: white;
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: opacity 0.2s;
      }

      .auto-detect-button:hover {
        opacity: 0.9;
      }

      .auto-detect-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .detected-info {
        font-size: 12px;
        color: var(--secondary-text-color);
        padding: 8px;
        background: var(--disabled-color);
        border-radius: 8px;
        margin-top: 8px;
      }

      .detected-entities {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-top: 8px;
      }

      .detected-entity {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: var(--primary-text-color);
      }

      .detected-entity ha-icon {
        color: var(--success-color);
        --mdc-icon-size: 16px;
      }
    `;
  }

  setConfig(config) {
    this._config = config;
  }

  get value() {
    return this._config;
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass) {
      return;
    }

    const target = ev.target;
    if (this._config[target.configValue] === target.value) {
      return;
    }

    if (target.configValue) {
      if (target.value === "") {
        const newConfig = { ...this._config };
        delete newConfig[target.configValue];
        this._config = newConfig;
      } else {
        this._config = {
          ...this._config,
          [target.configValue]: target.value,
        };
      }
    }

    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      })
    );
  }

  _deviceChanged(ev) {
    const deviceId = ev.detail?.value || ev.target?.value;
    if (!deviceId) return;

    this._config = {
      ...this._config,
      device: deviceId,
    };

    // Auto-detect entities for this device
    this._autoDetectEntities(deviceId);

    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      })
    );
  }

  _autoDetectEntities(deviceId) {
    if (!this.hass || !deviceId) return;

    const device = this.hass.devices[deviceId];
    if (!device) return;

    // Find all entities for this device
    const entities = Object.values(this.hass.states).filter(
      (state) => state.attributes && state.attributes.device_id === deviceId
    );

    const detected = {
      bed_temp_sensor: null,
      nozzle_temp_sensor: null,
      progress_sensor: null,
      time_elapsed_sensor: null,
      time_remaining_sensor: null,
      current_layer_sensor: null,
      total_layers_sensor: null,
      fan_speed_sensor: null,
      camera: null,
      power_switch: null,
    };

    // Detect entities based on common naming patterns
    entities.forEach((entity) => {
      const entityId = entity.entity_id.toLowerCase();
      const friendlyName = (entity.attributes.friendly_name || "").toLowerCase();

      // Camera
      if (entityId.includes("camera") || entity.entity_id.startsWith("camera.")) {
        detected.camera = entity.entity_id;
      }
      
      // Power switch
      if (entity.entity_id.startsWith("switch.") && 
          (entityId.includes("power") || entityId.includes("relay") || friendlyName.includes("power"))) {
        detected.power_switch = entity.entity_id;
      }

      // Temperature sensors
      if (entity.entity_id.startsWith("sensor.")) {
        // Bed temperature
        if (entityId.includes("bed") && (entityId.includes("temp") || entity.attributes.device_class === "temperature")) {
          detected.bed_temp_sensor = entity.entity_id;
        }
        
        // Nozzle/tool temperature
        if ((entityId.includes("tool") || entityId.includes("nozzle") || entityId.includes("hotend")) && 
            (entityId.includes("temp") || entity.attributes.device_class === "temperature")) {
          detected.nozzle_temp_sensor = entity.entity_id;
        }

        // Progress
        if (entityId.includes("progress") || entity.attributes.unit_of_measurement === "%") {
          detected.progress_sensor = entity.entity_id;
        }

        // Time remaining
        if ((entityId.includes("time") && entityId.includes("remaining")) || 
            entityId.includes("time_left") || 
            entityId.includes("left")) {
          detected.time_remaining_sensor = entity.entity_id;
        }

        // Time elapsed
        if ((entityId.includes("time") && entityId.includes("elapsed")) || 
            entityId.includes("time_printing") || 
            entityId.includes("printed")) {
          detected.time_elapsed_sensor = entity.entity_id;
        }

        // Current layer
        if (entityId.includes("layer") && !entityId.includes("total") && !entityId.includes("count")) {
          detected.current_layer_sensor = entity.entity_id;
        }

        // Total layers
        if ((entityId.includes("layer") && (entityId.includes("total") || entityId.includes("count"))) ||
            entityId.includes("layers")) {
          detected.total_layers_sensor = entity.entity_id;
        }

        // Fan speed
        if (entityId.includes("fan") && (entityId.includes("speed") || entityId.includes("percent"))) {
          detected.fan_speed_sensor = entity.entity_id;
        }
      }
    });

    // Update config with detected entities
    Object.entries(detected).forEach(([key, value]) => {
      if (value && !this._config[key]) {
        this._config[key] = value;
      }
    });

    this._detectedEntities = Object.entries(detected)
      .filter(([_, value]) => value !== null)
      .map(([type, entityId]) => ({ type, entityId }));

    this.requestUpdate();
  }

  _renderEntitySelector(name, label, help, domain) {
    const value = this._config?.[name] || "";
    
    return html`
      <div class="field">
        <label class="field-label">${label}</label>
        <ha-entity-picker
          .hass=${this.hass}
          .value=${value}
          .includeDomains=${domain ? [domain] : undefined}
          .configValue=${name}
          @value-changed=${this._valueChanged}
          allow-custom-entity
        ></ha-entity-picker>
        ${help ? html`<div class="field-help">${help}</div>` : ""}
      </div>
    `;
  }

  _renderTextField(name, label, help) {
    const value = this._config?.[name] || "";
    
    return html`
      <div class="field">
        <label class="field-label">${label}</label>
        <ha-textfield
          .value=${value}
          .configValue=${name}
          @change=${this._valueChanged}
        ></ha-textfield>
        ${help ? html`<div class="field-help">${help}</div>` : ""}
      </div>
    `;
  }

  _renderIconSelector(name, label, help) {
    const value = this._config?.[name] || "";
    
    return html`
      <div class="field">
        <label class="field-label">${label}</label>
        <ha-icon-picker
          .value=${value}
          .configValue=${name}
          @value-changed=${this._valueChanged}
        ></ha-icon-picker>
        ${help ? html`<div class="field-help">${help}</div>` : ""}
      </div>
    `;
  }

  _renderDeviceSelector(name, label, help) {
    const value = this._config?.[name] || "";
    
    return html`
      <div class="field">
        <label class="field-label">${label}</label>
        <ha-device-picker
          .hass=${this.hass}
          .value=${value}
          @value-changed=${this._deviceChanged}
        ></ha-device-picker>
        ${help ? html`<div class="field-help">${help}</div>` : ""}
        ${this._detectedEntities && this._detectedEntities.length > 0 ? html`
          <div class="detected-info">
            <strong>Erkannte Entitäten:</strong>
            <div class="detected-entities">
              ${this._detectedEntities.map(entity => html`
                <div class="detected-entity">
                  <ha-icon icon="mdi:check-circle"></ha-icon>
                  <span>${this._formatEntityType(entity.type)}: ${entity.entityId}</span>
                </div>
              `)}
            </div>
          </div>
        ` : ""}
      </div>
    `;
  }

  _formatEntityType(type) {
    const labels = {
      bed_temp_sensor: "Druckbett-Temp",
      nozzle_temp_sensor: "Nozzle-Temp",
      progress_sensor: "Fortschritt",
      time_elapsed_sensor: "Laufzeit",
      time_remaining_sensor: "Restlaufzeit",
      current_layer_sensor: "Aktueller Layer",
      total_layers_sensor: "Gesamtlayers",
      fan_speed_sensor: "Lüfter",
      camera: "Kamera",
      power_switch: "Power-Schalter",
    };
    return labels[type] || type;
  }

  _renderToggle(name, label, help) {
    const value = this._config?.[name] || false;
    
    return html`
      <div class="field">
        <ha-formfield .label=${label}>
          <ha-switch
            .checked=${value}
            .configValue=${name}
            @change=${this._valueChanged}
          ></ha-switch>
        </ha-formfield>
        ${help ? html`<div class="field-help">${help}</div>` : ""}
      </div>
    `;
  }

  _renderExpandableSection(name, icon, title, schema) {
    const isExpanded = this._expandedSections?.[name] || false;
    
    return html`
      <ha-expansion-panel
        .expanded=${isExpanded}
        @expanded-changed=${(ev) => {
          this._expandedSections = {
            ...this._expandedSections,
            [name]: ev.detail.expanded,
          };
        }}
      >
        <div slot="header" class="section-title">
          <ha-icon icon="${icon}"></ha-icon>
          <span>${title}</span>
        </div>
        <div class="section-content">
          ${schema.map(field => this._renderField(field))}
        </div>
      </ha-expansion-panel>
    `;
  }

  _renderField(field) {
    if (field.type === "expand") {
      return this._renderExpandableSection(
        field.name,
        field.icon,
        field.title,
        field.schema
      );
    }

    if (field.selector?.text) {
      return this._renderTextField(field.name, field.label, field.help);
    }

    if (field.selector?.icon) {
      return this._renderIconSelector(field.name, field.label, field.help);
    }

    if (field.selector?.device) {
      return this._renderDeviceSelector(field.name, field.label, field.help);
    }

    if (field.selector?.entity) {
      const domain = field.selector.entity.domain;
      return this._renderEntitySelector(field.name, field.label, field.help, domain);
    }

    if (field.selector?.boolean) {
      return this._renderToggle(field.name, field.label, field.help);
    }

    return html``;
  }

  render() {
    if (!this.hass || !this._config) {
      return html``;
    }

    return html`
      <div class="form">
        <div class="section">
          ${this._renderField(SCHEMA[0])}
          ${this._renderField(SCHEMA[1])}
          ${this._renderField(SCHEMA[2])}
          ${this._renderField(SCHEMA[3])}
          ${this._renderField(SCHEMA[4])}
        </div>
        
        ${this._renderExpandableSection(
          "sensor_settings",
          "mdi:thermometer",
          "Temperatur-Sensoren",
          SCHEMA[5].schema
        )}
        
        ${this._renderExpandableSection(
          "print_settings",
          "mdi:printer-3d",
          "Druck-Sensoren",
          SCHEMA[6].schema
        )}
        
        ${this._renderExpandableSection(
          "display_settings",
          "mdi:cog",
          "Anzeige-Einstellungen",
          SCHEMA[7].schema
        )}
      </div>
    `;
  }
}

customElements.define("prusa-card-editor", PrusaCardEditor);

console.info("%c PRUSA-CARD-EDITOR %c v1.0.0 ", "background: #41bdf5; color: white; font-weight: 700;", "background: #00d2d5; color: white; font-weight: 700;");

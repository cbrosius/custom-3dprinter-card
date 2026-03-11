import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@3.3.3/lit-element.js?module";
import "./editor.js";

const HELPERS = window.loadCardHelpers ? window.loadCardHelpers() : undefined;

class PrusaCard extends LitElement {
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
        --card-border-radius: 20px;
        --card-padding: 16px;
        --mushroom-primary-color: rgb(var(--rgb-primary));
        --mushroom-secondary-color: rgba(var(--rgb-primary), 0.6);
        --mushroom-disabled-color: rgba(var(--rgb-disabled), 0.2);
        --mushroom-card-primary-color: var(--primary-text-color);
        --mushroom-card-secondary-color: var(--secondary-text-color);
        --mushroom-icon-color: var(--state-icon-color);
      }

      .card {
        background: var(--card-background-color, var(--ha-card-background));
        border-radius: var(--card-border-radius);
        box-shadow: var(--ha-card-box-shadow, 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12));
        padding: var(--card-padding);
        transition: box-shadow 0.3s ease-in-out;
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
      }

      .icon-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: var(--mushroom-disabled-color);
        transition: background-color 0.3s ease-in-out;
      }

      .icon-container.active {
        background: rgba(var(--rgb-primary), 0.2);
      }

      .icon-container.printing {
        background: rgba(var(--rgb-accent-color), 0.2);
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.7; }
        100% { opacity: 1; }
      }

      .icon-container ha-icon {
        color: var(--mushroom-icon-color);
        --mdc-icon-size: 24px;
      }

      .header-info {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }

      .name {
        font-size: 16px;
        font-weight: 500;
        color: var(--mushroom-card-primary-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .status {
        font-size: 12px;
        color: var(--mushroom-card-secondary-color);
        text-transform: capitalize;
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }

      .action-button {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        border: none;
        background: var(--mushroom-disabled-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease-in-out;
      }

      .action-button:hover {
        background: rgba(var(--rgb-primary), 0.3);
      }

      .action-button ha-icon {
        color: var(--mushroom-card-primary-color);
        --mdc-icon-size: 20px;
      }

      .camera-container {
        width: 100%;
        aspect-ratio: 16 / 9;
        border-radius: 12px;
        overflow: hidden;
        margin-bottom: 12px;
        background: var(--mushroom-disabled-color);
        position: relative;
      }

      .camera-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .camera-unavailable {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--mushroom-card-secondary-color);
        font-size: 14px;
      }

      .content-grid {
        display: grid;
        gap: 12px;
      }

      .content-grid.two-columns {
        grid-template-columns: 1fr 1fr;
      }

      .sensors-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .sensor-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .sensor-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        background: var(--mushroom-disabled-color);
        border-radius: 8px;
      }

      .sensor-item ha-icon {
        color: var(--mushroom-icon-color);
        --mdc-icon-size: 20px;
      }

      .sensor-value {
        font-size: 14px;
        color: var(--mushroom-card-primary-color);
        font-weight: 500;
      }

      .sensor-label {
        font-size: 12px;
        color: var(--mushroom-card-secondary-color);
      }

      .print-preview {
        min-height: 150px;
        background: var(--mushroom-disabled-color);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
      }

      .print-preview img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .progress-bar {
        height: 8px;
        background: var(--mushroom-disabled-color);
        border-radius: 4px;
        overflow: hidden;
        margin: 8px 0;
      }

      .progress-fill {
        height: 100%;
        background: var(--mushroom-primary-color);
        border-radius: 4px;
        transition: width 0.5s ease-in-out;
      }

      .minimal-view {
        opacity: 0.7;
      }
    `;
  }

  setConfig(config) {
    if (!config.entity && !config.device) {
      throw new Error("Entity or Device is required");
    }
    this.config = config;
  }

  getCardSize() {
    return 5;
  }

  _getPrinterState() {
    if (!this.hass || !this.config) return null;
    
    const deviceEntities = this._getDeviceEntities();
    if (!deviceEntities) return null;

    const printerEntity = deviceEntities.find(
      (e) => e.entity_id.startsWith("sensor.") && (e.attributes.device_class === "timestamp" || e.entity_id.includes("printer"))
    );
    
    if (printerEntity) {
      const state = this.hass.states[printerEntity.entity_id];
      return state ? state.state : "unavailable";
    }

    return "unavailable";
  }

  _getDeviceEntities() {
    if (!this.hass || !this.config) return null;
    
    if (this.config.device) {
      const deviceId = this.config.device;
      const device = this.hass.devices[deviceId];
      if (device) {
        return Object.values(this.hass.states).filter(
          (state) => state.attributes && state.attributes.device_id === deviceId
        );
      }
    }

    if (this.config.entity) {
      const entityState = this.hass.states[this.config.entity];
      if (entityState && entityState.attributes && entityState.attributes.device_id) {
        const deviceId = entityState.attributes.device_id;
        return Object.values(this.hass.states).filter(
          (state) => state.attributes && state.attributes.device_id === deviceId
        );
      }
    }

    return null;
  }

  _getEntityBySuffix(suffixes) {
    const entities = this._getDeviceEntities();
    if (!entities) return null;

    for (const suffix of suffixes) {
      const entity = entities.find((e) => 
        e.entity_id.toLowerCase().includes(suffix.toLowerCase())
      );
      if (entity) return entity.entity_id;
    }
    return null;
  }

  _getEntityState(entityId) {
    if (!this.hass || !entityId) return null;
    return this.hass.states[entityId];
  }

  _renderHeader(status) {
    const name = this.config.name || "Prusa Printer";
    const icon = this.config.icon || "mdi:printer-3d";
    
    const isUnavailable = status === "unavailable" || status === "unknown";
    const isPrinting = status === "printing";
    
    const iconClass = isUnavailable ? "" : isPrinting ? "printing" : "active";
    const statusText = isUnavailable ? "Ausgeschaltet" : status || "Unbekannt";

    return html`
      <div class="header">
        <div class="header-left">
          <div class="icon-container ${iconClass}">
            <ha-icon icon="${icon}"></ha-icon>
          </div>
          <div class="header-info">
            <div class="name">${name}</div>
            <div class="status">${statusText}</div>
          </div>
        </div>
        <div class="header-actions">
          ${this._renderActionButtons(status)}
        </div>
      </div>
    `;
  }

  _renderActionButtons(status) {
    const buttons = [];
    
    if (this.config.power_switch) {
      const isUnavailable = status === "unavailable" || status === "unknown";
      const powerIcon = isUnavailable ? "mdi:power-on" : "mdi:power-off";
      const powerAction = isUnavailable ? "turn_on" : "turn_off";
      
      buttons.push(html`
        <button 
          class="action-button"
          @click="${() => this._togglePower(powerAction)}"
          title="${isUnavailable ? 'Einschalten' : 'Ausschalten'}"
        >
          <ha-icon icon="${powerIcon}"></ha-icon>
        </button>
      `);
    }

    if (status === "printing") {
      buttons.push(html`
        <button 
          class="action-button"
          @click="${() => this._pausePrint()}"
          title="Druck pausieren"
        >
          <ha-icon icon="mdi:pause"></ha-icon>
        </button>
      `);
    }

    return buttons;
  }

  _renderCamera() {
    const cameraEntity = this.config.camera || this._getEntityBySuffix(["camera", "cam"]) || this.config.camera_entity;
    
    if (!cameraEntity) {
      return html`
        <div class="camera-container">
          <div class="camera-unavailable">
            <ha-icon icon="mdi:camera-off"></ha-icon>
            <span>Keine Kamera konfiguriert</span>
          </div>
        </div>
      `;
    }

    const cameraState = this._getEntityState(cameraEntity);
    if (!cameraState || cameraState.state === "unavailable") {
      return html`
        <div class="camera-container">
          <div class="camera-unavailable">
            <ha-icon icon="mdi:camera-off"></ha-icon>
            <span>Kamera nicht verfügbar</span>
          </div>
        </div>
      `;
    }

    const imageUrl = cameraState.attributes.entity_picture 
      ? `/api/camera_proxy/${cameraEntity}?time=${Date.now()}`
      : cameraState.attributes.stream_source || cameraState.attributes.entity_picture;

    return html`
      <div class="camera-container">
        <img src="${imageUrl}" alt="Printer Camera" />
      </div>
    `;
  }

  _renderSensorItem(entityId, icon, label) {
    if (!entityId) return html``;
    
    const state = this._getEntityState(entityId);
    if (!state) return html``;

    const value = state.attributes.unit_of_measurement 
      ? `${state.state} ${state.attributes.unit_of_measurement}`
      : state.state;

    return html`
      <div class="sensor-item">
        <ha-icon icon="${icon}"></ha-icon>
        <div>
          <div class="sensor-value">${value}</div>
          <div class="sensor-label">${label}</div>
        </div>
      </div>
    `;
  }

  _renderIdleSensors() {
    const bedTempEntity = this.config.bed_temp_sensor || this._getEntityBySuffix(["bed_temperature", "bed_temp", "bedtemp", "heater_bed"]);
    const nozzleTempEntity = this.config.nozzle_temp_sensor || this._getEntityBySuffix(["tool_temperature", "tool0_temperature", "nozzle_temp", "nozzletemp", "heater_tool"]);

    return html`
      <div class="sensors-container">
        <div class="sensor-row">
          ${this._renderSensorItem(bedTempEntity, "mdi:heatmap", "Druckbett")}
          ${this._renderSensorItem(nozzleTempEntity, "mdi:printer-3d-nozzle", "Nozzle")}
        </div>
      </div>
    `;
  }

  _renderPrintingSensors() {
    const progressEntity = this.config.progress_sensor || this._getEntityBySuffix(["progress", "print_progress", "print_progression"]);
    const timeRemainingEntity = this.config.time_remaining_sensor || this._getEntityBySuffix(["time_remaining", "remaining_time", "print_time_left"]);
    const timeElapsedEntity = this.config.time_elapsed_sensor || this._getEntityBySuffix(["time_elapsed", "elapsed_time", "print_time"]);
    const currentLayerEntity = this.config.current_layer_sensor || this._getEntityBySuffix(["current_layer", "layer", "layer_current"]);
    const totalLayersEntity = this.config.total_layers_sensor || this._getEntityBySuffix(["total_layers", "layers", "layer_total"]);
    const bedTempEntity = this.config.bed_temp_sensor || this._getEntityBySuffix(["bed_temperature", "bed_temp", "bedtemp", "heater_bed"]);
    const nozzleTempEntity = this.config.nozzle_temp_sensor || this._getEntityBySuffix(["tool_temperature", "tool0_temperature", "nozzle_temp", "nozzletemp", "heater_tool"]);
    const fanSpeedEntity = this.config.fan_speed_sensor || this._getEntityBySuffix(["fan_speed", "fan", "fan_percent"]);

    const progress = progressEntity ? this._getEntityState(progressEntity) : null;
    const progressValue = progress ? parseFloat(progress.state) || 0 : 0;

    return html`
      <div class="sensors-container">
        ${progress ? html`
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progressValue}%"></div>
          </div>
        ` : ''}
        <div class="sensor-row">
          ${this._renderSensorItem(timeElapsedEntity, "mdi:clock-start", "Laufzeit")}
          ${this._renderSensorItem(bedTempEntity, "mdi:heatmap", "Druckbett")}
        </div>
        <div class="sensor-row">
          ${this._renderSensorItem(progressEntity, "mdi:percent", "Fortschritt")}
          ${this._renderSensorItem(nozzleTempEntity, "mdi:printer-3d-nozzle", "Nozzle")}
        </div>
        <div class="sensor-row">
          ${this._renderSensorItem(timeRemainingEntity, "mdi:clock-end", "Restlaufzeit")}
          ${this._renderSensorItem(fanSpeedEntity, "mdi:fan", "Lüfter")}
        </div>
        <div class="sensor-row">
          ${this._renderSensorItem(currentLayerEntity, "mdi:layers", "Layer")}
        </div>
      </div>
    `;
  }

  _renderPrintPreview() {
    if (this.config.show_preview !== true) return html``;
    
    return html`
      <div class="print-preview">
        <ha-icon icon="mdi:cube-outline" style="--mdc-icon-size: 48px; color: var(--mushroom-card-secondary-color);"></ha-icon>
      </div>
    `;
  }

  _renderContent(status) {
    if (status === "unavailable" || status === "unknown") {
      return html``;
    }

    if (status === "printing" || status === "finished" || status === "stopped") {
      return html`
        ${this._renderCamera()}
        <div class="content-grid two-columns">
          ${this._renderPrintPreview()}
          ${this._renderPrintingSensors()}
        </div>
      `;
    }

    return html`
      ${this._renderCamera()}
      ${this._renderIdleSensors()}
    `;
  }

  _togglePower(action) {
    if (!this.config.power_switch) return;
    
    this.hass.callService("switch", action, {
      entity_id: this.config.power_switch,
    });
  }

  _pausePrint() {
    const pauseEntity = this._getEntityBySuffix(["pause", "print_pause"]);
    if (pauseEntity) {
      this.hass.callService("button", "press", {
        entity_id: pauseEntity,
      });
    }
  }

  render() {
    if (!this.hass || !this.config) {
      return html``;
    }

    const status = this._getPrinterState();
    const isUnavailable = status === "unavailable" || status === "unknown";

    return html`
      <div class="card ${isUnavailable ? 'minimal-view' : ''}">
        ${this._renderHeader(status)}
        ${this._renderContent(status)}
      </div>
    `;
  }

  static getConfigElement() {
    return document.createElement("prusa-card-editor");
  }

  static getStubConfig() {
    return {
      name: "Prusa Printer",
      icon: "mdi:printer-3d",
      show_preview: true,
    };
  }
}

customElements.define("prusa-card", PrusaCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "prusa-card",
  name: "Prusa 3D Printer Card",
  description: "Eine Custom Card für Prusa 3D-Drucker mit Mushroom Design",
});

console.info("%c PRUSA-CARD %c v1.0.0 ", "background: #41bdf5; color: white; font-weight: 700;", "background: #00d2d5; color: white; font-weight: 700;");

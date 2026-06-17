// ============================================================================
// CONFIGURA AQUÍ la URL del Web App de Google Apps Script.
// Sigue las instrucciones de apps_script.gs para obtenerla.
// ============================================================================
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbyP5GLoY_9Fykr6vW2otOOmtCtbf8Wns70w0o7o2pS_TIiNt0d9dov282dJmaYmBCHB/exec";
// ============================================================================

const form = document.getElementById("lead-form");
const provinciaSel = document.getElementById("provincia");
const municipioSel = document.getElementById("municipio");
const submitBtn = document.getElementById("submit-btn");
const btnLabel = submitBtn.querySelector(".btn-label");
const btnLoader = submitBtn.querySelector(".btn-loader");
const successBox = document.getElementById("success");
const errorBox = document.getElementById("error");
const errorMsg = document.getElementById("error-msg");
const newBtn = document.getElementById("new-btn");
const retryBtn = document.getElementById("retry-btn");
const historyList = document.getElementById("history-list");
const historyEmpty = document.getElementById("history-empty");
const historyCount = document.getElementById("history-count");
const historyClear = document.getElementById("history-clear");

const HISTORY_KEY = "agaleus.comercial.history";
const HISTORY_MAX = 30;

// Rellena el desplegable de municipios al cambiar provincia
provinciaSel.addEventListener("change", () => {
  const prov = provinciaSel.value;
  const lista = MUNICIPIOS[prov] || [];
  municipioSel.innerHTML =
    '<option value="" disabled selected>Elige municipio…</option>' +
    lista.map(m => `<option value="${m}">${m}</option>`).join("");
  municipioSel.disabled = lista.length === 0;
});

function setLoading(loading) {
  submitBtn.disabled = loading;
  btnLoader.hidden = !loading;
  btnLabel.textContent = loading ? "Enviando…" : "Enviar cliente";
}

function showSuccess() {
  form.hidden = true;
  errorBox.hidden = true;
  successBox.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showError(msg) {
  errorBox.hidden = false;
  successBox.hidden = true;
  errorMsg.textContent = msg || "Revisa la conexión e inténtalo de nuevo.";
}

function resetForm() {
  form.reset();
  municipioSel.innerHTML =
    '<option value="" disabled selected>Elige primero la provincia</option>';
  municipioSel.disabled = true;
  successBox.hidden = true;
  errorBox.hidden = true;
  form.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

newBtn.addEventListener("click", resetForm);
retryBtn.addEventListener("click", () => {
  errorBox.hidden = true;
});

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(items) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, HISTORY_MAX)));
  } catch {}
}

// Trae las últimas N filas desde la Google Sheet (vía Apps Script).
// El cache local (localStorage) sigue mostrándose mientras esto resuelve,
// así no hay pantalla en blanco si la red tarda.
async function fetchHistoryFromServer() {
  if (!WEBAPP_URL || WEBAPP_URL.startsWith("PEGA_AQUI")) return;
  try {
    const res = await fetch(WEBAPP_URL + "?action=history&n=" + HISTORY_MAX, { method: "GET" });
    if (!res.ok) return;
    const json = await res.json();
    if (!json.ok || !Array.isArray(json.items)) return;
    const mapped = json.items.map(row => ({
      timestamp: row["Fecha"],
      empresa:   row["Empresa"],
      provincia: row["Provincia"],
      municipio: row["Municipio"],
      cantidad:  row["Cantidad"],
      unidad:    row["Unidad"],
      urgencia:  row["Urgencia"] || "Normal",
    })).filter(it => it.empresa);
    saveHistory(mapped);
    renderHistory();
  } catch {
    // Sin conexión: nos quedamos con el cache local. No es un error visible.
  }
}

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function formatWhen(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return "Hoy " + time;
  const date = d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });
  return date + " " + time;
}

function renderHistory() {
  const items = loadHistory();
  historyCount.textContent = "(" + items.length + ")";
  historyClear.hidden = items.length === 0;
  historyEmpty.hidden = items.length > 0;
  historyList.innerHTML = items.map(it => {
    const urgClass = it.urgencia === "Desbordado" ? "urg-high"
                   : it.urgencia === "Urgente" ? "urg-mid"
                   : "urg-low";
    const ubic = [it.municipio, it.provincia].filter(Boolean).join(", ");
    const cant = [it.cantidad, it.unidad].filter(Boolean).join(" ");
    return `
      <li class="history-item ${urgClass}">
        <div class="history-main">
          <div class="history-empresa">${escapeHtml(it.empresa)}</div>
          <div class="history-meta">${escapeHtml(ubic)}${cant ? " · " + escapeHtml(cant) : ""}</div>
        </div>
        <div class="history-side">
          <span class="urg-badge">${escapeHtml(it.urgencia || "Normal")}</span>
          <span class="history-when">${escapeHtml(formatWhen(it.timestamp))}</span>
        </div>
      </li>`;
  }).join("");
}

function pushToHistory(data) {
  const items = loadHistory();
  items.unshift({
    timestamp: data.timestamp,
    empresa:   data.empresa,
    provincia: data.provincia,
    municipio: data.municipio,
    cantidad:  data.cantidad,
    unidad:    data.unidad,
    urgencia:  data.urgencia || "Normal",
  });
  saveHistory(items);
  renderHistory();
}

historyClear.addEventListener("click", () => {
  if (!confirm("¿Vaciar el historial local? Los datos guardados en la Sheet y el Excel no se ven afectados.")) return;
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
});

renderHistory();
fetchHistoryFromServer();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.hidden = true;

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = {
    timestamp: new Date().toISOString(),
    provincia: provinciaSel.value,
    municipio: municipioSel.value,
    empresa: document.getElementById("empresa").value.trim(),
    contacto: document.getElementById("contacto").value.trim(),
    cantidad: document.getElementById("cantidad").value,
    unidad: document.getElementById("unidad").value,
    residuo: "Aceite usado",
    frecuencia: document.getElementById("frecuencia").value,
    urgencia: document.getElementById("urgencia").value,
    telefono: document.getElementById("telefono").value.trim(),
    email: document.getElementById("email").value.trim(),
    notas: document.getElementById("notas").value.trim()
  };

  if (!WEBAPP_URL || WEBAPP_URL.startsWith("PEGA_AQUI")) {
    showError("La app aún no está configurada. Configura WEBAPP_URL en app.js.");
    return;
  }

  setLoading(true);
  try {
    // text/plain evita el preflight CORS contra Apps Script
    const res = await fetch(WEBAPP_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const json = await res.json().catch(() => ({ ok: true }));
    if (json.ok === false) throw new Error(json.error || "Error del servidor");
    pushToHistory(data);
    showSuccess();
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
});

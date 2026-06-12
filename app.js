// ============================================================================
// CONFIGURA AQUÍ la URL del Web App de Google Apps Script.
// Sigue las instrucciones de apps_script.gs para obtenerla.
// ============================================================================
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbzet-yUnfR6CK1Ev3pMuGJvji7WE7sk44_mfrUdmtO_ffIZ__KsfkqU8bCndgh_jSLp/exec";
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
    showSuccess();
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
});

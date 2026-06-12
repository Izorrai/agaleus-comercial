/**
 * ============================================================================
 * AGALEUS - Receptor de leads del comercial -> Google Sheets
 * ============================================================================
 *
 * INSTRUCCIONES DE INSTALACIÓN (5 minutos, se hace UNA SOLA VEZ)
 *
 *  1. Abre https://sheets.google.com y crea una hoja nueva.
 *     Llámala por ejemplo "Clientes Comercial - Agaleus".
 *
 *  2. En esa hoja, menú: Extensiones -> Apps Script.
 *     Se abrirá el editor de Apps Script.
 *
 *  3. Borra el contenido de "Code.gs" y pega TODO este archivo dentro.
 *
 *  4. Guarda (icono de disquete o Ctrl+S). Ponle nombre al proyecto:
 *     "Agaleus Comercial".
 *
 *  5. Pulsa el botón azul "Implementar" (arriba a la derecha) ->
 *     "Nueva implementación".
 *       - Tipo: "Aplicación web" (clic en el engranaje si no aparece).
 *       - Descripción: "Recepción leads comercial v1".
 *       - Ejecutar como: "Yo (tu_cuenta@gmail.com)".
 *       - Quién tiene acceso: "Cualquier usuario".  <-- IMPORTANTE
 *     Pulsa "Implementar". Google te pedirá permisos: acéptalos.
 *
 *  6. Al terminar te dará una URL larga tipo:
 *       https://script.google.com/macros/s/AKfycb..../exec
 *     COPIA esa URL.
 *
 *  7. Abre el archivo app.js de la app y pega esa URL en la variable
 *     WEBAPP_URL (arriba del todo del archivo).
 *
 *  8. Sube la carpeta /comercial a GitHub Pages. Listo.
 *
 * Para ver los datos: abre la Google Sheet. Cada envío del comercial
 * aparecerá como una fila nueva en tiempo real. Para exportar a Excel:
 *   Archivo -> Descargar -> Microsoft Excel (.xlsx).
 *
 * Si añades campos al formulario, añádelos también en HEADERS y en
 * el array de fila dentro de doPost().
 *
 * ----------------------------------------------------------------------------
 * EMAIL DE NOTIFICACIÓN VIA MICROSOFT GRAPH
 * ----------------------------------------------------------------------------
 * El script avisa a NOTIFICATION_EMAIL por cada lead nuevo. El email NO se
 * envía desde tu cuenta personal de Google: se manda vía Microsoft Graph
 * desde el buzón corporativo MAIL_FROM (típicamente el mismo valorizacion@).
 *
 * Para activarlo, configura 4 Script Properties (Project Settings ->
 * Script properties -> Add script property). Sin estas propiedades, el
 * envío de email se desactiva silenciosamente y el lead se sigue guardando:
 *
 *    MS_TENANT_ID      = <Directory (tenant) ID de Azure AD>
 *    MS_CLIENT_ID      = <Application (client) ID>
 *    MS_CLIENT_SECRET  = <Client secret value>
 *    MAIL_FROM         = valorizacion@agaleus.com  (buzón remitente)
 *
 * La app registration de Azure AD necesita "Mail.Send" (Application) con
 * admin consent. Las herramientas firma_* de Agaleus ya lo tienen
 * consentido en la misma app, así que reusamos esas credenciales.
 *
 * ============================================================================
 */

const SHEET_NAME = "Leads";
const HEADERS = [
  "Fecha", "Provincia", "Municipio", "Empresa", "Contacto",
  "Cantidad", "Unidad", "Residuo", "Frecuencia",
  "Teléfono", "Email", "Notas"
];

// Dirección que recibirá un aviso por cada lead nuevo. Cadena vacía = desactivado.
const NOTIFICATION_EMAIL = "valorizacion@agaleus.com";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet_();
    const fecha = new Date(data.timestamp || Date.now());

    sheet.appendRow([
      fecha,
      data.provincia || "",
      data.municipio || "",
      data.empresa || "",
      data.contacto || "",
      data.cantidad || "",
      data.unidad || "",
      data.residuo || "Aceite usado",
      data.frecuencia || "",
      data.telefono || "",
      data.email || "",
      data.notas || ""
    ]);

    sendNotification_(data, fecha);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  // Sirve para comprobar desde el navegador que el endpoint está vivo.
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: "Agaleus Comercial" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function sendNotification_(data, fecha) {
  if (!NOTIFICATION_EMAIL) return;
  try {
    const props  = PropertiesService.getScriptProperties();
    const tenant = props.getProperty("MS_TENANT_ID");
    const client = props.getProperty("MS_CLIENT_ID");
    const secret = props.getProperty("MS_CLIENT_SECRET");
    const from   = props.getProperty("MAIL_FROM") || NOTIFICATION_EMAIL;
    if (!tenant || !client || !secret) {
      console.warn("Faltan Script Properties MS_TENANT_ID / MS_CLIENT_ID / MS_CLIENT_SECRET. Aviso desactivado.");
      return;
    }

    const fechaTxt = Utilities.formatDate(
      fecha, Session.getScriptTimeZone() || "Europe/Madrid",
      "dd/MM/yyyy HH:mm");
    const empresa  = data.empresa  || "(sin nombre)";
    const municipio = [data.municipio, data.provincia].filter(Boolean).join(", ");
    const cantidad = [data.cantidad, data.unidad].filter(Boolean).join(" ");

    const filas = [
      ["Empresa",     empresa],
      ["Contacto",    data.contacto  || ""],
      ["Ubicación",   municipio],
      ["Residuo",     data.residuo   || "Aceite usado"],
      ["Cantidad",    cantidad],
      ["Frecuencia",  data.frecuencia|| ""],
      ["Teléfono",    data.telefono  || ""],
      ["Email",       data.email     || ""],
      ["Notas",       data.notas     || ""],
      ["Recibido",    fechaTxt],
    ];

    const htmlRows = filas.map(([k, v]) =>
      `<tr><td style="padding:6px 12px;background:#f4f6f9;font-weight:600;color:#0a2e4a;border-bottom:1px solid #e1e4e8;">${k}</td>` +
      `<td style="padding:6px 12px;color:#1a1a1a;border-bottom:1px solid #e1e4e8;">${escapeHtml_(v)}</td></tr>`
    ).join("");

    const html =
      `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1a1a1a;">
         <h2 style="color:#0a2e4a;margin:0 0 12px;">Nuevo lead comercial</h2>
         <p style="margin:0 0 16px;color:#6b7280;">Registrado desde la app móvil del comercial.</p>
         <table style="border-collapse:collapse;border:1px solid #e1e4e8;border-radius:8px;overflow:hidden;">
           ${htmlRows}
         </table>
         <p style="margin:20px 0 0;font-size:12px;color:#6b7280;">Ver todos los leads en la Google Sheet enlazada al script.</p>
       </div>`;

    const token = graphToken_(tenant, client, secret);
    const message = {
      message: {
        subject: "Nuevo lead comercial - " + empresa,
        body: { contentType: "HTML", content: html },
        toRecipients: [{ emailAddress: { address: NOTIFICATION_EMAIL } }],
      },
      saveToSentItems: false,
    };
    if (data.email && data.email.indexOf("@") > 0) {
      message.message.replyTo = [{ emailAddress: { address: data.email } }];
    }

    const res = UrlFetchApp.fetch(
      "https://graph.microsoft.com/v1.0/users/" + encodeURIComponent(from) + "/sendMail",
      {
        method: "post",
        contentType: "application/json",
        headers: { Authorization: "Bearer " + token },
        payload: JSON.stringify(message),
        muteHttpExceptions: true,
      }
    );
    const code = res.getResponseCode();
    if (code !== 200 && code !== 202) {
      console.error("Graph sendMail HTTP " + code + ": " + res.getContentText().slice(0, 400));
    }
  } catch (err) {
    console.error("No se pudo enviar el aviso por email:", err);
  }
}

function graphToken_(tenant, client, secret) {
  const res = UrlFetchApp.fetch(
    "https://login.microsoftonline.com/" + tenant + "/oauth2/v2.0/token",
    {
      method: "post",
      payload: {
        grant_type:    "client_credentials",
        client_id:     client,
        client_secret: secret,
        scope:         "https://graph.microsoft.com/.default",
      },
      muteHttpExceptions: true,
    }
  );
  const data = JSON.parse(res.getContentText());
  if (!data.access_token) {
    throw new Error("Graph token error: " + res.getContentText().slice(0, 400));
  }
  return data.access_token;
}

function escapeHtml_(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight("bold")
      .setBackground("#0a2e4a")
      .setFontColor("#ffffff");
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, HEADERS.length);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

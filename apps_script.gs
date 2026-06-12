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
 * ============================================================================
 */

const SHEET_NAME = "Leads";
const HEADERS = [
  "Fecha", "Provincia", "Municipio", "Empresa", "Contacto",
  "Cantidad", "Unidad", "Residuo",
  "Teléfono", "Email", "Notas"
];

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
      data.telefono || "",
      data.email || "",
      data.notas || ""
    ]);

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

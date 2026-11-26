# Quitar la etiqueta [AXA] del nombre de los documentos en el portal

## 0. Plan o prompt inicial

Sale del plan de la API `honeSolutionsApi/.plans/context/axa-modelo-atencion-optional-expired-notifications/plan-axa-modelo-atencion-optional-expired-notifications.md` (fase 3, sección 2.2). En este repo no hay plan: es un cambio pequeño.

## 1. Qué se pidió, qué se hizo y por qué

Axa Colpatria tiene un documento nuevo, solo suyo: `Modelo de Atencion [AXA]`. La etiqueta `[AXA]` existe para que el sistema lo distinga del "Modelo de atencion" que ya usan Bolívar y Hone. El prestador no debe verla.

El portal ya quitaba las etiquetas `[SURA]` y `[COLSANITAS]` del final del nombre. Se agregó `[AXA]` a esa misma lista. Ahora el prestador ve `Modelo de Atencion`.

## 2. Archivos creados, editados, movidos o eliminados

- Editado: `src/app/services/documents/documents.service.ts`. Se agregó `AXA` a `clientSuffixRegex`.
- Creado: este reporte.

## 3. Funciones, rutas, validaciones o componentes relevantes

- `DocumentService.formatDocumentName` (la usa el pipe `formatNameDoc`) quita la etiqueta del cliente al final del nombre.
- Antes: `/\s*\[(?:SURA|COLSANITAS)\]$/`
- Ahora: `/\s*\[(?:SURA|COLSANITAS|AXA)\]$/`
- Solo se quita si la etiqueta está **al final** del nombre. Ningún otro documento tiene `[AXA]` hoy.

## 4. Pruebas, comandos o verificaciones

- Prueba rápida con Node de la expresión:
  - `Modelo de Atencion [AXA]` → `Modelo de Atencion`;
  - `RUT [SURA]` → `RUT`;
  - `Certificacion bancaria [COLSANITAS]` → `Certificacion bancaria`;
  - `Rut` → `Rut`;
  - `Doc [AXA] extra` no cambia (la etiqueta no está al final).
- `npx tsc -p tsconfig.app.json --noEmit` sin errores.
- No se probó en el navegador.

## 5. Pendientes, limitaciones, riesgos

- Se debe desplegar **junto con** los seeders de la API (`20261125191020_AxaColpatria_ModeloDeAtencion.js` y `20261125191021_DocumentReplicationRules_ModeloDeAtencionAxaBolivar.js`). Si sale después, el prestador verá `[AXA]` mientras tanto.
- El admin (`hone-solutions`) muestra el nombre con la etiqueta, igual que hoy con `[SURA]` y `[COLSANITAS]`.
- Rama: `feature/axa-client-suffix`, creada desde `release`. Sin commit ni push.

## 6. Técnico

- La lista de etiquetas también existe en la API (`honeSolutionsApi/src/app/Helper/Helper/TextFormat.ts`, `CLIENT_DOCUMENT_NAME_TAGS`), que se usa para correos, descargas y reportes. Las dos listas deben mantenerse iguales cuando entre otro cliente con etiqueta.
- El override por `idDocumentType` (`documentNameOverrides`) se aplica antes de quitar la etiqueta. No cambió.

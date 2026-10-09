# Ajustes de .agents y sufijo [COLSANITAS] en nombres de documentos

## 0. Prompt inicial
1. Adaptar `.agents/claude/launch.json` y `.agents/rules/metodos-comentarios-claros.mdc` (copiados de otro proyecto) a este (Angular 17).
2. Ejecutar `.agents/link-agents-windows.sh`.
3. Releer `CLAUDE.md`.
4. Ubicar dónde se quita el sufijo "[SURA]" de los nombres de documentos y agregar "[COLSANITAS]".

## 1. Explicación sencilla
- El archivo de arranque del servidor apuntaba a otro proyecto (Vue, puerto 5173). Ahora arranca este (`npm start`, puerto 4200).
- La regla de comentarios hablaba de Vue y de archivos que aquí no existen. Se reescribió para Angular (servicios, pipes, componentes).
- Se corrió el script que enlaza `rules` y `skills` en `.claude`, `.cursor`, `.codex` y `.ai`.
- Los nombres de documentos llegan del backend con un sufijo de cliente (`[SURA]`). La app lo oculta en un solo lugar; ahora también oculta `[COLSANITAS]`.

## 2. Archivos
- `.agents/claude/launch.json`: config `hone-front-dev` (`npm start`, puerto 4200).
- `.agents/rules/metodos-comentarios-claros.mdc`: reescrito para Angular 17, mismo criterio (solo comentar lo no obvio).
- `src/app/services/documents/documents.service.ts`: nueva constante `clientSuffixRegex` usada en `formatDocumentName`.
- Creados por el script: junctions `.claude/`, `.cursor/`, `.codex/`, `.ai/` (`rules` y `skills`).

## 3. Comportamiento
`formatDocumentName` ahora quita `[SURA]` o `[COLSANITAS]` al final del nombre. Es el único sitio que lo hace: `FormatNameDocPipe` delega en él y `documents.component.ts` lo llama directamente (línea ~496). Los comentarios `[SURA]` en `documents.component.ts:107-109` son solo anotaciones, y `'ARL SURA'` en el modal de edición es un valor de lista, no relacionado. Para un cliente futuro basta agregarlo a la alternancia del regex.

## 4. Verificaciones
- `bash .agents/link-agents-windows.sh`: 8 junctions creadas correctamente.
- `npx tsc --noEmit -p tsconfig.app.json`: sin errores.
- No se ejecutó `npm run build` completo ni pruebas visuales; no se agregaron tests (cambio de un regex).

## 5. Pendientes y riesgos
Ninguno. Si los nombres de Colsanitas llegan con otro formato (p. ej. `[Colsanitas]` en minúsculas o sufijo en medio), habría que ajustar el regex; se asumió el formato igual a SURA, al final del nombre y en mayúsculas.

## 6. Notas técnicas para la IA
- Regex: `/\s*\[(?:SURA|COLSANITAS)\]$/`, sensible a mayúsculas, anclado al final, como el original.
- `launch.json` usa `autoPort: true`, así que el puerto efectivo puede cambiar si 4200 está ocupado.
- `.gitignore` ya estaba modificado antes de esta tarea; no se tocó.

## Adenda: servicios de Colsanitas (cliente 15)
- Pedido: habilitar documentos y contratos para el cliente 15.
- `src/app/config/client-services.config.ts`: se extrajo `documentationAndContractsRules` (documentación siempre; contratos si `client.withContract`) y se usa para Axa (8) y Colsanitas (15).
- `clientServicesRules` es el único sitio que decide el acceso: lo leen `service-access.guard.ts` y `service-navigation.component.ts`. Las rutas y `SERVICES_CONFIG` ya incluyen `contracts`.
- Verificación: `tsc --noEmit -p tsconfig.app.json` sin errores. No se probó en el navegador (requiere login y backend).
- Supuesto: el backend devuelve `withContract: true` para Colsanitas; sin eso la pestaña Contratos no aparece.

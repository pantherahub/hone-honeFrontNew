# modal-edit-document consume las reglas del API

## 0. Plan / prompt
Plan: `C:\Users\FELIPE\.claude\plans\sparkling-spinning-meadow.md` (parte B de `arma-el-plan-por-fizzy-giraffe.md`). Guía: front admin `hone-hone-solutions` (`document-rules.service.ts`, `uploadsedit`).

## 1. Qué se pidió y qué se hizo
Las listas del formulario de documentos (software, ARL/EPS, aseguradoras, riesgo, SMLV, tabla de pólizas, ciudades principales) estaban copiadas en el componente. Ahora vienen del API (`GET Documents/Rules/PROVIDER`). Si no llegan, se muestra un error con botón "Reintentar" y el formulario no existe, así que no se puede guardar.

## 2. Archivos
- Creado `src/app/interfaces/document-rules.interface.ts`: solo tipos del contrato (`DocumentRules`, `PolicyProviderTypeRule`, `DocumentRulesOrigin`), según la convención de `interfaces/`.
- Creado `src/app/services/documents/document-rules.service.ts`: `getRules(origin)` con caché por sesión (no cachea si falla).
- Editado `modal-edit-document.component.ts`: quitadas las listas fijas; `loadRules()`, `applyRules()`; el formulario se crea solo con reglas.
- Editado `modal-edit-document.component.html`: envuelve el formulario en cargando / error con reintento / formulario.

## 3. Comportamiento
- Se conservan los nombres de campos que usa la plantilla; `typePolicyProviderConfig` se arma como mapa por `name` desde `byProviderType`.
- Riesgo: `riskLevels.byDocumentType[idDocumentType] || default`. Con PROVIDER no llega el '9'; se conserva `riskClassifier: item.withRiskClassifier && item.riskClassifier !== '9'`.
- Sin reglas: alerta "No pudimos cargar las opciones del formulario", botones Cerrar/Reintentar.

## 4. Verificación
- `npx tsc --noEmit -p tsconfig.app.json`: sin errores.
- `ng build --configuration development`: OK.
- `curl localhost:7000/api/Documents/Rules/PROVIDER`: responde el JSON esperado.
- No se probó manualmente en navegador el modal ni el caso de error.

## 5. Pendientes
- Lissom v2 sigue con sus listas propias (`hone-lissom-v2/src/modules/providers/lib/document-options.config.ts`); no se tocó y puede divergir.
- Probar manualmente el modal (nuevo/edición, póliza) y el caso API caído.

## 6. Técnico
- `DocumentRulesService` usa `environment.url` (en este repo ya incluye `/api/`), `shareReplay(1)` + `tap({error})` para borrar caché.
- `applyRules` corre antes de `getTypePolicyProviderOpts` y `createForm` (validators y `patchForm` dependen de las listas).
- `@ViewChild('dateInput')` ya no tenía uso en la plantilla; sin cambios.

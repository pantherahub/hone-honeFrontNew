# Alert de "Formatos e instructivos" en documentación

## 0. Origen
Prompt directo del usuario (sin archivo de plan en `.plans/context/`). Plan aprobado: `C:\Users\FELIPE\.claude\plans\mira-en-http-localhost-8083-service-docu-humming-swing.md`.

## 1. Qué se pidió, qué se hizo y por qué (explicado simple)
Mucha gente se salta el globito (popover) del botón "Descargar documentos", donde están los formatos e instructivos. Ahora, encima de la tabla de documentos hay un aviso (alert) que lo recuerda y trae un botón "Ver botón" que vuelve a abrir ese globito.

- El aviso solo aparece si el botón "Descargar documentos" existe (y ya terminó de cargar la pantalla).
- Si hay documentos pendientes, por renovar o por vencer (cuando el globito se abre solo): aviso azul resaltado y **no se puede cerrar**.
- Si todo está al día (el globito no se abre solo): aviso gris y **se puede cerrar**.

## 2. Archivos
- `src/app/modules/private/documents/documents.component.ts`: importa `AlertComponent`; nuevo getter `hasPendingDocsAction` (regla extraída de `showDataformAlert`, ahora compartida); nuevo `openFormatsBtnPopover()`.
- `src/app/modules/private/documents/documents.component.html`: `<app-alert>` justo encima de la tabla, con botón "Ver botón" en el slot `extra-content`.
- `src/app/shared/ui/feedback/alert/alert.component.html`: `flex-1` en la columna interna para que la "X" de cerrar quede en el borde derecho (antes quedaba pegada al texto).

## 3. Comportamiento relevante
- `hasPendingDocsAction` = `approvedPercentData?.upToDate !== 100 || hay docs por vencer`. Es la negación exacta de la condición que antes estaba inline en `showDataformAlert` (ahora usa `!hasPendingDocsAction` para el alert de cumplimiento exitoso vs. el popover).
- Visibilidad: `getCurrentDownloadConfig() && !loading`.
- Variante: `info` si pendiente, `dark` (gris) si no. `closable = !hasPendingDocsAction`.
- "Ver botón" solo pone `formatsBtnPopoverVisible = true`; no toca `formatsBtnPopoverShown`, así que no altera la lógica de "abrir una sola vez". El popover ya tiene `autoScrollOnOpen`.

## 4. Verificación
- `npm run build`: OK ("Application bundle generation complete").
- NO se verificó visualmente en el navegador (requiere sesión y backend). No se ejecutó `npm test`; no se agregaron tests (specs existentes son "should create").

## 5. Pendientes y riesgos
- Probar manualmente en `/service/documentation` con un cliente con config de descarga (p. ej. Colsanitas id 15): estado pendiente, estado al día, cliente sin config, móvil.
- Revisar `update-data` y `modal-edit-document`, que usan `app-alert`: por el `flex-1` la "X" pasa al borde derecho.
- Si el usuario cierra el alert gris, queda cerrado hasta recargar (estado interno de `app-alert`).
- Si falla la carga del porcentaje, se trata como pendiente (igual que el popover).
- Textos del alert ajustables en el HTML.

## 6. Notas técnicas para la IA
- El alert usa un getter evaluado en cada ciclo de detección (`docList.some` sobre pocos elementos; costo despreciable). Se eligió getter estable en vez de un flag seteado en `showFormatsBtnPopover()` para evitar parpadeo gris→azul mientras corren los modales iniciales (feedback/disclaimer) y porque el estado se actualiza solo tras `getDocumentPercent()`.
- Diferencia mínima vs. "el popover se lanzó": si el usuario tiene el alert de dataform pendiente, el popover no se lanza en esa visita pero el alert sale resaltado/no cerrable (el estado de documentos sigue pendiente).
- `app-alert` `info` usa `bg-blue1h-100 text-blue-700`; el botón ghost primary usa `text-main-blue1h`. Continuar desde: verificación visual y, si se desea, spec del getter.

---

## Actualización (segundo prompt)
- Se eliminó la versión gris/cerrable: el alert ahora solo se muestra con `getCurrentDownloadConfig() && !loading && hasPendingDocsAction`, siempre `variant="info"` y sin `closable`.
- Se quitó el `mt-1` del botón "Ver botón" y, para elegir estilo, el HTML tiene 3 alerts temporales (opción A link subrayado, B sólido con flecha, C blanco con ojo), marcados con un `TODO` en `documents.component.html`. Pendiente: que el usuario elija una y quitar las otras dos (y el TODO) en otro prompt.
- Se mantiene el `flex-1` en `alert.component.html` (X a la derecha).
- Verificación: `npm run build` OK; sin prueba visual en navegador.

## Actualización (tercer prompt)
- Se descartó la opción C. Se agregó la opción D: sin botón aparte; el texto «Descargar documentos» dentro del mensaje es un `<button>` nativo (negrita + subrayado) que llama a `openFormatsBtnPopover()`. Quedan A, B y D temporales en `documents.component.html` (con `TODO`). Se usó `<button>` nativo porque `app-button` es de bloque y no encaja inline en un párrafo.
- Verificación: `npm run build` OK; sin prueba visual.

## Actualización (cuarto prompt)
- Opciones A y B: el texto del botón pasó de "Ver botón" a "Ver dónde descargar".
- Nueva opción E: botón `soft` "Ver formatos" (con `!bg-blue1h-200` para que se distinga del fondo `blue1h-100` del alert), ubicado a la derecha en escritorio y debajo en móvil (`flex-col sm:flex-row`). Opciones temporales: A, B, D, E (con `TODO`).
- Verificación: `npm run build` OK; sin prueba visual.

## Actualización (quinto prompt)
- Se eliminaron las opciones B y E. Quedan A (link "Ver dónde descargar") y D (texto «Descargar documentos» clickeable), temporales, con `TODO` en `documents.component.html`. `npm run build` OK.

## Actualización (final de opciones)
- Se eligió la opción D y se eliminó la A (y el `TODO`). El alert final: `variant="info"`, sin `closable`, visible si `getCurrentDownloadConfig() && !loading && hasPendingDocsAction`; el texto «Descargar documentos» es un `<button>` nativo que llama a `openFormatsBtnPopover()`. Ya no hay opciones temporales. Las secciones 1-5 de arriba que mencionan el alert gris/cerrable o el botón "Ver botón" quedaron superadas por las actualizaciones. `npm run build` OK; sin prueba visual.

## Actualización (experimento: scroll antes de overflow-hidden) — PROVISIONAL
- Archivo: `src/app/shared/ui/overlays/popover/popover.component.ts` (componente compartido). Con `autoScrollOnOpen`, el bloqueo `overflow-hidden` del body ya no se aplica al abrir, sino cuando termina el scroll suave (evento `scrollend` o fallback de 1500 ms). Sin `autoScrollOnOpen` el comportamiento es el de antes. Se añadió el flag `bodyScrollLocked` con `lockBodyScroll()` / `unlockBodyScroll()` para no desbalancear el contador de `OverlayStateService` si se cierra antes de bloquear.
- Motivo: el usuario vio el popover quedarse fuera de vista con DevTools abierto; hipótesis: el body bloqueado corta el scroll suave. En pruebas con viewport 1000x450 no se reprodujo el congelamiento.
- Estado: a prueba por el usuario; decidir si se deja o se revierte (`git checkout src/app/shared/ui/overlays/popover/popover.component.ts`). `npm run build` OK.

## Actualización (ajuste del experimento del popover)
- El usuario confirmó que el cambio elimina el congelamiento con DevTools abierto, pero el popover se desplazaba (flecha oculta) al desaparecer la barra de scroll tras el bloqueo. Se añadió `requestAnimationFrame(() => this.popperInstance?.update())` en `lockBodyScroll()` de `popover.component.ts` para recalcular la posición. Decisión pendiente: confirmar con el usuario tras probar; el cambio queda como definitivo si funciona.

## Actualización (padding por la barra de scroll)
- El `update()` de Popper tras bloquear hacía que el popover se moviera dos veces. Se quitó y la causa se ataca en `src/app/services/overlay-state/overlay-state.service.ts`: al bloquear el body se calcula `window.innerWidth - document.documentElement.clientWidth` y se aplica como `padding-right` al `body` (se limpia al desbloquear). Así el contenido no se ensancha cuando desaparece la barra.
- Alcance: el servicio lo usan también `loader`, `modal` y `drawer`, por lo que ese salto lateral también se evita ahí. Riesgo: elementos `fixed` ancla a la derecha pueden desplazarse ~ancho de la barra. Pendiente: confirmación visual del usuario. `npm run build` OK.

## Actualización (scrollbar-gutter en lugar de padding)
- El `padding-right` del `body` NO bastaba: el popover (Popper, `inset: auto 0 0 auto`) se ancla al ancho del viewport, que cambiaba 1240→1225 px al volver la barra, y al cerrar se corría ~14 px a la izquierda (medido con un muestreador por frame).
- `overlay-state.service.ts` ahora pone `document.documentElement.style.scrollbarGutter = 'stable'` al bloquear (junto a `overflow-hidden`) y lo limpia al desbloquear. Se eliminó el `padding-right`.
- Verificado en el navegador integrado (viewport 1240x600, placement `left`): popover en x=577 al abrir (auto y desde el alert), durante el bloqueo y tras cerrar, sin saltos al bloquear/desbloquear. Nota: el popover tiene `transition` en transform, por lo que al abrir desde el alert hace un deslizamiento de ~300 ms desde otra posición (comportamiento previo del componente, no tocado).
- `npm run build` OK.

## Actualización (reversión del experimento del popover)
- Por decisión del usuario se REVIRTIÓ todo lo del popover: `src/app/shared/ui/overlays/popover/popover.component.ts` y `src/app/services/overlay-state/overlay-state.service.ts` volvieron al estado del último commit (se descartan el scroll antes del bloqueo, el flag `bodyScrollLocked` y `scrollbar-gutter`). Las secciones anteriores sobre ese experimento ya no aplican.
- Motivo: la solución evitaba el congelamiento con DevTools pero empeoraba lo visual (el popover se movía mientras se acomodaba y el scroll quedaba usable durante el scroll suave).
- Pendiente/abierto: el congelamiento con viewport pequeño sigue sin resolver (hipótesis: `overflow-hidden` en el body corta el `scrollIntoView` suave). Si se retoma, buscar un enfoque que no cambie el ancho del viewport (p. ej. scroll instantáneo en vez de `behavior: 'smooth'`). El alert de documentación se mantiene tal cual.

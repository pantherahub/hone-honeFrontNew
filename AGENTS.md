# AGENTS.md

Instrucciones para agentes que trabajen en este repositorio.

## Contexto del producto

Este proyecto es el portal de autogestion para prestadores de salud de Hone Solutions. Existe otro proyecto administrativo, pero este repositorio corresponde al lado donde ingresan los prestadores.

Los usuarios principales son prestadores de salud, como IPS o doctores persona natural. En el codigo normalmente se nombran como `providers`. Estos prestadores pueden estar vinculados con una o mas aseguradoras, que en el codigo y en la experiencia del portal se manejan como `clients` o clientes.

En el `home`, el prestador ve sus clientes/aseguradoras disponibles. Al seleccionar uno puede gestionar la documentacion, contratos u otros servicios habilitados para ese cliente. El portal tambien permite radicar tickets desde soporte y actualizar la informacion del prestador desde `update-data`.

Cuando agregues o modifiques funcionalidad, conserva este lenguaje de dominio:

- `provider`: prestador de salud.
- `client`: aseguradora/cliente asociada al prestador.
- `service`: servicio disponible para un cliente dentro de la ruta `/service`.
- `documentation`: gestion documental del prestador con un cliente.
- `contracts`: gestion de contratos del prestador con un cliente.
- `support`: tickets de soporte.
- `update-data`: actualizacion de informacion del prestador.

## Stack principal

- Angular 17.
- TypeScript 5.2.
- Tailwind CSS 3.4.
- Flowbite 3.1 como referencia visual para varios componentes compartidos.
- Rutas con hash configuradas en `src/app/app.routes.ts`.

Scripts utiles:

- `npm start`: servidor local Angular.
- `npm run build`: build general.
- `npm run build:prod`: build de produccion.
- `npm run build:test`: build de testing.
- `npm test`: pruebas unitarias.

## Mapa del proyecto

- `src/app/app.routes.ts`: rutas publicas, privadas y rutas bajo `/service`.
- `src/app/modules/private/*`: modulos principales para usuario autenticado.
- `src/app/modules/public/*`: pantallas publicas como login y page-not-found.
- `src/app/layout/*`: layouts publicos, privados y de servicios.
- `src/app/shared/*`: componentes y piezas reutilizables.
- `src/app/shared/components/*`: componentes UI reutilizables.
- `src/app/services/*`: servicios que consumen endpoints y servicios helper.
- `src/app/interfaces/*`: contratos de datos usados por componentes y servicios.
- `src/app/enums/*`: enums compartidos, incluyendo keys de storage.
- `src/app/constants/*`: constantes compartidas, como mensajes de error y regex.
- `src/app/config/*`: configuracion de servicios por cliente y navegacion de servicios.
- `src/app/guards/*`: guards de autenticacion, seleccion de cliente, acceso a servicios y can-deactivate.
- `src/app/pipes/*`: pipes reutilizables.

## Convenciones de UI

Los componentes reutilizables viven en `src/app/shared/`, especialmente en `src/app/shared/components/*`. La mayoria se construyo tomando el HTML base de Flowbite y encapsulandolo en componentes Angular con inputs, outputs y clases propias.

Al crear o modificar UI:

- Reutiliza componentes existentes de `shared` antes de crear uno nuevo.
- Si necesitas un componente nuevo, manten la misma linea visual de los componentes actuales.
- No agregues otra libreria de componentes si se puede resolver con Angular, Tailwind y los componentes locales.
- Usa los colores definidos en `tailwind.config.js`.
- Prefiere clases Tailwind ya usadas en el proyecto antes de introducir estilos nuevos.
- Mantiene los textos visibles de la app en espanol.
- Sigue los patrones actuales de Angular 17, incluyendo control flow `@if`, `@for` cuando el archivo cercano ya lo usa.
- Para iconos, revisa primero los sprites existentes en `assets/icons` y los usos cercanos antes de agregar otra solucion.

## Rutas y servicios por cliente

Las rutas principales estan en `src/app/app.routes.ts`.

Las rutas bajo `/service` dependen del cliente seleccionado y de los servicios configurados:

- `src/app/config/service-navigation.config.ts`: define `SERVICES_CONFIG`, `SERVICES_ORDER` y los datos de navegacion.
- `src/app/config/client-services.config.ts`: define que servicios puede usar cada cliente y las reglas por defecto.
- `src/app/guards/service-access.guard.ts`: valida acceso a servicios usando la configuracion.
- `src/app/guards/client-selected.guard.ts`: protege las rutas de servicio cuando no hay cliente seleccionado.

Si agregas un nuevo servicio dentro de `/service`, normalmente debes revisar y actualizar:

- `src/app/app.routes.ts`.
- `src/app/config/service-navigation.config.ts`.
- `src/app/config/client-services.config.ts`.
- El layout/navegacion de servicios si el nuevo servicio debe aparecer en tabs o menus.
- Guards o datos de ruta, especialmente `data.serviceKey`.

No agregues rutas de servicio aisladas sin conectarlas a estas configuraciones, porque el acceso por cliente puede quedar inconsistente.

## Estado, storage y helpers

Centraliza las keys de `localStorage` en `src/app/enums/storage-key.enum.ts` siempre que sea posible.

Servicios helper importantes:

- `src/app/services/form-utils/form-utils.service.ts`: utilidades y validaciones para formularios reactivos.
- `src/app/services/events-manager/event-manager.service.ts`: gestor de estado/eventos compartidos.
- `src/app/services/alert/alert.service.ts`: alertas centradas.
- `src/app/services/toast/*`: notificaciones pequenas en la parte superior derecha.

Para formularios:

- Usa reactive forms siguiendo los patrones existentes.
- Reutiliza validadores, regex y mensajes desde `src/app/constants/*` cuando aplique.
- El componente `shared/components/input-error` consume mensajes centralizados de errores.

## Servicios HTTP e interfaces

Los servicios que llaman endpoints estan en `src/app/services/*`. Antes de crear un servicio nuevo, revisa si ya existe uno relacionado con el modulo o entidad.

Buenas practicas:

- Tipar respuestas y payloads con interfaces de `src/app/interfaces/*`.
- Mantener helpers genericos fuera de servicios de dominio cuando ya exista una carpeta helper adecuada.
- No mezclar logica de UI pesada dentro de servicios HTTP.
- Revisar `src/app/utils/*` antes de duplicar utilidades comunes.

## Modulos relevantes

Los modulos mas importantes estan bajo `src/app/modules/private/*`, porque corresponden al usuario autenticado.

Areas clave:

- `home`: seleccion del cliente/aseguradora.
- `documents`: documentacion por cliente.
- `contracts`: contratos por cliente.
- `update-data`: actualizacion de datos del prestador.
- `support`: soporte/tickets; tambien existe uso publico desde `auth-support`.

## Criterios de trabajo para agentes

Antes de cambiar codigo:

- Lee el componente, servicio o guard cercano para seguir el patron existente.
- Usa `rg` para buscar usos relacionados antes de renombrar, mover o cambiar contratos compartidos.
- Mantiene los cambios acotados al pedido.
- No reviertas cambios existentes del usuario.
- No introduzcas refactors amplios si no son necesarios para resolver la tarea.

Al terminar:

- Ejecuta una verificacion razonable segun el alcance, por ejemplo `npm run build` para cambios de Angular compartidos o cambios de rutas.
- Si no puedes ejecutar pruebas o build, deja claro el motivo.
- Menciona archivos tocados y cualquier riesgo residual importante.

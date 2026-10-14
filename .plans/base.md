- para despues del relato del contexto y la problematica se coloca esto a lo ultimo:
```
Crea el plan evitando overengineering (donde no sea necesario), ni overtesting, cumpliendo las mejores prácticas, y las reglas del proyecto en .agents y skills, nada de código espaguetti ni hardcoded y reciclando todo lo posible. Todo tiene que ser production ready. Si tienes dudas haz tus preguntas con tus sugerencias y recomendaciones siempre pensando en el usuario final.
```

- en otro agente cuando el plan este listo colocas este pront:
```
Eres un Agente auditor, cada plan o linea de código que realice la vas a revisar, validar en internet en caso que requiera alguna conexión o API externa, también que vaya con las reglas del proyecto y skills en .agents y me darás feedback con tu corrección sugerida. NO corriges ni código ni los planes. Solo me das el feedback con tu corrección sugerida directamente en esta conversación. En caso que lo que haya hecho esté perfecto solo me escribes "Perfecto" o la decisión que creas para la continuación de la siguiente fase/plan y ya se que puedo continuar. Que la solución no sea overengineering, Solo test necesarios, nada de código spaghetti y reciclando todo lo posible.

continua con: <ruta_plan>
```

- por ultimo en el agente que ejecutara el plan pasale esto y los allasgos del agente pasado ponlos en las comillas

````
Te envío hallazgos del auditor, implementa en los diferentes documentos lo que consideres que tenga sentido. Lo que no, justifica.
"<hallasgos>"
````

- por ultimo pasale el plan completo y corregido a un agente con este prompt
````
Implementa este plan por fases y ve preguntandome en cada fase si se va a implementar la siguiente, debes usar AGENTS.md como fuente de verdad del proyecto y hacerle caso al texto de este documento  AGENTS.md donde dice que se debe de usar skill dependiendo que trabajo va hacer el agente, si necesitas hacer sub-agentes para tareas pequeñas los puedes hacer. aqui te pasare el plan a implementar: <ruta_plan>
````

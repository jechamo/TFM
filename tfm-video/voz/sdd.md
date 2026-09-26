# Texto de voz para ElevenLabs v3 · Ecosistema de agentes SDD

Español de España · Stability: **Natural** (es un vídeo explicativo: mejor calmado que entusiasta) · 3-4 tomas por bloque.
Ritmo medido en tus locuciones anteriores: unas 150-160 palabras por minuto → **≈ 4 min 20 s**.
Sigue el orden de la grabación `media/Originales/video/SDD.mp4` (recorrido por
https://jechamo.github.io/Estructura_inicial_claude/, generado con `tfm-video/tours/sdd-web.cjs`).
Cada párrafo es una sección de la web: genera **un párrafo por toma**.

---

## Versión única (≈4 min 20 s)

```text
[curious] ¿Qué pasa cuando le pides a un agente de inteligencia artificial que programe por ti? Que escribe rápido… [short pause] pero nadie sabe muy bien qué ha decidido, ni por qué, ni si funciona de verdad.

Esta es la respuesta de este trabajo: un ecosistema de veinte agentes que no escriben una línea sin especificación. Un circuito completo para especificar, planificar, implementar, verificar y entregar. Con veintisiete skills, siete entornos compatibles… y cero dependencias.

Instalarlo lleva tres pasos. Primero, escribes la ruta de tu proyecto y eliges el modo: greenfield si empiezas de cero, brownfield si ya tienes código… o automático, y que decida él. También puedes quitar los ganchos de git o añadir las plantillas de documentación.

Con eso, la página construye los comandos. El primero simula: te dice qué ficheros escribiría, cuáles fusionaría y cuáles conservaría… sin tocar el disco. El segundo instala. Y el tercero verifica: cuenta lo que hay realmente en disco, y si no cuadra, falla.

¿Y cuando sale una versión nueva? Para eso está update. No sobrescribe tu proyecto: lo reconcilia. Lo que es de la plantilla se actualiza. Los ficheros compartidos se fusionan. Tus specs, tus decisiones y tu bitácora no se tocan nunca. Y si modificaste algo de la plantilla, la versión nueva se deja al lado, para que decidas tú.

[short pause] El corazón del sistema es el circuito. Cada fase produce lo que la siguiente necesita.
Especificar: la idea se convierte en requisitos con criterios de aceptación que se pueden probar. Aquí se decide qué y para quién, nunca cómo.
Planificar: ahora sí, el cómo. Plan técnico, datos, contratos… y tareas pequeñas, cada una con su test.
Implementar: rojo, verde, refactor. El test tiene que fallar primero… y hay que enseñarlo fallando.
Verificar: todos los controles a la vez. Tests, cobertura, revisión y seguridad. Lo que no se ha ejecutado, no cuenta como aprobado.
Y entregar: la pull request con su trazabilidad, su registro de cambios y su plan de vuelta atrás.

[short pause] No todos los cambios necesitan el mismo papeleo. Por eso hay tres niveles. Light, para un texto o un estilo. Compact, para un cambio acotado en un solo módulo. Y full, para seguridad, datos o varios módulos a la vez. Ninguno se salta los controles… y el nivel no lo decide el agente: lo comprueba un script contra el cambio real.

En todo el recorrido hay seis puertas de aprobación humana: producto, arquitectura, especificación, diseño, plan y entrega. [dramatic] La máquina propone… la persona decide.

Los veinte agentes están organizados en cinco familias, y cada uno tiene su territorio. Los del circuito llevan el flujo de una fase a otra. Los de arquitectura deciden las fronteras. Los de construcción hacen el trabajo. Los de calidad ponen el listón. Y los auditores miran sin tocar. Solo tres pueden delegar… y ninguna cadena pasa de dos saltos.

Todo esto se maneja con veintisiete skills que se llaman desde el chat con una barra. Catorce son del propio circuito: empezar, especificar, planificar, implementar, verificar, entregar… Y el resto cubre el terreno, la calidad, la seguridad, la memoria del proyecto y el diseño.

[short pause] El circuito da cuatro garantías que no dependen de que alguien se acuerde. Sin especificación, no hay código. Rojo antes que verde. Seguridad auditada con OWASP. Y usabilidad con un suelo mínimo de accesibilidad. Además, la bitácora y los registros de decisiones guardan el porqué… y la deuda que se aceptó a sabiendas.

Y funciona igual en todas partes: Claude Code, GitHub Copilot, VS Code, Cursor, Codex, Gemini y Antigravity. Los perfiles se escriben una vez… y el instalador los adapta a cada herramienta.

[short pause] Quedan las preguntas de siempre. ¿El modo rápido se salta los controles? No: ahorra documentos, no puertas. ¿Y si ya tengo mi propia configuración? Se fusiona, no se reemplaza. ¿Puedo instalarlo desde la web? No, y es a propósito: ninguna página debería poder instalarte nada. ¿Añade dependencias? Ninguna. ¿Y si mi proyecto no es de Node? Da igual: funciona con Python, Java, Go… lo que uses. ¿Y cómo se desinstala? Con un git checkout. No deja nada fuera del repositorio.

[dramatic] Veinte agentes. Seis puertas. Un solo circuito.
[short pause] La inteligencia artificial escribe el código… [excited] y el circuito se asegura de que esté bien hecho.
```

---

## Pronunciación (solo en ElevenLabs; los subtítulos salen de este texto tal cual)

| En el texto | Si v3 lo lee mal, escribe |
|---|---|
| greenfield / brownfield | grínfild / bráunfild |
| update | ápdeit |
| git checkout | guit chécaut |
| Light / Compact / Full | Láit / Cómpact / Ful |
| OWASP | óuasp |
| Playwright (no sale) · Claude Code | Cloud Cóud → deja «Claude Code», el montaje lo corrige |
| Antigravity | Antigráviti |

Si cambias una palabra solo para la voz, **no hace falta tocar este fichero**: el montaje alinea el audio con este texto
y los subtítulos saldrán bien escritos.

## Qué se ve en cada párrafo (para el montaje)

| Párrafo | Grabación | Qué se ve |
|---|---|---|
| Gancho + presentación | 0-27 s | Portada, terminal con `npx init`, diagrama, contadores 20 · 27 · 7 · 0 |
| Instalar (config) | 27-52 s | Se escribe la ruta, cambia el modo, se activan las casillas |
| Instalar (pasos) | 52-77 s | Pasos 1, 2 y 3 con su botón Copiar |
| Actualizar | 77-94 s | Comando update y las cuatro categorías |
| Circuito (5 fases) | 94-132 s | Una pestaña por fase |
| Tres niveles | 132-159 s | Texto de niveles, comandos y tarjetas light · compact · full |
| Seis puertas | 159-167 s | Ilustración de las puertas |
| Agentes | 167-205 s | Carrusel de familias y mapa de delegación |
| Skills | 205-244 s | Filtros por categoría y listado completo |
| Garantías | 244-261 s | SDD · TDD · SEC · UX · DOC |
| Entornos | 261-270 s | Cinta con las 7 herramientas |
| Preguntas | 270-333 s | Se abre cada pregunta |
| Cierre | 333-340 s | Vuelta a la portada |

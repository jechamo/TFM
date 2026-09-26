# Aprendizajes

1. **La especificación ahorra más de lo que cuesta cuando hay datos reales.** El contrato de 9 columnas de ChaFit no era un problema de código, sino de un contrato implícito entre la IA y la app; sin spec, cada arreglo habría desplazado el fallo a otro sitio.
2. **La verificación tiene que vivir fuera del modelo.** Un agente puede narrar que ha hecho algo; solo un hook o un script demuestran que ocurrió. Por eso existen `observed`, `declared-corroborated` y el `trace-audit`.
3. **Quien juzga no debe escribir.** Separar auditores de implementadores, y que el orquestador contraste lo que cada especialista reporta, evitó al menos una recomendación que habría roto el alta de usuarios en las apps ya instaladas (auditoría de ChaFit).
4. **La plataforma también tiene opiniones.** Los privilegios por defecto de Supabase anularon un `revoke` aparentemente correcto (spec 005 de ChaFit); la misma lección explica parte de los hallazgos de las auditorías.
5. **No todo cambio merece el mismo expediente.** El circuito proporcional (*light/compact/full*, specs 015 y 017) responde al coste de aplicar el expediente completo a cambios pequeños; el nivel lo decide la ruta del cambio, no la prisa.
6. **Honestidad antes que cifras.** Declarar un control no ejecutado o una funcionalidad parcial (Agent SDK) da más credibilidad que un 100 % sin fuente.
7. **La arquitectura como código evita la divergencia.** Un único modelo alimenta diagramas, tablas y DSL: cambiar un dato en un sitio lo cambia en todos.
8. **Los productos nacidos con IA *low-code* se pueden profesionalizar** sin reescribirlos: onboarding, specs pequeñas, contratos compatibles y migraciones reversibles.

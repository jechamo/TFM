| Integración | Proveedor | Función | Entrada | Salida | Evidencia |
|---|---|---|---|---|---|
| Rutinas, dietas, visión, imágenes, voz y asistente | **OpenAI API** | Texto, visión, imagen, edición de imagen, transcripción y asistente conversacional | perfil, encargo, fotos, audio | JSON, texto, imágenes | `supabase/functions/_shared/openai-models.ts` |
| Checkout, portal y estado | **Stripe** | Checkout, portal de cliente y estado de suscripciones | cliente, precio, suscripción | — | `supabase/functions/create-checkout/` |
| Email de contacto | **Resend** | Envío del formulario de contacto por email | remitente, asunto, mensaje | — | `supabase/functions/send-contact-email/` |
| Mapas y geocodificación | **Mapbox** | Mapas y geocodificación para gimnasios, zonas de entrenador y búsqueda | coordenadas, búsqueda de lugar | — | `src/components/maps/GymLocationPicker.tsx:129` |
| Errores saneados | **Sentry** | Captura de errores saneados y diagnóstico opcional con consentimiento | evento sin PII; Replay solo con consentimiento | — | `src/sentry.ts` |
| Webhook de alta | **n8n (Elestio)** | Automatización externa que recibe las nuevas altas | datos del registro | — | `src/hooks/useAuth.tsx:264` |

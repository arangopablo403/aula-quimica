# Acceso a Aula Química

## Estado de esta entrega

Formularios y control de matrícula implementados. Proyecto independiente de Supabase: Aula Química (`qjsvgnnpkmnrrpqhwbad`), en la organización compartida con Nexo. Nexo no se modifica. La URL y clave publicable de Aula Química están conectadas en Sites. La activación de cuentas externas queda cerrada (`AUTH_READY=false`) hasta configurar y verificar correo y redirecciones. La entrada de registro puede visitarse sin cuenta; los contenidos requieren sesión propia y autorización.

## Flujo

1. `/acceso`: crear cuenta con correo y contraseña, confirmar el correo e iniciar sesión.
2. Completar nombre, institución, cursos solicitados y autorización para gestionar estos datos.
3. La solicitud se guarda en D1 con estado pendiente y sin cursos autorizados.
4. `/admin/estudiantes`: el docente aprueba, rechaza o suspende y elige cursos concretos.
5. El servidor filtra contenidos y archivos por los cursos aprobados en cada consulta. Conocer una URL no concede permisos.

Los datos de matrícula y el historial de cambios están en tablas privadas de D1. No se exponen tablas a una API SQL pública. Supabase Auth administra las contraseñas; no se guardan en D1 ni se muestran al docente. Las sesiones usan cookies HttpOnly, SameSite Strict y Secure en HTTPS, con duración máxima de una hora; cerrar sesión invalida el registro local. No se guarda una sesión en localStorage.

## Activación pendiente

- Proyecto independiente creado y conectado: `qjsvgnnpkmnrrpqhwbad`. Las identidades de Nexo no sirven para iniciar sesión aquí.
- Configurar `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` en las variables de Sites y en el entorno local; nunca usar una clave service_role para esta integración.
- Verificar confirmación de correo habilitada, SMTP de producción y URL del sitio/redirección permitida hacia `/acceso`. El correo predeterminado de Supabase tiene restricciones para destinatarios y no sustituye SMTP para estudiantes.
- Probar con una cuenta de prueba autorizada: confirmación, login, matrícula pendiente, aprobación, aislamiento entre cursos, suspensión, expiración y cierre de sesión. No activar antes de estas pruebas.
- Configurar `AUTH_READY=true`, publicar y habilitar la entrada de visitantes en Sites únicamente cuando el control interno esté verificado. La página de acceso será visitable, pero los cursos seguirán protegidos en el servidor.

La sesión de ChatGPT no concede acceso docente. Los correos docentes autorizados se guardan en `ADMIN_EMAIL` y `SITE_OWNER_EMAIL`. No hay registro público de docentes ni selector de rol que conceda permisos. Cuando se active Supabase, esos mismos correos verificados podrán utilizar el formulario de contraseña.

## Verificación realizada

- Compilación de TypeScript y compilación de producción.
- `node scripts/check-course-access.mjs`: aislamiento entre cursos y enlaces compartidos sin filtración de otras ubicaciones.
- Con `TEST_ORIGIN=http://localhost:5173`: acceso anónimo a matrículas, autoaprobación y solicitudes de otro origen rechazados; contenidos vacíos y archivos inaccesibles para visitantes no autorizados.
- La recuperación automática de contraseñas no está implementada en esta entrega; el formulario indica contactar al docente. Debe añadirse con el proveedor activado, sin pedir ni mostrar la contraseña actual al docente.

Referencias oficiales: https://supabase.com/docs/guides/auth/passwords y https://supabase.com/docs/guides/auth/auth-smtp

## Acceso social preparado

Google (`google`), Microsoft/Hotmail/Outlook (`azure`) y Facebook (`facebook`) usan OAuth con PKCE. `/api/oauth` inicia el flujo con una solicitud POST del mismo origen. `/auth/retorno` verifica el código, el usuario y el correo antes de crear la sesión privada. El verificador PKCE vive diez minutos en cookies HttpOnly; no se guardan tokens de sesión en localStorage.

`OAUTH_PROVIDERS` contiene únicamente proveedores efectivamente configurados y probados, separados por comas. Mientras falten credenciales, sus botones muestran «Pendiente de activación». Registrar las aplicaciones en las consolas oficiales y guardar sus Client ID y secretos en Supabase Auth; nunca en el navegador ni en archivos versionados. Permitir como retorno de Supabase la URL del sitio seguida de `/auth/retorno`. La URL callback de las aplicaciones externas se obtiene del proyecto Supabase elegido.

Microsoft debe admitir cuentas personales para Hotmail/Outlook; revisar la configuración de verificación de correo y la claim opcional `xms_edov` según la guía oficial. Facebook debe contar con los permisos y el estado de aplicación requeridos para usuarios externos. No activar proveedores hasta probarlos.

La entrada docente ya no redirige automáticamente a OpenAI: muestra `/acceso`. Se ha eliminado la autorización automática por ChatGPT, también para APIs y archivos.

Guías: https://supabase.com/docs/guides/auth/social-login/auth-google · https://supabase.com/docs/guides/auth/social-login/auth-azure · https://supabase.com/docs/guides/auth/social-login/auth-facebook

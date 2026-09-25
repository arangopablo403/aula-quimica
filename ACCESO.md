# Acceso a Aula Química

## Estado de esta entrega

Formularios y control de matrícula implementados. La activación de cuentas externas queda cerrada (`AUTH_READY=false`) hasta elegir el proyecto de Supabase y comprobar correo de confirmación e inicio de sesión. El sitio conserva la audiencia privada de su propietario.

## Flujo

1. `/acceso`: crear cuenta con correo y contraseña, confirmar el correo e iniciar sesión.
2. Completar nombre, institución, cursos solicitados y autorización para gestionar estos datos.
3. La solicitud se guarda en D1 con estado pendiente y sin cursos autorizados.
4. `/admin/estudiantes`: el docente aprueba, rechaza o suspende y elige cursos concretos.
5. El servidor filtra contenidos y archivos por los cursos aprobados en cada consulta. Conocer una URL no concede permisos.

Los datos de matrícula y el historial de cambios están en tablas privadas de D1. No se exponen tablas a una API SQL pública. Supabase Auth administra las contraseñas; no se guardan en D1 ni se muestran al docente. Las sesiones usan cookies HttpOnly, SameSite Strict y Secure en HTTPS, con duración máxima de una hora; cerrar sesión invalida el registro local. No se guarda una sesión en localStorage.

## Activación pendiente

- Confirmar el proyecto de Supabase. No se ha modificado ningún proyecto existente.
- Configurar `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` en las variables de Sites y en el entorno local; nunca usar una clave service_role para esta integración.
- Verificar confirmación de correo habilitada, SMTP de producción y URL del sitio/redirección permitida hacia `/acceso`. El correo predeterminado de Supabase tiene restricciones para destinatarios y no sustituye SMTP para estudiantes.
- Probar con una cuenta de prueba autorizada: confirmación, login, matrícula pendiente, aprobación, aislamiento entre cursos, suspensión, expiración y cierre de sesión. No activar antes de estas pruebas.
- Configurar `AUTH_READY=true`, publicar y habilitar la entrada de visitantes en Sites únicamente cuando el control interno esté verificado. La página de acceso será visitable, pero los cursos seguirán protegidos en el servidor.

El docente puede usar la entrada de ChatGPT existente; los correos autorizados se guardan en `ADMIN_EMAIL` y `SITE_OWNER_EMAIL`. No hay registro público de docentes ni selector de rol que conceda permisos. Cuando se active Supabase, esos mismos correos verificados podrán utilizar el formulario de contraseña.

## Verificación realizada

- Compilación de TypeScript y compilación de producción.
- `node scripts/check-course-access.mjs`: aislamiento entre cursos y enlaces compartidos sin filtración de otras ubicaciones.
- Con `TEST_ORIGIN=http://localhost:5173`: acceso anónimo a matrículas, autoaprobación y solicitudes de otro origen rechazados; contenidos vacíos y archivos inaccesibles para visitantes no autorizados.
- La recuperación automática de contraseñas no está implementada en esta entrega; el formulario indica contactar al docente. Debe añadirse con el proveedor activado, sin pedir ni mostrar la contraseña actual al docente.

Referencias oficiales: https://supabase.com/docs/guides/auth/passwords y https://supabase.com/docs/guides/auth/auth-smtp

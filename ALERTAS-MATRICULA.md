# Solicitudes, avisos y autorización por curso

El estudiante confirma su correo, inicia sesión y solicita un solo curso en `/acceso`.
La solicitud queda pendiente: nunca modifica los permisos aprobados.
El docente abre `/admin/estudiantes`, pulsa **Revisar matrícula**, marca exclusivamente
los cursos permitidos, elige **Aprobada** y guarda. Puede cambiar o retirar cursos y
suspender la matrícula. Las siguientes consultas al servidor aplican el cambio.
Si necesita otro curso después de enviar la solicitud, debe pedir al docente que lo agregue.

Los permisos se verifican en el servidor para contenidos y archivos de R2. Los enlaces
públicos externos no se pueden proteger con estos permisos; usa la subida de archivos del aula
para materiales restringidos. Un archivo compartido explícitamente entre dos cursos es visible
para los estudiantes autorizados de cualquiera de ellos.

## Activar correo (pendiente de configurar en producción)

1. Crea una cuenta en https://resend.com y añade un dominio remitente que controles,
   por ejemplo `avisos.chemquantum.win`. Copia los registros DNS que Resend indique
   a Cloudflare y espera la verificación. No cambies los registros del correo de la universidad.
2. Crea una clave de envío en Resend. En Cloudflare → Workers & Pages → aula-quimica
   → Settings → Variables and Secrets, guarda `RESEND_API_KEY` como **Secret**.
3. Añade `ENROLLMENT_MAIL_FROM` con un remitente del dominio verificado, por ejemplo
   `AulaQuímica <matriculas@avisos.chemquantum.win>`.
4. Añade `ENROLLMENT_ALERT_EMAIL=juan.betancourt@ucaldas.edu.co` y comprueba
   `SITE_ORIGIN=https://chemquantum.win`. Guarda y despliega.
5. Presenta una solicitud desde una cuenta de prueba confirmada. Comprueba el aviso
   en el buzón y el registro del proveedor; luego aprueba solo ese curso y verifica
   que sus materiales abren mientras los de otro curso permanecen bloqueados.

El aviso contiene nombre, correo, institución, curso y enlace al panel. No incluye contraseñas
ni enlaces que aprueben automáticamente. El proveedor recibirá esos datos para enviar el mensaje.
La solicitud se conserva aunque el correo falle. El panel muestra avisos pendientes y permite
reintentarlos al configurar el servicio. No se envían automáticamente avisos antiguos al abrir
el panel; pulsa **Reintentar aviso**. El estado enviado significa aceptación por el proveedor,
no entrega comprobada en el buzón. Revisa costes y límites de tu cuenta de Resend.

La tabla D1 `enrollment_alerts` se crea de forma idempotente al primer uso.
La clave privada no debe guardarse en GitHub ni en el chat.

Documentación: https://resend.com/docs/api-reference/emails/send-email

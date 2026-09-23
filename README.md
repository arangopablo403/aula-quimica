# Aula Química

Sitio educativo en español. El alumnado puede consultar la biblioteca sin cuenta; el panel `/admin` usa inicio de sesión con ChatGPT y una lista de autorización de un único correo configurado como `ADMIN_EMAIL` en Sites.

## Uso del panel

1. Abre **Acceso docente** e inicia sesión con el correo autorizado.
2. Edita **Sobre mí** para completar nombre, fotografía, trayectoria, formación, intereses, proyectos y correo profesional. Los perfiles académicos y redes se introducen uno por línea: `ORCID | https://…`.
3. Crea ramas y asignaturas. Para los grados existentes, adapta los períodos, unidades y temas. Marca un período como actual; el anterior se desmarca automáticamente.
4. Crea un recurso, carga su PDF o añade un enlace de YouTube/Vimeo y su transcripción. Selecciona varios temas para reutilizar el mismo recurso.
5. Selecciona **Borrador** o **Publicado** y guarda. Para retirar contenido, vuelve a guardarlo como borrador. Una rama o asignatura en borrador oculta sus descendientes.
6. En investigaciones, añade autores, fecha, resumen, palabras clave, área, tipo, figura y DOI como URL completa. Carga documentos solo con permiso.
7. Consulta el formulario de contacto en **Mensajes**. Los mensajes se almacenan en el panel; no se envían automáticamente por correo.

Los datos iniciales son ejemplos didácticos editables, no un currículo oficial. No hay credenciales, investigaciones, videos o redes personales inventados.

## Desarrollo

Node >= 22.13. `npm run install:ci`, `npm run db:generate`, `npm run dev` y `npm run build`.
Persistencia D1 (`DB`) y archivos R2 (`BUCKET`). Las migraciones están en `drizzle/`.
El archivo `.env` local no se publica; `.env.example` documenta `ADMIN_EMAIL`. El correo real se configura mediante Sites como secreto, no en el código.
En desarrollo, Sites simula inicio de sesión con `seedy@sites.test`; esa simulación no se incluye en producción.

Las fórmulas admiten caracteres Unicode: H₂O, Ca²⁺, 2H₂ + O₂ → 2H₂O. El texto se presenta de forma segura sin aceptar HTML ejecutable.
Los videos se cargan solo al solicitarlos y admiten transcripción escrita.

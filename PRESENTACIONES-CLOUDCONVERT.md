# Conversión de presentaciones

En CloudConvert, crea una clave API con los permisos `task.read` y `task.write`.
En Cloudflare: Workers & Pages → aula-quimica → Settings → Variables and Secrets.
Añade `CLOUDCONVERT_API_KEY` como **Secret** en Production y guarda/despliega.
Nunca guardes la clave en GitHub ni en variables públicas del navegador.

PDF funciona sin CloudConvert. PPT, PPTX, PPS, PPSX y ODP requieren la clave y créditos en CloudConvert. No se ha validado una conversión real hasta configurar esa clave y probar un archivo.

El docente envía el original directamente al formulario temporal de CloudConvert. El servidor consulta el trabajo, entrega el PDF únicamente al docente autenticado y solicita eliminar el trabajo tras recuperarlo. Si se cierra la pestaña o falla la limpieza, puede persistir según la retención de CloudConvert. El PDF se convierte en imágenes con marca de agua en el navegador, usando el mismo visor y permisos por curso. Los estudiantes no reciben el documento original. No es posible impedir todas las capturas de pantalla.

La conversión es estática: no conserva animaciones, audio ni interactividad. Los archivos de hasta 40 MB deben producir un PDF de hasta 40 MB y un máximo de 80 páginas. Fuentes no disponibles o características específicas pueden variar visualmente; revisa las diapositivas publicadas.

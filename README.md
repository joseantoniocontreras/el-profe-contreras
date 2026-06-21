# El Profe Contreras — Plataforma de cursos y mentorías

Sitio web completo para vender cursos, mentorías y suscripciones, con panel de administración propio. Pensado para correr gratis en GitHub Pages mientras validas el negocio, y migrar después a dominio + hosting + base de datos real sin rehacer nada.

## Estructura del proyecto

```
sitio/
├── index.html              → Página pública (lo que ven tus clientes)
├── admin/
│   ├── index.html           → Panel de administración
│   ├── admin.js              → Lógica del panel (login, CRUD, configuración)
│   └── admin.css             → Estilos del panel
└── assets/
    ├── css/estilos.css       → Estilos del sitio público
    └── js/
        ├── datastore.js      → Capa de datos (hoy localStorage, mañana tu API)
        └── sitio.js           → Lógica del sitio público (renderiza todo desde datastore.js)
```

## Cómo se gestiona el contenido (sin tocar código)

1. Entra a `tudominio.com/admin/` (o `.../admin/index.html` en GitHub Pages)
2. Clave de acceso por defecto: **`profecontreras2026`**
   - **Cámbiala ya**, antes de compartir el enlace con nadie. Está en `admin/admin.js`, busca la línea `const CLAVE_CORRECTA = 'profecontreras2026';` y cámbiala por la tuya.
3. Desde ahí gestionas:
   - **Cursos**: crear, editar, ocultar/mostrar, eliminar, marcar como "Top ventas"
   - **Planes de suscripción**: precio, beneficios, cuál se destaca
   - **Estado "En vivo"**: el switch que activa la franja roja en el sitio cuando estás transmitiendo (TikTok Live, clase por Zoom, etc.)
   - **Configuración general**: nombre de marca, número de WhatsApp, datos de Yape/Plin, redes sociales
   - **Boletín**: lista de correos suscritos desde el popup, exportable a CSV

Todo lo que cambies en el panel se ve reflejado en el sitio público al recargar la página — están conectados por la misma "base de datos" (ver siguiente sección).

## ⚠️ Importante: cómo funciona el almacenamiento HOY

En esta fase (GitHub Pages, sin servidor propio) los datos se guardan en **`localStorage` del navegador**. Esto significa:

- Los datos viven en el navegador donde abriste el panel admin, **no en un servidor central**.
- Si gestionas el sitio desde tu laptop y luego entras desde tu celular, **cada uno tiene su propia copia** de los datos — no se sincronizan solos.
- Si limpias el caché/datos del navegador, pierdes lo que hayas configurado ahí (los cursos volverán a los de ejemplo).
- Los clientes que visitan tu sitio público **ven los cursos tal como tú los dejaste guardados en tu navegador la última vez que los publicaste** — pero ojo: si tú gestionas desde tu laptop y el cliente entra desde su celular, el cliente NO ve tus cambios automáticamente a menos que tú hayas subido (`git push`) los datos actualizados.

**Recomendación práctica para esta fase:** gestiona siempre desde el mismo navegador/dispositivo, y considera exportar tus cursos periódicamente (puedo ayudarte a armar un botón de exportar/importar JSON si lo necesitas, para tener respaldo).

## Cómo migrar a base de datos real (cuando tengas dominio + hosting)

Todo el sitio llama siempre a `DataStore.algo()`, nunca a `localStorage` directamente. Esto fue intencional: para migrar, **solo tienes que reescribir el contenido de `assets/js/datastore.js`** para que en vez de leer/escribir en `localStorage`, haga `fetch()` a tu propia API.

Pasos resumidos cuando llegue el momento:

1. Eliges tu stack de backend (opciones simples y baratas en Perú: PHP + MySQL en un hosting compartido, o algo gestionado como Supabase/Firebase que te ahorra montar servidor).
2. Creas endpoints equivalentes a las funciones que ya existen: `getCursos`, `guardarCurso`, `eliminarCurso`, `getConfig`, `guardarConfig`, etc.
3. Cambias cada función de `datastore.js` para que use `fetch('/api/...')` en vez de `localStorage`.
4. **No tocas ni `sitio.js`, ni `admin.js`, ni ningún HTML** — ellos no saben ni les importa de dónde vienen los datos, solo llaman a `DataStore`.

Cuando llegues a ese punto, dime y te ayudo a armar la migración completa (puedo dejarte el backend en PHP+MySQL o Node, lo que prefieras).

## Cómo publicar en GitHub Pages

1. Crea un repositorio en GitHub (puede llamarse como quieras, ej. `el-profe-contreras`)
2. Sube todo el contenido de esta carpeta (`index.html`, `admin/`, `assets/`) a la raíz del repo
3. Ve a **Settings → Pages** en el repositorio
4. En "Source", selecciona la rama `main` (o `master`) y carpeta `/ (root)`
5. Guarda. GitHub te dará una URL tipo `https://tuusuario.github.io/el-profe-contreras/`
6. El panel quedará en `https://tuusuario.github.io/el-profe-contreras/admin/`

Cuando compres tu dominio, solo apuntas el DNS hacia GitHub Pages (o subes los mismos archivos a tu hosting nuevo) — no hay que cambiar nada del código para eso.

## Botón de WhatsApp y automatización futura

El botón "Chatear con alguien" (flotante y en el header) abre `https://wa.me/NUMERO?text=MENSAJE` con el número y mensaje que configures en el panel admin. Cuando quieras conectar tu chatbot de automatización (Make.com, WhatsApp Business API, etc.), ese mismo número es el que conectarás del lado del proveedor — no necesitas cambiar nada en el sitio.

## Detalles de SEO ya incluidos

- Meta `title` y `description` orientados a tus palabras clave (cursos online Perú, Canva, marketing digital, mentoría, IA, Yape)
- Open Graph y Twitter Card para que se vea bien al compartir el link en WhatsApp/redes
- Datos estructurados Schema.org tipo `EducationalOrganization` (ayuda a buscadores a entender qué es tu sitio)
- HTML semántico (`header`, `section`, `footer`, `nav`) y atributos `alt`/`aria-label` en botones de ícono
- El panel admin (`admin/index.html`) tiene `noindex, nofollow` para que Google no lo indexe

## Próximos pasos sugeridos (no incluidos todavía, dime si los quieres)

- Botón de exportar/importar todos los datos en JSON (respaldo manual mientras no haya base de datos real)
- Página individual por curso (hoy todo vive en una sola página con anclas `#cursos`, `#planes`, etc.)
- Integración real de checkout (de momento todo el cierre de venta pasa por WhatsApp, como pediste)
- Migración del DataStore a backend real cuando tengas hosting

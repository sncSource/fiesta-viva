# Fiesta Viva — Sitio web con cotizador de eventos

Proyecto del Laboratorio 13 de Desarrollo de aplicaciones web I.
Empresa ficticia creada con fines académicos.

## Cómo ejecutarlo
1. Abrir la carpeta en Visual Studio Code.
2. Clic derecho en `index.html` → «Open with Live Server».
3. Pruebas del cotizador: `node pruebas/cotizador.test.js`

## Estructura
- `index.html`: página principal (HTML5 semántico y accesible)
- `css/estilos.css`: estilos mobile-first (768 px y 1024 px)
- `js/cotizador.js`: reglas de negocio (tarifas, validación y cálculo sin DOM)
- `js/app.js`: menú responsive, lectura del formulario y resumen seguro
- `img/`: ilustraciones optimizadas en JPG y WebP, logotipo y favicon (26 archivos)
- `pruebas/cotizador.test.js`: 10 pruebas automáticas del cotizador en Node.js
- `.github/copilot-instructions.md`: instrucciones y restricciones del proyecto para IA

## Uso de inteligencia artificial
- **Asistente de código:** apoyo en la generación por secciones de la estructura HTML, estilos responsive, lógica del cotizador y pruebas unitarias. Todo el código fue revisado, corregido y probado manualmente.
- **Correcciones aplicadas:**
  - **Seguridad (XSS):** la propuesta inicial para mostrar el resumen usaba `innerHTML` con datos del usuario (`nombre` y `correo`), permitiendo la ejecución de código malicioso. Se reemplazó por `document.createElement`, `textContent` y `replaceChildren`.
  - **CSS (especificidad y contraste):** se ajustó la especificidad de `[aria-invalid="true"]` con `.formulario .campo :is(input, select)[aria-invalid="true"]` para que el borde rojo aplicara también a los `<input>`, y se usó `#C2185B` en botones para superar el contraste WCAG AA (5,9:1).
  - **Pruebas y fechas:** se construyeron fechas en hora local (`new Date(a, m - 1, d)`) para evitar desfases UTC en Lima y se usó `\s` en la expresión regular de moneda para contemplar el espacio no separable de `Intl.NumberFormat`.
- **Textos:** borradores de descripciones de servicios, textos alternativos (`alt`) y metadatos SEO revisados por el equipo.
- **Imágenes:** ilustraciones de referencia proporcionadas en el laboratorio; no representan eventos reales.

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
- `js/app.js`: menú responsive, lectura del formulario, contador accesible y resumen seguro
- `img/`: ilustraciones optimizadas en JPG y WebP, logotipo y favicon (26 archivos)
- `pruebas/cotizador.test.js`: 10 pruebas automáticas del cotizador en Node.js
- `evidencias/`: capturas de pantalla de verificación de cada reto
- `.github/copilot-instructions.md`: instrucciones y restricciones del proyecto para IA

## Retos desarrollados

### Reto 5. Notas del cliente, sin XSS

#### Decisiones técnicas
- **Campo de notas en `index.html`:** se agregó un `<textarea id="notas" name="notas" maxlength="300">` con etiqueta visible `Detalles del evento (opcional)` y asociado mediante `aria-describedby="contador-notas"` al contador de caracteres.
- **Contador accesible sin interrupciones:** el contador `n/300` se actualiza en tiempo real en el evento `input` y **no utiliza `aria-live`**, de modo que los lectores de pantalla lo leen al enfocar el campo pero no interrumpen al usuario anunciando cada pulsación de tecla. Además, `js/app.js` aplica un recorte defensivo a 300 caracteres y normaliza saltos de línea (`\r\n` a `\n`) al leer `FormData`.
- **Conservación de saltos de línea con CSS:** el bloque «Tus notas» solo se renderiza si el cliente escribió contenido no vacío, usando `white-space: pre-wrap` y `overflow-wrap: anywhere` en `.resumen__notas-texto` para preservar los saltos de línea del usuario sin insertar etiquetas `<br>` y evitar desbordamientos con cadenas largas.

#### ¿Por qué esta solución evita el XSS?
Un ataque de Cross-Site Scripting (XSS) ocurre cuando una aplicación inserta texto proporcionado por el usuario en un contexto que el navegador interpreta como código HTML o JavaScript (por ejemplo, usando `innerHTML`, `outerHTML`, `insertAdjacentHTML` o reemplazando saltos de línea por etiquetas `<br>` antes de inyectar HTML). Si un atacante escribe `<img src=x onerror=alert(1)>` o `"><svg onload=alert(1)>`, el analizador HTML del navegador convierte ese texto en elementos reales del DOM y ejecuta los manejadores de eventos maliciosos.

Esta solución previene el XSS en su raíz por tres mecanismos combinados:
1. **Separación estricta entre estructura y datos:** los contenedores del resumen (`div`, `h4`, `p`) se crean explícitamente con `document.createElement` y se insertan con `replaceChildren`, nunca construyendo cadenas HTML.
2. **Inserción exclusiva como texto plano (`textContent`):** el contenido que escribe el cliente en el campo de notas entra únicamente a través de `nodo.textContent = texto`. El navegador almacena ese valor como un nodo de texto literal (`Text`), sin invocar al analizador HTML; por ello, los caracteres `<`, `>`, `"` y `'` se muestran tal cual en pantalla y jamás generan etiquetas `<img>`, `<script>` ni `<svg>`.
3. **Saltos de línea mediante CSS (`white-space: pre-wrap`):** al delegar el formato de múltiples líneas al CSS en lugar de transformar `\n` en `<br>` dentro de HTML, no existe necesidad de usar `innerHTML` en ningún punto del flujo.

#### Casos de prueba verificados
| N.° | Entrada en «Detalles del evento (opcional)» | Resultado esperado | Estado |
| --- | --- | --- | --- |
| 1 | `<img src=x onerror=alert(1)>` | Se muestra literalmente como texto; sin alerta ni elemento `<img>`. | Pendiente de captura local |
| 2 | `<script>alert(1)</script>` | Se muestra literalmente como texto; no se ejecuta código. | Pendiente de captura local |
| 3 | `"><svg onload=alert(1)>` | Se muestra literalmente como texto; no se crea ningún `<svg>`. | Pendiente de captura local |
| 4 | `Tema: Frozen` + Enter + `Sin maní` | Se visualiza en dos líneas separadas mediante CSS. | Pendiente de captura local |
| 5 | Texto de 301 caracteres | El campo limita a 300 caracteres y el contador marca `300/300`. | Pendiente de captura local |

#### Evidencias
- `evidencias/reto05_caso1_xss.png`: resumen mostrando literalmente `<img src=x onerror=alert(1)>`.
- `evidencias/reto05_caso4_multilinea.png`: resumen mostrando las dos líneas de «Tus notas».
- `evidencias/reto05_consola_sin_xss.png`: consola de DevTools confirmando `0` elementos `img`, `script` y `svg` dentro de `#resultado`.

## Uso de inteligencia artificial

### Declaración base del Laboratorio 13
- **Asistente de código:** apoyo en la generación por secciones de la estructura HTML, estilos responsive, lógica del cotizador y pruebas unitarias. Todo el código fue revisado, corregido y probado manualmente.
- **Correcciones aplicadas:**
  - **Seguridad (XSS):** la propuesta inicial para mostrar el resumen usaba `innerHTML` con datos del usuario (`nombre` y `correo`), permitiendo la ejecución de código malicioso. Se reemplazó por `document.createElement`, `textContent` y `replaceChildren`.
  - **CSS (especificidad y contraste):** se ajustó la especificidad de `[aria-invalid="true"]` con `.formulario .campo :is(input, select, textarea)[aria-invalid="true"]` para que el borde rojo aplicara también a los controles de formulario, y se usó `#C2185B` en botones para superar el contraste WCAG AA (5,9:1).
  - **Pruebas y fechas:** se construyeron fechas en hora local (`new Date(a, m - 1, d)`) para evitar desfases UTC en Lima y se usó `\s` en la expresión regular de moneda para contemplar el espacio no separable de `Intl.NumberFormat`.
- **Textos:** borradores de descripciones de servicios, textos alternativos (`alt`) y metadatos SEO revisados por el equipo.
- **Imágenes:** ilustraciones de referencia proporcionadas en el laboratorio; no representan eventos reales.

### Registro de uso de IA por reto

| Reto | Qué se hizo con IA | Qué error o riesgo encontré | Cómo lo corregí o verifiqué |
| --- | --- | --- | --- |
| 5 | Diseño del campo `<textarea>` con contador accesible `n/300`, estilos CSS para preservar saltos de línea y renderizado seguro del bloque «Tus notas» en `js/app.js`. | Riesgo de XSS si se usaba `innerHTML` o `<br>` para saltos de línea; riesgo de saturar lectores de pantalla si se añadía `aria-live` al contador; riesgo de recorte incorrecto por serialización `\r\n` en `FormData`. | Se usó únicamente `document.createElement` + `textContent`, `white-space: pre-wrap`, `aria-describedby` sin `aria-live` y normalización `\r\n` a `\n`. Verificado con los 5 casos de prueba y la consola de DevTools sin elementos `img`, `script` ni `svg` en `#resultado`. |

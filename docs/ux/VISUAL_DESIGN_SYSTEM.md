# AltaGym — Sistema visual Forge

**Estado:** Base visual mínima del MVP

## 1. Propósito

Forge es la identidad visual mínima de AltaGym para el MVP: moderna, deportiva, cercana y sencilla. Su objetivo es unificar la apariencia de `/dev/login`, `/bookings` y los shells de cliente, monitor y backoffice sin cambiar la UX funcional aprobada.

## 2. Personalidad

- Energía controlada, no agresiva.
- Cercanía y claridad operativa.
- Sensación limpia, sólida y contemporánea.
- Baja decoración y poca dependencia de color para entender estados.

## 3. Marca

### Logotipo

- Archivo principal: `public/brand/altagym-lockup.svg`.
- Isotipo: `public/brand/altagym-mark.svg`.
- Wordmark: `public/brand/altagym-wordmark.svg`.
- Icono de aplicación: `src/app/icon.svg`.

### Uso

- El lockup se usa en cabeceras y superficies amplias.
- El isotipo se usa en favicon, espacios reducidos y marca secundaria.
- Cuando el logo sea decorativo, debe quedar oculto para tecnologías de asistencia y mantener el nombre accesible en texto.

## 4. Paleta

| Token | Valor | Uso |
| --- | --- | --- |
| `--brand` | `#0D5C63` | CTA principal, estados activos, marca |
| `--brand-strong` | `#08373B` | Hover y énfasis |
| `--brand-soft` | `#D8ECE8` | Superficies suaves de marca |
| `--accent` | `#C77842` | Acento cálido puntual |
| `--ink` | `#1F1B17` | Texto principal |
| `--muted` | `#675B51` | Texto secundario |
| `--page-bg` | `#F6F1E9` | Fondo global |
| `--surface` | `rgba(255, 253, 249, 0.92)` | Tarjetas elevadas |
| `--surface-strong` | `#FFFFFF` | Superficies limpias |
| `--line` | `rgba(31, 27, 23, 0.12)` | Bordes y divisores |
| `--success` | `#166534` | Estado positivo |
| `--warning` | `#9A6700` | Aviso |
| `--danger` | `#B23A35` | Error |
| `--info` | `#2563EB` | Información |
| `--focus` | `#1D4ED8` | Foco visible |

Combinaciones básicas comprobadas: texto oscuro sobre fondos claros, CTA blanco sobre brand y brand sobre fondos muy claros superan AA con margen cómodo.

## 5. Tipografía

- Pila base: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- No depende de descargas remotas.
- La jerarquía se apoya en tamaño, peso y espaciado, no en familias múltiples.

## 6. Tokens principales

Definidos en `src/app/globals.css` y consumidos por Tailwind 4:

- color de página y superficies;
- color de texto principal y secundario;
- marca, acento, éxito, aviso, error e información;
- foco visible;
- radios;
- sombras;
- anchuras compartidas;
- una transición discreta por defecto en componentes interactivos.

## 7. Componentes base

Disponibles en `src/shared/ui`:

- `BrandImage`, `BrandMark`, `BrandWordmark`, `BrandLockup`.
- `AppButton` y `AppLinkButton`.
- `Card`.
- `Badge`.
- `Nav`.
- `SectionPage`.

### Cuándo usarlos

- `Brand*`: cabeceras, portada y recursos de marca.
- `AppButton`: acciones que no navegan.
- `AppLinkButton`: navegación con aspecto de botón.
- `Card`: paneles, estados, contenedores y superficies de identidad.
- `Badge`: rol, estado o etiqueta breve.
- `Nav`: navegación por área.
- `SectionPage`: páginas provisionales, portada técnica y marcadores.

## 8. Espaciado, radios y sombras

- Radios: medios y coherentes; se evita el redondeo excesivo como forma dominante.
- Sombras: suaves y escasas, para separar sin dramatizar.
- Separación: suficiente para tocar con dedo y leer con comodidad.
- Movimiento: solo microtransiciones útiles; nada de animaciones decorativas innecesarias.

## 9. Accesibilidad

- Objetivo WCAG 2.2 AA.
- Foco visible y consistente.
- Estados no comunicados solo por color.
- Controles con tamaño táctil suficiente.
- Sin modo oscuro en este sprint.
- Respeto a `prefers-reduced-motion` cuando se introduzcan animaciones.
- SVG e imágenes de marca decorativas deben quedar ocultas para lectores de pantalla.

## 10. Ejemplos de uso

### Correcto

- CTA principal en `brand` con texto blanco.
- Tarjeta de estado con borde suave, texto claro y una etiqueta textual.
- Navegación activa con apoyo de color y `aria-current`.

### Incorrecto

- Usar solo color para indicar una reserva activa o un error.
- Multiplicar gradientes, brillos o transparencias.
- Introducir una segunda paleta no semántica para una misma función.

## 11. Límites

Forge es una base mínima, no un manual de marca completo. En sprints posteriores podrá ampliarse con:

- más componentes de formulario;
- estados de tabla y lista;
- variantes de densidad;
- iconografía funcional adicional;
- refinamiento de backoffice.

No debe crecer por hipótesis no aprobadas ni por decorativismo.

# Guía para agentes

## Flujo de trabajo

1. Entender el encargo. Localiza la spec y las tareas de OpenSpec que correspondan. Para un cambio funcional nuevo, usa el flujo OpenSpec del repositorio. Para una tarea editorial, basta el encargo del usuario.
2. Preparar Git. Comprueba la rama y el estado antes de editar. Si estás en `main`, crea una rama dedicada y reutilízala en las sesiones posteriores del mismo cambio.
3. Colaborar con el usuario. Respeta las decisiones acordadas y conserva el trabajo local. Resuelve de forma autónoma los detalles reversibles; si aparece una contradicción que cambia el comportamiento acordado, explica la decisión pendiente y continúa con lo que pueda avanzar.
4. Implementar y verificar. Relaciona los cambios con los criterios de aceptación, ejecuta las comprobaciones pertinentes y revisa el diff. Antes de usar APIs de Angular o Next.js, comprueba sus versiones en `package.json`; consulta Context7 si está configurado y, si no, la documentación oficial.
5. Entregar. Indica qué cambió, qué se comprobó y qué decisiones siguen pendientes. No hagas commit, push ni integración salvo que el usuario lo solicite.

## Frontend Angular

- Organiza el código por funcionalidades. Como convención de este proyecto, cada componente de página tiene su propia carpeta con TypeScript, plantilla, estilos y pruebas específicas juntos.
- Sitúa los componentes auxiliares dentro de la funcionalidad que los utiliza; compártelos entre funcionalidades solo cuando exista reutilización real. Los servicios y utilidades compartidos dentro de una funcionalidad pueden permanecer en su raíz.
- Evita carpetas globales por tipo, como `components` o `services`.
- Mantén las plantillas legibles y simplifica las expresiones complejas. Centra los componentes en la UI y separa la comunicación HTTP.
- Consulta Context7 para las APIs y recomendaciones de la versión instalada; si no está disponible, consulta la documentación oficial e indica esa limitación.
- Respeta las convenciones existentes salvo que el encargo autorice cambiarlas.

## Referencias del repositorio

- `README.md`: instalación, comandos de desarrollo y comprobaciones rápidas.
- `openspec/specs/`: requisitos y criterios de aceptación vigentes.
- `openspec/changes/`: propuestas y tareas de cambios; los cambios terminados están en `openspec/changes/archive/`.
- `apps/api/AGENTS.md`: instrucciones específicas generadas para Next.js en esa aplicación.

Mantén los cambios pequeños y ajustados al encargo. No edites archivos generados ni dependencias si la tarea no lo requiere.

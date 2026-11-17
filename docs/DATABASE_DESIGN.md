# AltaGym — Diseño físico de base de datos

**Estado:** Aprobado  
**Última actualización:** 14 de julio de 2026

## 1. Propósito y alcance

Este documento define el diseño físico de PostgreSQL para el MVP de AltaGym, alojado en Neon y gobernado mediante Prisma. Desarrolla el modelo conceptual y la arquitectura aprobados sin sustituir las reglas funcionales de `BUSINESS_RULES.md`, `DATA_MODEL.md`, `ROLES_AND_PERMISSIONS.md` y las features. El diseño se materializa en `prisma/schema.prisma` y este documento conserva la explicación de modelos, relaciones, restricciones, índices y decisiones de persistencia.

El documento especifica modelos, relaciones, estados, concurrencia, integridad, fechas, datos iniciales, migraciones y pruebas. Se complementa con `prisma/schema.prisma` y no constituye por sí solo una migración ejecutable ni código de aplicación.

## 2. Principio Prisma-first

Prisma define y gobierna:

- los modelos y relaciones navegables;
- las enumeraciones funcionales;
- las operaciones ordinarias de lectura y escritura;
- los límites transaccionales de los casos de uso;
- las transiciones de estado;
- la concurrencia optimista;
- la creación y cancelación coordinada de reservas, ocupaciones y notificaciones.

PostgreSQL actúa como última barrera de integridad. Las migraciones Prisma pueden incorporar SQL personalizado únicamente para garantías que Prisma no puede expresar de forma suficiente: extensiones, restricciones de exclusión, índices parciales y restricciones `CHECK`.

No se oculta lógica funcional ordinaria en triggers. El contador de aforo se gobierna mediante una transacción Prisma y actualizaciones atómicas condicionadas.

## 3. Convenciones físicas

- Tablas y columnas PostgreSQL: `snake_case`, mapeadas desde modelos Prisma mediante `@@map` y `@map`.
- Modelos y campos Prisma: `PascalCase` y `camelCase`.
- Identificadores: UUID generados por PostgreSQL con `gen_random_uuid()` y representados en Prisma como `String @db.Uuid`.
- Instantes: `timestamptz(3)`, representados como `DateTime @db.Timestamptz(3)`.
- Fechas civiles: `date`.
- Horas civiles recurrentes: `time(0)`.
- Intervalos: inicio inclusivo y final exclusivo, `[inicio, fin)`.
- Importes no forman parte del MVP.
- Las relaciones históricas usan `ON DELETE RESTRICT`; no se aplican cascadas que puedan destruir historial.
- Los campos editables incorporan `version Int @default(1)` cuando existe edición concurrente real.
- `createdAt` y `updatedAt` se incorporan a entidades mutables; los hechos append-only conservan al menos `createdAt` u `occurredAt`.

## 4. Enumeraciones

Se definen como enums Prisma y PostgreSQL los estados funcionales cerrados:

| Enum | Valores |
|---|---|
| `UserRole` | `RECEPTION`, `MONITOR`, `CLIENT` |
| `AccountStatus` | `ACTIVE`, `INACTIVE` |
| `AuthProvider` | `AUTH0`, `MOCK` |
| `ProfileStatus` | `ACTIVE`, `INACTIVE` |
| `CatalogStatus` | `ACTIVE`, `INACTIVE` |
| `GroupScheduleStatus` | `ACTIVE`, `DELETED` |
| `GroupSessionStatus` | `SCHEDULED`, `CANCELLED` |
| `GroupBookingStatus` | `ACTIVE`, `CANCELLED_BY_CLIENT`, `CANCELLED_BY_GYM` |
| `PrivateSessionStatus` | `CONFIRMED`, `CANCELLED_BY_CLIENT`, `CANCELLED_BY_GYM` |
| `MonitorBlockStatus` | `ACTIVE`, `CANCELLED` |
| `ResourceType` | `CLIENT`, `MONITOR`, `ROOM` |
| `NotificationChannel` | `SMS` |
| `NotificationStatus` | `PENDING`, `SENT`, `FAILED` |
| `OutboxStatus` | `PENDING`, `PROCESSING`, `PROCESSED`, `FAILED` |

Los códigos previsiblemente extensibles, como tipos de auditoría, plantillas, motivos técnicos o tipos de evento de outbox, se representan con cadenas controladas por la aplicación. Así pueden evolucionar sin una migración de enum por cada código nuevo.

## 5. Identidad, autorización y perfiles

### 5.1 UserAccount

Campos:

- `id UUID`.
- `username varchar(100)`: escritura que se muestra al usuario.
- `normalizedUsername varchar(100)`: valor normalizado y único.
- `role UserRole`.
- `status AccountStatus`.
- `version integer`.
- `createdAt`, `updatedAt`.

Restricciones e índices:

- `normalizedUsername` único en todo el sistema.
- `username` y `normalizedUsername` no pueden estar vacíos tras recortar espacios exteriores.
- `version > 0`.

`role` es la única fuente de permisos generales de la cuenta. Los permisos de `RECEPTION`, `MONITOR` y `CLIENT` son fijos y se definen en la aplicación; no existen excepciones por usuario ni un campo de permisos individualizables. Las comprobaciones de cuenta activa, ámbito, recurso, estado y reglas de negocio se aplican adicionalmente y no constituyen permisos personalizados.

La normalización se realiza de forma determinista en la aplicación: recorte de espacios exteriores, normalización Unicode acordada y conversión a minúsculas. PostgreSQL protege la unicidad del resultado. No se utiliza `citext` ni una columna generada, para que Prisma lea, escriba y consulte el valor de forma ordinaria.

### 5.2 AuthIdentity

Campos:

- `id UUID`.
- `userAccountId UUID`.
- `provider AuthProvider`.
- `externalSubject varchar(255)`.
- `createdAt`, `lastSeenAt` opcional.

Restricciones:

- único `(provider, externalSubject)`;
- único `(userAccountId, provider)`.

Auth0 es propietario de contraseñas, hashes, verificación de credenciales y sesiones reales. PostgreSQL no almacena contraseñas, tokens o cookies. La aplicación vincula el `sub` de Auth0 con la cuenta local mediante `AuthIdentity`.

Las identidades `MOCK` usan la misma relación y el mismo contexto local. Solo existen en desarrollo o pruebas controladas. Su activación fuera de esos entornos provoca un fallo seguro de configuración.

La implementación exacta del bloqueo de cinco intentos, la inactividad de ocho horas y la invalidación global queda condicionada por la prueba técnica de Auth0 aprobada en la arquitectura. No se duplican prematuramente esas capacidades en PostgreSQL.

### 5.3 Client

Campos:

- `id UUID`.
- `userAccountId UUID` único.
- `firstName varchar(100)`.
- `lastNames varchar(200)`.
- `normalizedLastNames varchar(200)` para búsqueda.
- `phone varchar(50)`.
- `birthDate date` opcional.
- `status ProfileStatus`.
- `isSystemClient boolean`.
- `photoObjectKey`, `photoMimeType`, `photoSizeBytes`, `photoUpdatedAt`, todos opcionales.
- `version`, `createdAt`, `updatedAt`.

Restricciones:

- cuenta uno-a-uno;
- índice de búsqueda sobre `normalizedLastNames`;
- como máximo un cliente con `isSystemClient=true`, mediante índice único parcial;
- los metadatos de fotografía están todos presentes o todos ausentes;
- `photoSizeBytes` entre 1 y 5 MB;
- MIME permitido: JPEG o PNG.

El cliente especial `AltaGym` se identifica mediante `isSystemClient`, no por comparación literal del nombre. Su desactivación se rechaza en el dominio. Clientes normales nunca se eliminan.

### 5.4 Monitor

Campos equivalentes de identidad operativa: `id`, `userAccountId`, nombre, apellidos normalizados, teléfono, estado, `version` y timestamps.

La desactivación se valida transaccionalmente: no puede existir programación, sesión grupal, sesión privada o bloqueo futuro vigente. Un monitor activo debe conservar al menos una disciplina; esta regla entre filas se comprueba en el caso de uso.

### 5.5 Discipline, MonitorDiscipline y Room

`Discipline`: `id`, `code`, `name`, `normalizedName`, `status`, `version`, timestamps. Código y nombre normalizado únicos.

`MonitorDiscipline`: PK compuesta `(monitorId, disciplineId)` y `createdAt`.

`Room`: `id`, `code`, `name`, `normalizedName`, `status`, `version`, timestamps. Código y nombre normalizado únicos.

## 6. Programaciones grupales y modelo híbrido

### 6.1 GroupSchedule

Representa la identidad estable de una programación:

- `id UUID`.
- `status GroupScheduleStatus`.
- `deletedAt` y `deletedByUserId` opcionales.
- `version`, `createdAt`, `updatedAt`.

La eliminación es lógica: deja de generar ocurrencias futuras, pero no elimina revisiones, sesiones materializadas, reservas u ocupaciones históricas.

### 6.2 GroupScheduleRevision

Cada modificación crea una revisión inmutable:

- `id UUID`.
- `groupScheduleId UUID`.
- `disciplineId`, `monitorId`, `roomId`.
- `weekday smallint`, de 1 lunes a 7 domingo.
- `localStartTime time(0)`.
- `capacity integer`.
- `effectiveFrom date`.
- `effectiveUntil date` opcional e inclusivo.
- `createdByUserId`, `createdAt`.

Restricciones:

- aforo entero mayor que cero;
- hora exacta entre 08:00 y 21:00;
- vigencia final igual o posterior a la inicial;
- una sola revisión aplicable por programación y fecha;
- monitor y sala sin otra programación activa en el mismo slot semanal durante una vigencia coincidente.

La última garantía requiere exclusiones o índices SQL personalizados sobre los intervalos de vigencia. La aplicación valida además que el monitor esté activo y tenga asignada la disciplina.

La modificación exige una fecha efectiva local. En una transacción Prisma se cierra la revisión anterior el día anterior y se crea la nueva. Las sesiones materializadas con reservas permanecen vinculadas a su revisión e instantáneas originales.

### 6.3 GroupSession

Representa una ocurrencia materializada:

- `id UUID`.
- `groupScheduleId`, `scheduleRevisionId`.
- `occurrenceDate date` de negocio.
- `startsAt`, `endsAt` UTC.
- referencias efectivas a disciplina, monitor y sala;
- `capacity` como instantánea;
- `activeBookingCount integer`;
- `cancelledBookingCountSnapshot integer` opcional;
- `status GroupSessionStatus`;
- campos de cancelación;
- `createdAt`, `updatedAt`.

Único `(groupScheduleId, occurrenceDate)`. La duración es exactamente 45 minutos. `activeBookingCount` permanece entre cero y el aforo.

Una ocurrencia se materializa cuando recibe su primera reserva, se cancela, necesita ocupaciones concretas para resolver un conflicto o debe conservar una instantánea histórica. Las consultas combinan ocurrencias calculadas desde revisiones con sesiones materializadas, dando prioridad a estas últimas.

Antes de crear una sesión privada, bloqueo o programación que pueda entrar en conflicto con una ocurrencia calculada, la ocurrencia afectada se materializa dentro de la operación coordinada y crea sus ocupaciones de monitor y sala.

### 6.4 Modificación y eliminación

- Modificar una programación crea una revisión futura y no altera sesiones materializadas con reservas.
- Las ocurrencias futuras no materializadas se calculan desde la nueva revisión.
- Eliminar marca `GroupSchedule` como `DELETED` y deja de calcular ocurrencias futuras.
- La eliminación se rechaza mientras existan sesiones futuras con reservas vigentes que no hayan sido canceladas.
- Las sesiones pasadas, canceladas o materializadas permanecen intactas.

## 7. Reservas, sesiones privadas y bloqueos

### 7.1 GroupBooking

Campos:

- `id UUID`.
- `groupSessionId`, `clientId`.
- `status GroupBookingStatus`.
- `bookedByUserId`, `bookedAt`.
- `cancelledAt`, `cancelledByUserId`, `cancellationReasonCode`, `cancellationRequestKey` opcionales.
- `createdAt`, `updatedAt`.

Un índice único parcial sobre `(groupSessionId, clientId)` cuando el estado es `ACTIVE` impide reservas vigentes duplicadas. Prisma no representa este índice completamente y se añade en la migración SQL.

### 7.2 PrivateSession

Campos:

- `id UUID`.
- `clientId`, `monitorId`.
- `startsAt`, `endsAt`.
- `status PrivateSessionStatus`.
- `bookedByUserId`, `bookedAt`.
- campos de cancelación e idempotencia.
- `createdAt`, `updatedAt`.

La duración es exactamente 45 minutos. La hora local de inicio debe estar en punto entre 10:00 y 18:00. Una sesión no se modifica: se cancela y se crea otra.

### 7.3 MonitorBlock

Campos:

- `id UUID`.
- `systemClientId`, `monitorId`.
- `startsAt`, `endsAt`.
- `internalNote` opcional.
- `status MonitorBlockStatus`.
- `createdByUserId`.
- campos de cancelación e idempotencia.
- `createdAt`, `updatedAt`.

Debe pertenecer a una única fecha de Madrid, comenzar y terminar en horas completas, permanecer dentro de 08:00–22:00 y tener fin posterior al inicio. `systemClientId` debe referenciar al cliente marcado como sistema. Un bloqueo no se modifica.

## 8. Recursos y ocupaciones

### 8.1 ScheduleResource

Proporciona una FK común y evita identificadores polimórficos:

- `id UUID`.
- `type ResourceType`.
- uno entre `clientId`, `monitorId` o `roomId`.
- `createdAt`.

Cada relación opcional es única. Un `CHECK` exige exactamente una referencia y coherencia con `type`.

### 8.2 ScheduleOccupancy

Campos:

- `id UUID`.
- `resourceId UUID`.
- `startsAt`, `endsAt`.
- exactamente una relación opcional de origen: `groupSessionId`, `groupBookingId`, `privateSessionId` o `monitorBlockId`.
- `active boolean`.
- `createdAt`, `releasedAt` opcional.

El origen permanece explícito y navegable desde Prisma. Un `CHECK` exige exactamente una FK de origen.

Se crean ocupaciones para:

- sesión grupal: monitor y sala;
- reserva grupal: cliente;
- sesión privada: cliente y monitor;
- bloqueo: monitor.

Cancelar conserva la fila y establece `active=false` y `releasedAt`. La aplicación no borra ocupaciones históricas.

La migración activa `btree_gist` y añade:

```sql
EXCLUDE USING gist (
  resource_id WITH =,
  tstzrange(starts_at, ends_at, '[)') WITH &&
)
WHERE (active);
```

Esta restricción protege concurrentemente los conflictos de clientes, monitores y salas.

## 9. Aforo y última plaza

El contador se gobierna desde una transacción Prisma, sin trigger:

1. Materializar o localizar `GroupSession`.
2. Verificar cliente, sesión, ventana y estado.
3. Ejecutar una actualización atómica condicionada por `status = SCHEDULED` y `activeBookingCount < capacity`, incrementando el contador.
4. Comprobar que se actualizó exactamente una fila; si no, devolver `CAPACITY_EXCEEDED` o el error de estado correspondiente.
5. Crear `GroupBooking` y la ocupación del cliente.
6. Confirmar la transacción.

La restricción `CHECK (active_booking_count BETWEEN 0 AND capacity)` impide estados imposibles. La unicidad parcial evita duplicados. Si la reserva u ocupación falla, la transacción revierte también el incremento.

Al cancelar una reserva `ACTIVE`, una actualización condicionada cambia su estado y decrementa el contador dentro de la misma transacción. Repetir la cancelación no vuelve a decrementar.

Dos peticiones concurrentes por la última plaza solo pueden completar una actualización condicionada. Las pruebas de Neon validan además que contador y reservas activas permanecen alineados.

## 10. Cancelaciones e idempotencia

La cancelación se almacena directamente en cada entidad, mediante:

- estado funcional cancelado;
- `cancelledAt`;
- `cancelledByUserId`;
- `cancellationReasonCode`;
- `cancellationRequestKey` único cuando la operación procede de una petición confirmable;
- `notificationRequested` en sesiones cancelables con aviso.

No se usa una tabla polimórfica común de cancelación. Las relaciones permanecen sencillas en Prisma.

Todas las transiciones usan una actualización condicionada por el estado vigente. La misma clave devuelve el resultado ya creado; una clave distinta sobre un elemento ya cancelado no repite efectos. La cancelación de una sesión, sus reservas, ocupaciones, instantánea de destinatarios y outbox es atómica.

## 11. Notificaciones y outbox

### 11.1 CancellationNotificationBatch

Representa la instantánea de una solicitud de aviso:

- `id UUID`.
- `idempotencyKey` único.
- exactamente una relación: `groupSessionId` o `privateSessionId`.
- `requestedByUserId`, `requestedAt`.
- `recipientCount`.
- `templateCode`.

Un `CHECK` exige exactamente una sesión de origen. La sesión solo puede tener un lote por cancelación confirmada.

### 11.2 Notification

- `id UUID`.
- `batchId`, `clientId`.
- `phoneSnapshot`.
- `channel SMS`.
- `payload jsonb` con la instantánea mínima de disciplina o tipo, fecha y hora.
- `status NotificationStatus`.
- `requestedAt`, `sentAt`, `failedAt`.
- `providerMessageId`, `failureCode`, `failureDetail` opcionales.
- `updatedAt`.

Único `(batchId, clientId)`. Los estados `SENT` y `FAILED` son terminales en el MVP. La instantánea se conserva aunque cambien o se desactiven cliente, teléfono, monitor, sala o disciplina.

### 11.3 OutboxEvent

- `id UUID`.
- `eventType`, `aggregateType`, `aggregateId`.
- `deduplicationKey` único.
- `payload jsonb`.
- `status OutboxStatus`.
- `availableAt`, `claimedAt`, `processedAt`, `failedAt`, `lastError`.
- `version`, `createdAt`, `updatedAt`.

Los SMS se solicitan después del commit. La recuperación técnica de un evento que nunca llegó al proveedor está permitida; el reenvío funcional de un SMS ya solicitado está fuera de alcance. El procesador debe usar reclamación atómica e identificadores del proveedor para impedir duplicados.

## 12. Auditoría de cuenta

`AccountAuditEvent` conserva:

- `id UUID`.
- `accountId`.
- `actorUserId` opcional para acciones del sistema.
- `eventType varchar`.
- `occurredAt`.
- `requestId` opcional.
- `metadata jsonb` con información no sensible.

Es append-only. Registra restablecimientos, cambios de estado e invalidaciones relevantes. Nunca registra contraseñas, hashes, tokens, cookies o secretos.

## 13. Concurrencia optimista

Se usa `version` en entidades editables:

- `UserAccount`;
- `Client`;
- `Monitor`;
- `Discipline`;
- `Room`;
- `GroupSchedule`;
- `OutboxEvent` cuando su reclamación lo necesite.

La actualización incluye `id` y la versión leída, y aumenta el contador en la misma sentencia. Cero filas actualizadas produce `STALE_DATA`. No se añade el contador de forma indiscriminada a hechos append-only o entidades que solo cambian mediante transiciones condicionadas.

## 14. Índices principales

- `UserAccount(normalizedUsername)` único.
- `AuthIdentity(provider, externalSubject)` único.
- Índices de búsqueda de clientes por apellidos normalizados y monitores por nombre/apellidos normalizados.
- `MonitorDiscipline(monitorId, disciplineId)` PK compuesta.
- `GroupSession(groupScheduleId, occurrenceDate)` único.
- `GroupSession(startsAt, status)` y por monitor/sala para calendarios.
- índice parcial único de reserva grupal activa por sesión y cliente.
- índices de `PrivateSession` por cliente/inicio, monitor/inicio y estado.
- índices de `MonitorBlock` por monitor/inicio y estado.
- exclusión GiST de ocupaciones activas.
- `CancellationNotificationBatch(idempotencyKey)` único.
- `Notification(batchId, clientId)` único y por estado.
- `OutboxEvent(deduplicationKey)` único y `(status, availableAt)`.
- claves de idempotencia de cancelación únicas cuando están presentes.

Los listados se paginan con orden estable añadiendo `id` como último criterio de desempate.

## 15. Restricciones SQL personalizadas

Las migraciones Prisma incorporarán de forma revisada:

1. `CREATE EXTENSION IF NOT EXISTS btree_gist`.
2. Exclusión GiST de solapamiento de ocupaciones activas.
3. Exclusión de vigencias superpuestas de revisiones de una programación.
4. Protección de slots recurrentes coincidentes de monitor y sala.
5. Índices únicos parciales para reservas activas y cliente del sistema.
6. `CHECK` de exactamente una FK opcional en recursos, ocupaciones y lotes.
7. `CHECK` de aforo y contador.
8. `CHECK` de duración e intervalos.
9. `CHECK` de coherencia entre estados y fechas de cancelación o envío.

Las reglas civiles que requieran interpretar `Europe/Madrid` se validan principalmente en el dominio. Solo se duplican en SQL cuando puedan expresarse de forma estable y aporten una defensa clara.

## 16. Estrategia de fechas

- Zona oficial de negocio: `Europe/Madrid`.
- Instantes persistidos: UTC en `timestamptz`.
- Fecha de ocurrencia y vigencia recurrente: `date` de Madrid.
- Hora recurrente: `time` de Madrid.
- La aplicación combina fecha y hora civil con `Europe/Madrid` y obtiene el instante antes de persistir.
- Las ventanas de 72 y 3 horas comparan instantes reales.
- Nunca se suman manualmente milisegundos a una fecha local.
- Se prueban explícitamente las transiciones oficiales de horario de marzo y octubre.

## 17. Seed

El seed es repetible mediante claves naturales y `upsert`.

### Común

- Cliente especial `AltaGym`, activo y `isSystemClient=true`.
- Disciplinas: Zumba, Cardio, Pesas y Biocycling.
- Catálogo inicial de salas definido por configuración del proyecto antes del primer despliegue.

### Solo desarrollo y pruebas

- recepción activa;
- monitor activo con al menos una disciplina;
- cliente activo;
- cliente inactivo;
- monitor inactivo;
- identidades `MOCK` con subjects estables y sin contraseñas.

Los perfiles mock no forman parte del seed obligatorio de producción.

## 18. Migraciones

- `prisma/migrations` forma parte del futuro repositorio de código.
- `prisma migrate dev` se ejecuta contra una rama Neon aislada de desarrollo.
- Cada migración se revisa y se amplía con el SQL personalizado necesario.
- `prisma migrate deploy` aplica migraciones controladas en despliegues.
- La aplicación usa la URL agrupada de Neon; las migraciones usan conexión directa.
- `prisma db push` no actualiza entornos compartidos ni producción.
- Una migración aplicada no se reescribe; las correcciones se realizan mediante otra migración.
- Los cambios destructivos requieren estrategia explícita de expansión, migración de datos y retirada posterior.

## 19. Pruebas sin Docker

No se utilizan Docker, Testcontainers, SQLite ni dobles de base de datos como sustitución de PostgreSQL para integración.

Cada desarrollador y ejecución CI utiliza una rama o base aislada de Neon. `TEST_DATABASE_URL` debe poder identificarse de forma segura como entorno de prueba; la suite aborta ante una URL no reconocida o de producción. Antes de la suite se aplican migraciones y los datos se aíslan mediante identificadores únicos, limpieza segura o una rama efímera.

Pruebas obligatorias contra PostgreSQL real:

- dos clientes solicitan simultáneamente la última plaza;
- el mismo cliente confirma dos veces la misma reserva;
- dos actividades coincidentes para un cliente;
- dos asignaciones coincidentes para un monitor;
- dos sesiones grupales coincidentes en una sala;
- bloqueo parcial frente a una actividad;
- cancelación repetida sin doble decremento;
- generación repetida de notificaciones;
- recuperación de outbox tras caída entre commit y procesamiento;
- actualización con versión obsoleta;
- modificación de programación con sesiones reservadas;
- eliminación bloqueada por reservas futuras vigentes;
- conservación de sesiones, reservas, ocupaciones y notificaciones históricas;
- casos temporales en los cambios de hora de Madrid.

Las pruebas de Auth0 se ejecutan separadamente contra un tenant de prueba. Los E2E ordinarios pueden usar autenticación mock y la rama Neon aislada.

## 20. Garantías resultantes

El diseño protege:

- **Última plaza:** actualización atómica condicionada, contador acotado, unicidad parcial y transacción Prisma.
- **Conflictos horarios:** tabla común de ocupaciones y exclusión GiST sobre cliente, monitor y sala.
- **Usuario normalizado:** valor explícito y restricción única global.
- **Cancelaciones:** transición condicionada y clave de idempotencia.
- **Notificaciones:** lote de instantánea, destinatario único y outbox deduplicada.
- **Historial:** estados finales, referencias restrictivas, revisiones inmutables y ocupaciones liberadas sin borrar.
- **Programaciones:** revisiones con vigencia, sesiones materializadas con instantáneas y eliminación lógica controlada.

## 21. Decisiones aprobadas

- Diseño Prisma-first con relaciones explícitas.
- UUID para entidades principales.
- Separación entre cuenta local e identidad Auth0 o mock.
- Nombre de usuario normalizado y único en un campo gestionado por Prisma.
- Revisiones inmutables de programaciones con fecha efectiva.
- Modelo híbrido de ocurrencias calculadas y sesiones materializadas.
- Recursos y ocupaciones comunes con relaciones Prisma explícitas.
- Exclusiones PostgreSQL para solapamientos.
- Contador de aforo gobernado mediante transacciones Prisma, sin trigger.
- Datos de cancelación en cada entidad, sin destino polimórfico común.
- Lote de instantánea, notificaciones por destinatario y outbox transaccional.
- Recuperación técnica de outbox sin reenvío funcional de SMS.
- Enums para estados cerrados.
- `version` solo en entidades realmente editables.
- Estados funcionales y borrado lógico específico, no infraestructura genérica.
- Historial protegido mediante `ON DELETE RESTRICT`.
- Pruebas de integración y concurrencia contra Neon aislado, sin Docker.

## 22. Pendientes de implementación

- SQL exacto de las migraciones personalizadas.
- Nombre y cantidad inicial de salas.
- Resultado de la prueba técnica de Auth0.
- Proveedor SMS y mecanismo operativo del procesador de outbox.
- Contratos de repositorio y casos de uso.

# AltaGym — Glosario de dominio

**Estado:** Activo  
**Última actualización:** 14 de julio de 2026

Este documento define el lenguaje común del MVP de AltaGym. Sus términos deben emplearse de forma coherente en la documentación funcional, la interfaz, el diseño técnico, las pruebas y el código.

Cuando un término usado en otro documento entre en conflicto con este glosario, debe revisarse la incoherencia antes de implementar. El glosario define conceptos; las reglas de comportamiento pertenecen a `BUSINESS_RULES.md` y su representación conceptual a `DATA_MODEL.md`.

## Personas, perfiles y acceso

### Usuario

Identidad con credenciales que puede acceder a AltaGym. Un usuario tiene una cuenta y uno o más permisos según su perfil. No debe usarse como sinónimo de cliente, monitor o miembro del personal cuando se conozca el perfil concreto.

### Cuenta de usuario

Conjunto de credenciales y estado operativo que permite a un usuario autenticarse. Puede estar activa o inactiva y sufrir un bloqueo temporal sin cambiar su estado operativo.

### Sesión de usuario

Acceso autenticado abierto por un usuario. No debe confundirse con una sesión grupal o privada, que son actividades del gimnasio.

### Cliente

Persona inscrita en el gimnasio que puede consultar y reservar actividades. Puede estar activa o inactiva. Se usa **cliente**, no «usuario», «socio» o «alumno», cuando se habla de este rol de negocio.

### Cliente «AltaGym»

Cliente especial del sistema utilizado por el personal autorizado para representar los bloqueos de monitor. Permanece siempre activo y no representa a una persona real.

### Monitor

Profesional que imparte clases grupales y atiende sesiones privadas. Se usa **monitor**, evitando alternarlo con «entrenador», «instructor» o «profesor».

### Recepción/Administración

Único perfil funcional del personal operativo en el MVP. «Recepción» y «administración» pueden describir el puesto habitual, pero tienen exactamente los mismos permisos y no constituyen roles distintos dentro del sistema.

### Activo / Inactivo

Estado operativo de clientes, monitores y cuentas. La desactivación es una baja lógica: impide las operaciones correspondientes sin eliminar la ficha ni el historial.

## Organización de actividades

### Disciplina

Tipo de actividad que un monitor puede impartir, como zumba, cardio, pesas o biocycling. En clases grupales determina qué monitores son compatibles; en sesiones privadas se muestra únicamente como información adicional.

### Sala

Espacio físico en el que se imparte una sesión grupal. No debe confundirse con un bloque horario ni con una disciplina.

### Bloque horario

Unidad temporal utilizada para programar una actividad. Las clases y sesiones normales comienzan a una hora en punto y duran 45 minutos.

### Actividad

Término general que agrupa sesiones grupales, sesiones privadas y, cuando se habla de ocupación o conflictos, bloqueos de monitor. Siempre debe emplearse el término específico cuando el tipo sea relevante.

### Programación grupal

Regla semanal recurrente que define disciplina, día, hora, monitor, sala, aforo y fecha de inicio. Se usa **programación grupal**, no «clase recurrente», cuando se habla de la regla que genera ocurrencias.

### Sesión grupal

Ocurrencia concreta, en una fecha determinada, generada por una programación grupal. Puede estar programada o cancelada. No debe confundirse con la programación recurrente.

### Clase grupal

Nombre orientado al usuario para una actividad colectiva programada. En el modelo conceptual, una clase mostrada en una fecha concreta corresponde a una **sesión grupal**. Se evita «clase pública».

### Sesión privada

Actividad individual reservada por un cliente con un monitor en una fecha y un bloque concretos. Se usa **sesión privada**, evitando «clase privada» y «entrenamiento personal» como términos intercambiables.

### Bloqueo de monitor

Intervalo en el que un monitor no está disponible, representado mediante el cliente especial «AltaGym». Puede abarcar varios bloques horarios y tener una nota interna. No se denomina «ausencia», porque el MVP no dispone de un módulo de ausencias.

### Agenda del monitor / Mi agenda

Vista semanal de solo lectura en la que un monitor consulta sus propias sesiones grupales, sesiones privadas y bloqueos. «Agenda propia» significa exclusivamente la del monitor autenticado.

## Reservas, capacidad y disponibilidad

### Reserva grupal

Relación entre un cliente y una sesión grupal. Se crea como vigente y conserva su estado e historial si se cancela.

### Reserva privada

Expresión de interfaz o de negocio para la acción de reservar una sesión privada. En el modelo conceptual, la propia **sesión privada** contiene la relación entre cliente y monitor; no existe una entidad conceptual separada denominada «reserva privada».

### Reserva

Término general para la participación confirmada de un cliente en una actividad. Debe concretarse como **reserva grupal** o **sesión privada** cuando la distinción afecte a las reglas o al modelo.

### Aforo

Número máximo de reservas grupales vigentes que admite una sesión grupal. Es un entero mayor que cero definido en la programación grupal.

### Completa

Condición calculada de una sesión grupal cuando sus reservas vigentes alcanzan el aforo. No es un estado persistente y no debe modelarse como equivalente a `programada` o `cancelada`.

### Disponibilidad

Condición calculada que indica que una persona, un monitor, una sala o una plaza puede utilizarse en un bloque conforme a las reglas aplicables. Debe comprobarse de nuevo al confirmar una operación.

### Conflicto horario

Coincidencia no permitida entre actividades o bloqueos que ocupan el mismo intervalo para un monitor, cliente o sala, según corresponda.

### Ventana de reserva

Intervalo en el que el cliente puede reservar: desde 72 horas antes hasta 3 horas antes del inicio de la actividad, incluidos ambos límites.

### Ventana de cancelación

Plazo en el que el cliente puede cancelar: hasta 3 horas antes del inicio, incluido el límite. Recepción/Administración puede cancelar en cualquier momento.

## Estados y cancelaciones

### Vigente

Estado normal de una reserva grupal o un bloqueo mientras no haya sufrido una cancelación. No significa necesariamente «futuro»: un elemento puede seguir siendo vigente después de que transcurra su fecha.

### Confirmada

Estado inicial de una sesión privada. Es el equivalente funcional al estado normal sin cancelación, pero se conserva el término **confirmada** para sesiones privadas y **vigente** para reservas grupales.

### Programada

Estado inicial de una sesión grupal concreta. No debe usarse para describir el estado de una reserva grupal o de una sesión privada.

### Cancelada por el cliente

Estado final de una reserva grupal o sesión privada cuando el propio cliente cancela dentro del plazo permitido.

### Cancelada por el gimnasio

Estado final de una reserva grupal o sesión privada cuando Recepción/Administración cancela la reserva individual o la sesión completa correspondiente.

### Cancelada

Estado final de una sesión grupal concreta. En el caso de un bloqueo se usa **cancelado**. Cuando se hable de una reserva o sesión privada debe indicarse quién originó la cancelación mediante **cancelada por el cliente** o **cancelada por el gimnasio**.

### Baja lógica

Desactivación que conserva la ficha, las relaciones y el historial. No equivale a eliminar físicamente el registro.

## Comunicaciones y trazabilidad

### Notificación

Registro de un aviso por SMS solicitado al cancelar una sesión completa. Se crea para cada cliente afectado a partir de la instantánea de reservas vigentes y puede quedar pendiente, enviado o fallido.

### Nota interna

Texto operativo opcional asociado a un bloqueo de monitor. Solo puede verlo el personal autorizado; nunca se muestra al cliente ni al monitor.

### Auditoría

Información que permite conocer quién realizó una acción relevante y cuándo. No es un historial editable ni contiene contraseñas.

## Convenciones terminológicas

| Usar | Evitar o precisar | Motivo |
|---|---|---|
| Cliente | Usuario, socio, alumno | «Usuario» es genérico; los demás términos no son oficiales. |
| Monitor | Entrenador, instructor, profesor | Unifica el rol profesional. |
| Clase grupal | Clase pública | Es el término aprobado para la interfaz y la documentación funcional. |
| Programación grupal | Clase recurrente | Distingue la regla semanal de sus ocurrencias. |
| Sesión grupal | Clase, cuando se habla del modelo | Identifica una ocurrencia concreta. |
| Sesión privada | Clase privada, entrenamiento personal | Es el término oficial del dominio. |
| Recepción/Administración | Dos roles con permisos distintos | En el MVP constituyen un único perfil funcional. |
| Bloqueo de monitor | Ausencia | No existe un módulo de ausencias en el MVP. |
| Vigente | Activa, confirmada, futura | Es el estado oficial de la reserva grupal; no expresa temporalidad. |
| Completa | Estado «completa» | Es una condición calculada, no persistente. |

## Mantenimiento

- Toda decisión que introduzca o cambie un concepto de negocio debe revisar este documento.
- Un término nuevo debe tener una definición única, indicar sinónimos desaconsejados cuando sean relevantes y mantener coherencia con las reglas y el modelo conceptual.
- El diseño técnico puede definir nombres de implementación, pero debe conservar la correspondencia explícita con este lenguaje de dominio.
- Las discrepancias terminológicas deben resolverse en la documentación oficial antes de trasladarlas a la interfaz, las pruebas o el código.

# api-foundation Specification

## Purpose

Proporciona una base API ejecutable para AltaGym2 que permite comprobar el arranque y la compilación del servicio sin incorporar endpoints de negocio.

## Requirements

### Requirement: Arranque local de la aplicación API
El workspace SHALL permitir servir localmente la aplicación API y atender peticiones en la URL que informa el servidor de desarrollo.

#### Scenario: Servidor API disponible
- **WHEN** una persona ejecuta `pnpm nx serve api`
- **THEN** la aplicación Next.js queda disponible en la URL local indicada por Nx sin errores de arranque

### Requirement: Endpoint de salud
La API SHALL exponer `GET /api/health` con una respuesta HTTP 200 cuyo cuerpo JSON sea `{"status":"ok"}`.

#### Scenario: Comprobación de salud correcta
- **WHEN** una persona envía una petición HTTP `GET /api/health` a la aplicación API en ejecución
- **THEN** la respuesta tiene estado 200, tipo de contenido JSON y el cuerpo exacto `{"status":"ok"}`

### Requirement: Compilación de producción de la API
El workspace SHALL proporcionar un objetivo Nx de compilación de producción para la aplicación API `api`.

#### Scenario: Compilación de producción correcta
- **WHEN** una persona ejecuta `pnpm nx build api --configuration=production`
- **THEN** Nx finaliza correctamente y genera los artefactos de producción en el directorio de salida configurado

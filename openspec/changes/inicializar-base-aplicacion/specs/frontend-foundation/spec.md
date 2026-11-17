# Spec Delta

## Purpose

Proporciona una base frontend reproducible para desarrollar y compilar AltaGym2, con Angular Material y Tailwind CSS disponibles desde la primera aplicación.

## ADDED Requirements

### Requirement: Instalación reproducible del workspace
El repositorio SHALL permitir instalar todas las dependencias de la aplicación desde un clon limpio usando el lockfile versionado y versiones documentadas de Node.js y pnpm compatibles con Angular 22.

#### Scenario: Instalación desde un clon limpio
- **WHEN** una persona clona el repositorio y ejecuta `pnpm install --frozen-lockfile` con las versiones documentadas
- **THEN** la instalación finaliza correctamente sin modificar el lockfile ni requerir dependencias globales adicionales

### Requirement: Arranque de la aplicación web
El workspace SHALL proporcionar un comando documentado para servir localmente la aplicación Angular `web` mediante Nx.

#### Scenario: Servidor de desarrollo disponible
- **WHEN** una persona ejecuta `pnpm nx serve web` después de instalar las dependencias
- **THEN** la aplicación responde en la URL local indicada y muestra su pantalla inicial sin errores de ejecución

### Requirement: Compilación de producción
El workspace SHALL proporcionar un objetivo Nx de compilación de producción para la aplicación Angular `web`.

#### Scenario: Compilación limpia
- **WHEN** una persona ejecuta `pnpm nx build web` después de instalar las dependencias
- **THEN** Nx finaliza correctamente y genera los artefactos de producción en el directorio de salida configurado

### Requirement: Uso conjunto de Angular Material y Tailwind CSS
La aplicación SHALL aplicar el tema de Angular Material a sus componentes Material y las utilidades de Tailwind CSS a su maquetación, sin que los estilos base de Tailwind desactiven el tema o la presentación de los componentes Material.

#### Scenario: Componentes y utilidades visibles al servir la aplicación
- **WHEN** una persona abre la pantalla inicial servida localmente
- **THEN** un componente Material de demostración conserva el estilo de su tema y un elemento de maquetación con una utilidad Tailwind muestra el espaciado esperado, ambos sin errores de estilos en la consola

#### Scenario: Componentes y utilidades incluidos en producción
- **WHEN** se compila la aplicación de producción
- **THEN** el CSS emitido incluye los estilos del tema Material y las utilidades Tailwind usadas por la pantalla inicial

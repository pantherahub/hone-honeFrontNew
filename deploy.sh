#!/bin/bash

# Detener el script si ocurre algún error
set -e

# Ruta a la aplicación Angular
APP_DIR=$(pwd)
BUILD_DIR="$APP_DIR/dist"
ENVIRONMENT=${1:-"prod"}
APP_FOLDER="prestadores"


case "$ENVIRONMENT" in
  prod) BUILD_SCRIPT="build:prod" ;;
  test) BUILD_SCRIPT="build:test" ;;
  dev)  BUILD_SCRIPT="build" ;;
  *)
    echo "Error: ambiente '$ENVIRONMENT' no válido. Usa: prod, test o dev."
    exit 1
    ;;
esac

USER_DIR=$(echo "$HOME" | sed 's/\\/\\\\/g') # Escapar caracteres en Windows
COMPILED_FOLDER="$USER_DIR/www/hone-solutions-repos/fronts-compiled"
TARGET_DIR="$COMPILED_FOLDER/$APP_FOLDER/$ENVIRONMENT"

# Usar nvm para seleccionar la versión de Node.js
NODE_VERSION="22.23.0"
NVM_DIR_PATH=$(cygpath -u "${NVM_HOME:-$USER_DIR/AppData/Local/nvm}")
export PATH="$NVM_DIR_PATH/v$NODE_VERSION:$PATH"
nvm use "$NODE_VERSION"

# Cambiar al directorio de la aplicación
cd "$APP_DIR"

# Instalar dependencias
echo "Instalando dependencias..."
npm install

# Construir la aplicación Angular
echo "Construyendo la aplicación Angular con el ambiente: $ENVIRONMENT..."
npm run "$BUILD_SCRIPT"

# Verificar si la compilación se realizó correctamente
if [ ! -d "$BUILD_DIR" ]; then
  echo "Error: la compilación no se realizó correctamente."
  exit 1
fi

echo "Se valida si existe la carpeta"

if [ -d "$TARGET_DIR" ]; then
  echo "Eliminando la carpeta '$APP_FOLDER'/$ENVIRONMENT..."
  chmod -R u+w "$TARGET_DIR"
  rm -rf "$TARGET_DIR"
fi
echo "Creando la carpeta '$APP_FOLDER'/$ENVIRONMENT..."
mkdir -p "$TARGET_DIR"

echo "Copiando al directorio $TARGET_DIR..."
cp -r "$BUILD_DIR" "$TARGET_DIR"

echo "Completo!"

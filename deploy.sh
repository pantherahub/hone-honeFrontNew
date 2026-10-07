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

# Usar nvm para seleccionar la versión de Node.js.
# nvm-windows instala en v18.20.4, no en una carpeta v18.
# `nvm use` recrea el symlink de "C:\Program Files\nodejs" y, en el
# mismo proceso de Git Bash, npm deja de verse ahí. El binario real
# va primero en PATH para que npm y node se resuelvan igual.
NODE_VERSION="18"
NVM_DIR_PATH=$(cygpath -u "${NVM_HOME:-$HOME/AppData/Roaming/nvm}")
NODE_BIN_DIR=$(command ls -d "$NVM_DIR_PATH"/v"$NODE_VERSION".* 2>/dev/null | sort -V | tail -n 1 || true)
if [ -z "$NODE_BIN_DIR" ] || [ ! -x "$NODE_BIN_DIR/npm" ]; then
  echo "Error: no se encontró Node.js $NODE_VERSION en $NVM_DIR_PATH"
  exit 1
fi
export PATH="$NODE_BIN_DIR:$PATH"
hash -r
nvm use "$NODE_VERSION"
hash -r

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

nvm use 22
echo "Completo!"

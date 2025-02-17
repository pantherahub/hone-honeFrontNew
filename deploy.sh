#!/bin/bash

# Detener el script si ocurre algún error
set -e

# Ruta a la aplicación Angular
APP_DIR=$(pwd)
BUILD_DIR="$APP_DIR/dist"
ENVIRONMENT=${1:-"prod"}
APP_FOLDER="prestadores"

USER_DIR=$(echo "$HOME" | sed 's/\\/\\\\/g') # Escapar caracteres en Windows
COMPILED_FOLDER="$USER_DIR/www/hone-solutions-repos/fronts-compiled"

# Usar nvm para seleccionar la versión de Node.js
export PATH=$PATH:$USER_DIR/AppData/Roaming/nvm/v18.20.4/
nvm use 18

# Cambiar al directorio de la aplicación
cd "$APP_DIR"

# Instalar dependencias
echo "Instalando dependencias..."
npm install

# Construir la aplicación Angular
echo "Construyendo la aplicación Angular con el ambiente: $ENVIRONMENT..."
if [ "$ENVIRONMENT" = "prod" ]; then
  npm run build:prod
else
  npm run build:test
fi

# Verificar si la compilación se realizó correctamente
if [ ! -d "$BUILD_DIR" ]; then
  echo "Error: la compilación no se realizó correctamente."
  exit 1
fi

echo "Se valida si existe la carpeta"

if [ "$ENVIRONMENT" = "prod" ]; then
      if [ -d "$COMPILED_FOLDER/$APP_FOLDER/prod" ]; then
        echo "Eliminando la carpeta '$APP_FOLDER'/prod..."
        chmod -R u+w "$COMPILED_FOLDER/$APP_FOLDER/prod"
	      rm -rf "$COMPILED_FOLDER/$APP_FOLDER/prod"
      fi
      echo "Creando la carpeta '$APP_FOLDER'/prod..."
      mkdir "$COMPILED_FOLDER/$APP_FOLDER/prod"
else
      if [ -d "$COMPILED_FOLDER/$APP_FOLDER/test" ]; then
        echo "Eliminando la carpeta '$APP_FOLDER'/test..."
        chmod -R u+w "$COMPILED_FOLDER/$APP_FOLDER/test"
        rm -rf "$COMPILED_FOLDER/$APP_FOLDER/test"
      fi
      echo "Creando la carpeta '$APP_FOLDER'/test..."
      mkdir "$COMPILED_FOLDER/$APP_FOLDER/test"
fi

echo "Copiando al directorio $COMPILED_FOLDER/$APP_FOLDER..."
if [ "$ENVIRONMENT" = "prod" ]; then
  cp -r "$BUILD_DIR" "$COMPILED_FOLDER/$APP_FOLDER/prod"
else
  cp -r "$BUILD_DIR" "$COMPILED_FOLDER/$APP_FOLDER/test"
fi

echo "Completo!"










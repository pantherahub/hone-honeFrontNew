#!/bin/bash

# Detener el script si ocurre algún error
set -e

# Ruta a la aplicación Angular
APP_DIR=$(pwd)
BUILD_DIR="$APP_DIR/dist"
ENVIRONMENT=${1:-"prod"}
APP_FOLDER="hone-honeFrontNew"
NGINX_FOLDER="/var/www/html"

# Usar nvm para seleccionar la versión de Node.js
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
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
# Verificar si la carpeta existe
if [ -d "$NGINX_FOLDER/$APP_FOLDER" ]; then
    echo "La carpeta '$APP_FOLDER' ya existe en $directorio."
else
    echo "La carpeta '$APP_FOLDER' no existe en $directorio. Creando la carpeta..."
    sudo mkdir $NGINX_FOLDER/$APP_FOLDER
    echo "Carpeta '$APP_FOLDER' creada en $directorio."
fi

echo "Copiando al directorio $NGINX_FOLDER/$APP_FOLDER..."
sudo cp -r "$BUILD_DIR" $NGINX_FOLDER/$APP_FOLDER/dist

echo "Cambio del usuario para: $NGINX_FOLDER/$APP_FOLDER..."
cd $NGINX_FOLDER
sudo chown -R honesolutions:honesolutions ./$APP_FOLDER

echo "Completo!"



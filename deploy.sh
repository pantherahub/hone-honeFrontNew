#!/bin/bash

# Detener el script si ocurre algún error
set -e

# Ruta a la aplicación Angular
APP_DIR="/home/honesolutions/hone-honeFrontNew"
BUILD_DIR="$APP_DIR/dist"
ENVIRONMENT=${1:-"prod"}

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

echo "Copiando al directorio /var/www/html/hone-honeFrontNew..."
sudo cp -r "$BUILD_DIR" /var/www/html/hone-honeFrontNew/dist

echo "Cambio del usuario para: /var/www/html/hone-honeFrontNew..."
cd /var/www/html
sudo chown -R honesolutions:honesolutions ./hone-honeFrontNew

echo "Completo!"



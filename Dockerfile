# --- Etapa 1: Construir el Frontend ---
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copiar archivos de dependencias e instalar
COPY frontend/package*.json ./
RUN npm install

# Copiar el resto del código fuente del frontend
COPY frontend/ ./

# Construir la aplicación de producción
RUN npm run build


# --- Etapa 2: Preparar el Backend y la Imagen Final ---
FROM node:18-alpine AS production

WORKDIR /app

# Copiar dependencias del backend e instalar solo para producción
COPY backend/package*.json ./backend/
RUN npm install --prefix backend --only=production

# Copiar el código fuente del backend
COPY backend/ ./backend/

# Copiar los archivos construidos del frontend a una carpeta pública en el backend
COPY --from=frontend-builder /app/frontend/dist ./backend/public

# Exponer el puerto en el que corre el backend
EXPOSE 5001

# Comando para iniciar el servidor
CMD ["node", "backend/src/index.js"]
# Etap 1: Budowanie i instalacja zależności
FROM node:20-alpine AS build 
WORKDIR /app
COPY package*.json ./
RUN npm install --production

# Etap 2: Finalny obraz produkcyjny
FROM node:20-alpine 

# Informacje  
LABEL org.opencontainers.image.authors="Sandra i Zaremba"
LABEL org.opencontainers.image.title="WeatherApp"

WORKDIR /app

# Kopiowanie niezbędnych plikow z etapu budowania
COPY --from=build /app/node_modules ./node_modules

# Skopiowanie źródła aplikacji
COPY server.js .
COPY app/ ./app/

# Optymalizacja warstw i zdrowia kontenera 
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

EXPOSE 3000
USER node
CMD ["node", "server.js"]
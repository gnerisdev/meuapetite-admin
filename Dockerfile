FROM node:18-alpine as build

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código da aplicação
COPY . .

# Build da aplicação React
# A variável REACT_APP_API_URL pode ser passada no docker-compose
ARG REACT_APP_SERVER_IP=192.168.0.104
ARG REACT_APP_API_PORT=3000
ARG REACT_APP_API_URL=http://192.168.0.104:3000/api
ARG REACT_APP_MENU_BASE_URL=http://192.168.0.104:3001

RUN npm run build

# Estágio de produção com nginx
FROM nginx:alpine

# Copiar build para nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuração customizada do nginx (opcional)
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


# STAGE 1: BUILD FRONTEND #
FROM node:24-alpine AS build-frontend
WORKDIR /usr/src/app
COPY tsconfig.base.json ./
WORKDIR /usr/src/app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# STAGE 2: BUILD BACKEND #
FROM node:24-alpine AS build-backend
WORKDIR /usr/src/app
COPY tsconfig.base.json ./
WORKDIR /usr/src/app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
RUN npm run build
RUN npm prune --omit=dev

# STAGE 3: PRODUCTION IMAGE #
FROM nginx:1.31.5-alpine
RUN apk add --no-cache nodejs

WORKDIR /usr/src/app/backend
COPY --from=build-backend /usr/src/app/backend/dist ./dist
COPY --from=build-backend /usr/src/app/backend/node_modules ./node_modules
COPY --from=build-backend /usr/src/app/backend/package.json ./package.json

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build-frontend /usr/src/app/frontend/dist /usr/share/nginx/html

COPY docker-nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80
ENV NODE_ENV=production

CMD ["/start.sh"]
